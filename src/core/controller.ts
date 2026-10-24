import { applyAction, createEmptySlots } from './state.ts';
import type { ReminderAction } from './state.ts';
import { loadSlots, saveSlots } from './storage.ts';
import type { StoragePort } from './storage.ts';
import type { PersistenceStatus, ReminderSlot } from './types.ts';

interface Snapshot {
  slots: ReminderSlot[];
  persistenceStatus: PersistenceStatus;
  error: string | null;
}

const READ_ERROR = 'Saved reminders could not be loaded. Changes will stay in this tab; existing saved data has been preserved.';
const WRITE_ERROR = 'Reminders work in this tab, but could not be saved. Keep this tab open to retain changes. Other tabs will not be synced until you reload.';

/** Sequential actions rebase on disk. localStorage offers no transaction across tabs. */
export function createReminderController(getStorage: () => StoragePort) {
  let slots = createEmptySlots();
  let memoryOnly = false;
  let persistenceError: string | null = null;
  let actionError: string | null = null;
  const listeners = new Set<() => void>();
  try { slots = loadSlots(getStorage()); }
  catch { memoryOnly = true; persistenceError = READ_ERROR; }
  let snapshot: Snapshot = makeSnapshot();

  function makeSnapshot(): Snapshot {
    return { slots, persistenceStatus: memoryOnly ? 'unavailable' : 'saved', error: [actionError, persistenceError].filter(Boolean).join(' ') || null };
  }
  function publish() {
    const next = makeSnapshot();
    if (JSON.stringify(next) === JSON.stringify(snapshot)) return;
    snapshot = next;
    listeners.forEach(listener => listener());
  }
  function readLatest() {
    if (memoryOnly) return;
    try { slots = loadSlots(getStorage()); }
    catch { memoryOnly = true; persistenceError = READ_ERROR; }
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    // Incoming state is read-only: never echo another tab's storage event as a write.
    refresh() { readLatest(); publish(); },
    dispatch(action: ReminderAction): boolean {
      readLatest();
      try {
        const next = applyAction(slots, action);
        actionError = null;
        if (next !== slots) {
          slots = next;
          if (!memoryOnly) {
            try { saveSlots(getStorage(), slots); }
            catch { memoryOnly = true; persistenceError = WRITE_ERROR; }
          }
        }
        publish();
        // Storage failure still accepts the change in this tab. Validation rejects it.
        return true;
      } catch (cause) {
        actionError = cause instanceof Error ? cause.message : 'The reminder could not be updated.';
        publish();
        return false;
      }
    },
  };
}
