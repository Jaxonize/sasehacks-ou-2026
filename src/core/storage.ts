import { createEmptySlots, validateTitle } from './state.ts';
import type { GoogleTaskSource, ReminderSlot } from './types.ts';
import { copyGoogleTaskSource, isGoogleTaskSource, sameGoogleTask } from './provenance.ts';

export const STORAGE_KEY = 'sasehacks-ou-2026.reminders.v1';
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;

export function loadSlots(storage: StoragePort): ReminderSlot[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return createEmptySlots();
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('slots' in data) || !Array.isArray(data.slots) || data.slots.length !== 4) {
    throw new Error('Saved reminder data is invalid.');
  }
  const rows = data.slots;
  const seen = new Set<string>();
  const sources: GoogleTaskSource[] = [];
  return createEmptySlots().map((slot, index) => {
    const row: unknown = rows[index];
    if (!row || typeof row !== 'object' || !('slotId' in row) || row.slotId !== slot.slotId || !('reminder' in row)) throw new Error('Saved slot mapping is invalid.');
    const reminder = row.reminder;
    if (reminder === null) return slot;
    if (!reminder || typeof reminder !== 'object' || !('id' in reminder) || typeof reminder.id !== 'string' || !reminder.id || seen.has(reminder.id) || !('title' in reminder) || typeof reminder.title !== 'string' || validateTitle(reminder.title) || !('completed' in reminder) || typeof reminder.completed !== 'boolean') throw new Error('Saved reminder is invalid.');
    if ('urgent' in reminder && typeof reminder.urgent !== 'boolean') throw new Error('Saved reminder urgency is invalid.');
    seen.add(reminder.id);
    const source = 'source' in reminder ? reminder.source : undefined;
    let provenance: GoogleTaskSource | undefined;
    if (source !== undefined) {
      if (!isGoogleTaskSource(source) || sources.some(item => sameGoogleTask(item, source))) throw new Error('Saved Google task information is invalid.');
      provenance = copyGoogleTaskSource(source);
      sources.push(provenance);
    }
    return { ...slot, reminder: { id: reminder.id, title: reminder.title.trim(), completed: reminder.completed, ...('urgent' in reminder ? { urgent: reminder.urgent as boolean } : {}), ...(provenance ? { source: provenance } : {}) } };
  });
}

export function saveSlots(storage: StoragePort, slots: ReminderSlot[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, slots }));
}
