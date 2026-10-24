import { isDateKey } from '../../core/provenance.ts';
import type { GoogleTaskSource } from '../../core/types.ts';

export const TASKS_READONLY = 'https://www.googleapis.com/auth/tasks.readonly';
export interface GoogleTaskCandidate {
  title: string;
  listTitle: string;
  source: GoogleTaskSource;
}
export class GoogleTasksError extends Error {
  status: number;
  constructor(message: string, status = 0) { super(message); this.status = status; }
}

export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Google Tasks due is a calendar date, not an instant to convert to local time.
export function dueDateKey(due: unknown): string | null {
  if (typeof due !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(due)) return null;
  const day = due.slice(0, 10);
  return isDateKey(day) ? day : null;
}

type RecordValue = Record<string, unknown>;
export async function fetchTodaysGoogleTasks(token: string, day: string, signal?: AbortSignal, request: typeof fetch = fetch): Promise<GoogleTaskCandidate[]> {
  if (!token || !isDateKey(day)) throw new GoogleTasksError('Reconnect to Google and refresh today’s tasks.');
  async function pages(path: string, parameters: Record<string, string> = {}): Promise<RecordValue[]> {
    const items: RecordValue[] = [];
    const seenPages = new Set<string>();
    let pageToken = '';
    do {
      const url = new URL(`https://tasks.googleapis.com/tasks/v1/${path}`);
      url.search = new URLSearchParams({ ...parameters, maxResults: '100', ...(pageToken ? { pageToken } : {}) }).toString();
      const response = await request(url.toString(), { method: 'GET', headers: { Authorization: `Bearer ${token}` }, signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' });
      if (!response.ok) {
        const message = response.status === 401 ? 'Google access expired. Connect again.'
          : response.status === 403 ? 'Google denied access. Check the Tasks API and test-user setup.'
          : response.status === 429 ? 'Google is limiting requests. Try again shortly.'
          : 'Google Tasks could not be loaded. Try again.';
        throw new GoogleTasksError(message, response.status);
      }
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new GoogleTasksError('Google returned an unexpected response.');
      const result = data as RecordValue;
      if (result.items !== undefined && (!Array.isArray(result.items) || result.items.some(item => !item || typeof item !== 'object' || Array.isArray(item)))) throw new GoogleTasksError('Google returned an unexpected task list.');
      items.push(...((result.items ?? []) as RecordValue[]));
      if (result.nextPageToken !== undefined && typeof result.nextPageToken !== 'string') throw new GoogleTasksError('Google returned an unexpected page token.');
      pageToken = (result.nextPageToken as string | undefined) ?? '';
      if (pageToken && seenPages.has(pageToken)) throw new GoogleTasksError('Google returned a repeated page. Please refresh.');
      seenPages.add(pageToken);
    } while (pageToken);
    return items;
  }
  const lists = await pages('users/@me/lists');
  const candidates: GoogleTaskCandidate[] = [];
  const seenTasks = new Set<string>();
  for (const list of lists) {
    if (typeof list.id !== 'string' || !list.id) throw new GoogleTasksError('Google returned a task list without an ID.');
    const tasks = await pages(`lists/${encodeURIComponent(list.id)}/tasks`, { showCompleted: 'false', showDeleted: 'false', showHidden: 'false', showAssigned: 'true' });
    for (const task of tasks) {
      if (task.status !== 'needsAction' || task.deleted || task.hidden || dueDateKey(task.due) !== day) continue;
      if (typeof task.id !== 'string' || !task.id || typeof task.title !== 'string' || !task.title.trim()) continue;
      const key = JSON.stringify([list.id, task.id]);
      if (seenTasks.has(key)) continue;
      seenTasks.add(key);
      candidates.push({ title: task.title.trim(), listTitle: typeof list.title === 'string' ? list.title : 'Google Tasks', source: { provider: 'google-tasks', taskListId: list.id, taskId: task.id, dueDate: day } });
    }
  }
  return candidates;
}
