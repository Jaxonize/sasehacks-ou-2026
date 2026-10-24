export interface CompletionSlot {
  slotId: number;
  reminder: { id: string; completed: boolean } | null;
}

/** Only an existing reminder's false-to-true transition earns encouragement. */
export function completionTransitions(
  slots: readonly CompletionSlot[],
  previous: ReadonlyMap<string, boolean> | null,
) {
  const current = new Map<string, boolean>();
  const newlyCompleted: string[] = [];
  for (const slot of slots) {
    if (!slot.reminder) continue;
    const key = `${slot.slotId}:${slot.reminder.id}`;
    current.set(key, slot.reminder.completed);
    if (previous?.get(key) === false && slot.reminder.completed) newlyCompleted.push(key);
  }
  return { current, newlyCompleted };
}
