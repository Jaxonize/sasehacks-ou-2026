export type SlotId = 1 | 2 | 3 | 4;

export interface GoogleTaskSource {
  provider: 'google-tasks';
  taskListId: string;
  taskId: string;
  dueDate: string;
}

export interface Reminder {
  id: string;
  title: string;
  completed: boolean;
  urgent?: boolean;
  source?: GoogleTaskSource;
}

export interface ReminderSlot {
  slotId: SlotId;
  controlLabel: string;
  reminder: Reminder | null;
}

export type PersistenceStatus = 'saved' | 'saving' | 'unavailable';

export interface ReminderViewProps {
  slots: ReminderSlot[];
  persistenceStatus?: PersistenceStatus;
  error?: string | null;
  // false rejects the draft; true/void accepts it, including memory-only changes.
  onAdd: (slotId: SlotId, title: string, urgent: boolean) => boolean | void;
  onEdit: (slotId: SlotId, title: string, urgent: boolean) => boolean | void;
  onComplete: (slotId: SlotId) => void;
  onUndo: (slotId: SlotId) => void;
  onActivateControl: (slotId: SlotId) => void;
}
