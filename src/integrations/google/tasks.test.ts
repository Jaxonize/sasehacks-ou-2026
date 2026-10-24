import test from 'node:test';
import assert from 'node:assert/strict';
import { dueDateKey, fetchTodaysGoogleTasks, localDateKey, TASKS_READONLY } from './tasks.ts';
import { connectionUnavailable, hasTasksScope } from './identity.ts';

test('due dates keep Google calendar-date semantics instead of converting midnight UTC', () => {
  assert.equal(dueDateKey('2026-10-24T00:00:00.000Z'), '2026-10-24');
  assert.equal(dueDateKey('2026-10-24T23:00:00-07:00'), '2026-10-24');
  assert.equal(dueDateKey('2026-02-30T00:00:00Z'), null);
  assert.equal(dueDateKey(undefined), null);
  assert.equal(localDateKey(new Date(2026, 9, 24, 23, 59)), '2026-10-24');
});

test('all list/task pages use readonly GET, include assigned tasks, filter today and deduplicate', async () => {
  const calls: string[] = [];
  const request = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input)); calls.push(url.pathname + url.search);
    assert.equal(init?.method, 'GET');
    assert.equal((init?.headers as Record<string, string>).Authorization, 'Bearer fixture-token');
    assert.equal(url.searchParams.get('access_token'), null);
    assert.equal(url.searchParams.get('maxResults'), '100');
    if (url.pathname.endsWith('/users/@me/lists')) return Response.json(url.searchParams.has('pageToken') ? { items: [{ id: 'list2', title: 'Other' }] } : { items: [{ id: 'list/1', title: 'Home' }], nextPageToken: 'lists-next' });
    assert.equal(url.searchParams.get('showAssigned'), 'true');
    assert.equal(url.searchParams.get('showCompleted'), 'false');
    const today = { id: 'one', title: 'Drink water', status: 'needsAction', due: '2026-10-24T00:00:00Z' };
    if (url.pathname.includes('list%2F1')) return Response.json(url.searchParams.has('pageToken') ? { items: [today, { ...today, id: 'two' }] } : { items: [today, { ...today, id: 'done', status: 'completed' }, { ...today, id: 'yesterday', due: '2026-10-23T00:00:00Z' }, { ...today, id: 'hidden', hidden: true }, { ...today, id: 'deleted', deleted: true }, { ...today, id: 'undated', due: undefined }], nextPageToken: 'tasks-next' });
    return Response.json({ items: [{ ...today, title: 'Same task ID, other list' }] });
  }) as typeof fetch;
  const tasks = await fetchTodaysGoogleTasks('fixture-token', '2026-10-24', undefined, request);
  assert.equal(calls.length, 5);
  assert.deepEqual(tasks.map(task => [task.source.taskListId, task.source.taskId]), [['list/1','one'],['list/1','two'],['list2','one']]);
});

test('API errors, malformed pages, repeated pagination and cancellation do not produce partial imports', async () => {
  for (const status of [401,403,429,500]) {
    await assert.rejects(fetchTodaysGoogleTasks('fixture', '2026-10-24', undefined, (async () => new Response('', { status })) as typeof fetch), error => (error as {status:number}).status === status);
  }
  await assert.rejects(fetchTodaysGoogleTasks('fixture', '2026-10-24', undefined, (async () => Response.json({ items: 'invalid' })) as typeof fetch), /unexpected/);
  await assert.rejects(fetchTodaysGoogleTasks('fixture', '2026-10-24', undefined, (async () => Response.json({ items: [], nextPageToken: 'loop' })) as typeof fetch), /repeated/);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(fetchTodaysGoogleTasks('fixture', '2026-10-24', controller.signal, (async (_input, init) => { init?.signal?.throwIfAborted(); return Response.json({}); }) as typeof fetch), { name: 'AbortError' });
});

test('OAuth is unavailable without configuration or at LAN HTTP/raw-IP origins; narrow scope is required', () => {
  assert.match(connectionUnavailable('', 'http://localhost:5173')!, /not configured/);
  assert.equal(connectionUnavailable('configured', 'http://localhost:5173'), null);
  assert.equal(connectionUnavailable('configured', 'http://127.0.0.1:5173'), null);
  assert.equal(connectionUnavailable('configured', 'https://demo.example.org'), null);
  assert.match(connectionUnavailable('configured', 'http://10.204.80.94:5173')!, /unavailable/);
  assert.match(connectionUnavailable('configured', 'https://10.204.80.94')!, /unavailable/);
  assert.equal(hasTasksScope(TASKS_READONLY), true);
  assert.equal(hasTasksScope('https://www.googleapis.com/auth/calendar.readonly'), false);
});
