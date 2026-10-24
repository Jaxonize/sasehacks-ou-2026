import test from 'node:test';
import assert from 'node:assert/strict';
import { createReminderController } from './controller.ts';
import { STORAGE_KEY } from './storage.ts';

function sharedStorage() {
  const values = new Map<string, string>();
  let writes = 0;
  let denied = false;
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem(key: string, value: string) {
      if (denied) throw new Error('quota');
      writes++;
      values.set(key, value);
    },
  };
  return { storage, values, writes: () => writes, denyWrites: () => { denied = true; } };
}

test('stale sequential actions rebase before writing, refresh has no write echo', () => {
  const shared = sharedStorage();
  const a = createReminderController(() => shared.storage);
  a.dispatch({ type: 'add', slotId: 1, title: 'Water', id: 'one' });
  const b = createReminderController(() => shared.storage);
  a.dispatch({ type: 'complete', slotId: 1 });
  assert.equal(b.getSnapshot().slots[0].reminder?.completed, false);
  b.dispatch({ type: 'add', slotId: 2, title: 'Family', id: 'two' });
  assert.equal(b.getSnapshot().slots[0].reminder?.completed, true);
  const before = shared.writes();
  a.refresh(); a.refresh(); b.refresh();
  assert.equal(shared.writes(), before);
  assert.deepEqual(a.getSnapshot().slots, b.getSnapshot().slots);
  a.dispatch({ type: 'edit', slotId: 1, title: 'Bring water' });
  b.dispatch({ type: 'undo', slotId: 1 });
  assert.deepEqual(b.getSnapshot().slots[0].reminder, { id: 'one', title: 'Bring water', completed: false });
});

test('occupied-slot rejection preserves incoming data and validation survives refresh', () => {
  const shared = sharedStorage();
  const a = createReminderController(() => shared.storage);
  const b = createReminderController(() => shared.storage);
  a.dispatch({ type: 'add', slotId: 1, title: 'Original', id: 'one' });
  const before = shared.writes();
  assert.equal(b.dispatch({ type: 'add', slotId: 1, title: 'Draft', id: 'two' }), false);
  assert.equal(shared.writes(), before);
  b.refresh();
  assert.match(b.getSnapshot().error!, /already/);
  assert.equal(b.getSnapshot().slots[0].reminder?.title, 'Original');
  assert.equal(b.dispatch({ type: 'edit', slotId: 2, title: 'Vanished' }), false);
  assert.match(b.getSnapshot().error!, /no longer/);
});

test('validation cannot be cleared by a save effect and clears on the next accepted action', () => {
  const shared = sharedStorage();
  const controller = createReminderController(() => shared.storage);
  controller.dispatch({ type: 'add', slotId: 1, title: 'Water', id: 'one' });
  assert.equal(controller.dispatch({ type: 'edit', slotId: 1, title: ' ' }), false);
  controller.refresh();
  assert.match(controller.getSnapshot().error!, /title/);
  assert.equal(controller.dispatch({ type: 'complete', slotId: 1 }), true);
  assert.equal(controller.getSnapshot().error, null);
});

test('failed writes accept memory-only changes, keep both errors and do not overwrite other tabs later', () => {
  const shared = sharedStorage();
  const controller = createReminderController(() => shared.storage);
  shared.denyWrites();
  assert.equal(controller.dispatch({ type: 'add', slotId: 1, title: 'In memory', id: 'one' }), true);
  assert.equal(controller.dispatch({ type: 'edit', slotId: 1, title: '' }), false);
  assert.match(controller.getSnapshot().error!, /title/);
  assert.match(controller.getSnapshot().error!, /could not be saved/);
  assert.equal(controller.getSnapshot().persistenceStatus, 'unavailable');
  shared.values.set(STORAGE_KEY, JSON.stringify({ version: 1, slots: [1,2,3,4].map(slotId => ({ slotId, reminder: null })) }));
  controller.refresh();
  assert.equal(controller.getSnapshot().slots[0].reminder?.title, 'In memory');
  assert.equal(controller.dispatch({ type: 'edit', slotId: 1, title: 'Still in memory' }), true);
  assert.doesNotMatch(controller.getSnapshot().error!, /Enter a reminder title/);
  assert.match(controller.getSnapshot().error!, /could not be saved/);
  assert.equal(shared.writes(), 0);
});

test('corrupt data and unavailable storage preserve saved bytes and accept local edits', () => {
  const shared = sharedStorage();
  shared.values.set(STORAGE_KEY, '{broken');
  for (const getStorage of [() => shared.storage, () => { throw new Error('denied'); }]) {
    const controller = createReminderController(getStorage);
    assert.equal(controller.dispatch({ type: 'add', slotId: 4, title: 'Local', id: 'local' }), true);
    assert.equal(controller.getSnapshot().slots[3].reminder?.title, 'Local');
    assert.equal(controller.getSnapshot().persistenceStatus, 'unavailable');
    assert.match(controller.getSnapshot().error!, /could not be loaded/);
  }
  assert.equal(shared.values.get(STORAGE_KEY), '{broken');
});
