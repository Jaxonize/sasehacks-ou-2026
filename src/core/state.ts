import type { GoogleTaskSource, ReminderSlot, SlotId } from './types.ts';
import { copyGoogleTaskSource, isGoogleTaskSource, sameGoogleTask } from './provenance.ts';

export const SLOT_IDS: readonly SlotId[] = [1, 2, 3, 4];
export const MAX_TITLE_LENGTH = 200;

export function createEmptySlots(): ReminderSlot[] {
  return SLOT_IDS.map((slotId) => ({
    slotId,
    controlLabel: slotId <= 2 ? `Dial ${slotId}` : `Switch ${slotId - 2}`,
    reminder: null,
  }));
}

export type ReminderAction =
  | { type: 'add'; slotId: SlotId; title: string; id: string }
  | { type: 'importGoogle'; slotId: SlotId; title: string; id: string; source: GoogleTaskSource }
  | { type: 'edit'; slotId: SlotId; title: string }
  | { type: 'complete' | 'undo' | 'activateControl'; slotId: SlotId };

export function validateTitle(title: string): string | null {
  if (!title.trim()) return 'Enter a reminder title.';
  if (title.trim().length > MAX_TITLE_LENGTH) return `Keep titles to ${MAX_TITLE_LENGTH} characters or fewer.`;
  return null;
}

export function applyAction(slots: ReminderSlot[], action: ReminderAction): ReminderSlot[] {
  if (!SLOT_IDS.includes(action.slotId)) throw new Error('Unknown reminder slot.');
  if (action.type === 'add' || action.type === 'edit' || action.type === 'importGoogle') {
    const error = validateTitle(action.title);
    if (error) throw new Error(error);
  }
  if (action.type === 'importGoogle') {
    if (!isGoogleTaskSource(action.source)) throw new Error('Google task information is invalid. Refresh the import list.');
    if (slots.some(slot => sameGoogleTask(slot.reminder?.source, action.source))) throw new Error('This Google task is already assigned to a reminder slot.');
  }
  let changed = false;
  const next = slots.map((slot) => {
    if (slot.slotId !== action.slotId) return slot;
    if (action.type === 'add' || action.type === 'importGoogle') {
      if (slot.reminder) throw new Error('This slot already has a reminder. Edit it instead.');
      if (!action.id || slots.some((item) => item.reminder?.id === action.id)) throw new Error('Reminder ID must be unique.');
      changed = true;
      return { ...slot, reminder: { id: action.id, title: action.title.trim(), completed: false, ...(action.type === 'importGoogle' ? { source: copyGoogleTaskSource(action.source) } : {}) } };
    }
    if (!slot.reminder) {
      if (action.type === 'edit') throw new Error('This reminder is no longer in this slot. Your draft has not been saved.');
      return slot;
    }
    const reminder = action.type === 'edit'
      ? { ...slot.reminder, title: action.title.trim() }
      : { ...slot.reminder, completed: action.type !== 'undo' };
    if (reminder.title === slot.reminder.title && reminder.completed === slot.reminder.completed) return slot;
    changed = true;
    return { ...slot, reminder };
  });
  return changed ? next : slots;
}
