import { useEffect, useState, useSyncExternalStore } from 'react';
import { createReminderController } from './controller.ts';
import { STORAGE_KEY } from './storage.ts';
import type { GoogleTaskSource, ReminderViewProps, SlotId } from './types.ts';

export function useReminders(): ReminderViewProps & { onImportGoogle: (slotId: SlotId, title: string, source: GoogleTaskSource) => boolean } {
  const [controller] = useState(() => createReminderController(() => window.localStorage));
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      try {
        if (event.storageArea !== window.localStorage) return;
      } catch { return; }
      controller.refresh();
    }
    window.addEventListener('storage', onStorage);
    // Cover a write between initial render and subscription installation.
    controller.refresh();
    return () => window.removeEventListener('storage', onStorage);
  }, [controller]);

  return {
    ...snapshot,
    onAdd: (slotId, title) => controller.dispatch({ type: 'add', slotId, title, id: globalThis.crypto?.randomUUID?.() ?? `reminder-${Date.now()}-${Math.random().toString(36).slice(2)}` }),
    onEdit: (slotId, title) => controller.dispatch({ type: 'edit', slotId, title }),
    onImportGoogle: (slotId, title, source) => controller.dispatch({ type: 'importGoogle', slotId, title, source, id: globalThis.crypto?.randomUUID?.() ?? `reminder-${Date.now()}-${Math.random().toString(36).slice(2)}` }),
    onComplete: slotId => { controller.dispatch({ type: 'complete', slotId }); },
    onUndo: slotId => { controller.dispatch({ type: 'undo', slotId }); },
    onActivateControl: slotId => { controller.dispatch({ type: 'activateControl', slotId }); },
  };
}
