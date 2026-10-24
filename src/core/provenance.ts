import type { GoogleTaskSource } from './types.ts';

export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isGoogleTaskSource(value: unknown): value is GoogleTaskSource {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return item.provider === 'google-tasks' && ['taskListId', 'taskId'].every(key => typeof item[key] === 'string' && !!(item[key] as string).trim() && (item[key] as string).length <= 1024) && isDateKey(item.dueDate);
}

export function sameGoogleTask(a: GoogleTaskSource | undefined, b: GoogleTaskSource): boolean {
  return a?.provider === b.provider && a.taskListId === b.taskListId && a.taskId === b.taskId;
}

export function copyGoogleTaskSource(source: GoogleTaskSource): GoogleTaskSource {
  // Only these four metadata fields may enter saved state; never copy OAuth data.
  return { provider: 'google-tasks', taskListId: source.taskListId, taskId: source.taskId, dueDate: source.dueDate };
}
