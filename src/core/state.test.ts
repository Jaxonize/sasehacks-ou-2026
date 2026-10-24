import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction, createEmptySlots } from './state.ts';
import { loadSlots, saveSlots, STORAGE_KEY } from './storage.ts';

test('each control completes only its fixed slot and repeated activation cannot undo it', () => {
  let slots = createEmptySlots();
  assert.deepEqual(slots.map(slot => slot.controlLabel), ['Dial 1', 'Dial 2', 'Switch 1', 'Switch 2']);
  for (const slot of slots) slots = applyAction(slots, { type: 'add', slotId: slot.slotId, id: `r${slot.slotId}`, title: `Task ${slot.slotId}` });
  for (const slot of slots) {
    const before = slots;
    slots = applyAction(slots, { type: 'activateControl', slotId: slot.slotId });
    for (const other of slots) {
      assert.equal(other.reminder?.completed, other.slotId === slot.slotId ? true : before[other.slotId - 1].reminder?.completed);
    }
    assert.strictEqual(applyAction(slots, { type: 'activateControl', slotId: slot.slotId }), slots);
    assert.deepEqual(slots.map((item) => item.slotId), [1, 2, 3, 4]);
  }
});

test('empty activation is harmless; app undo and edit preserve identity and position', () => {
  const empty = createEmptySlots();
  assert.strictEqual(applyAction(empty, { type: 'activateControl', slotId: 3 }), empty);
  let slots = applyAction(empty, { type: 'add', slotId: 3, id: 'dial-reminder', title: '  Call a friend  ' });
  slots = applyAction(slots, { type: 'complete', slotId: 3 });
  slots = applyAction(slots, { type: 'edit', slotId: 3, title: 'Call family' });
  assert.deepEqual(slots[2].reminder, { id: 'dial-reminder', title: 'Call family', completed: true });
  slots = applyAction(slots, { type: 'undo', slotId: 3 });
  assert.equal(slots[2].reminder?.completed, false);
  assert.equal(empty[2].reminder, null);
  assert.throws(() => applyAction(slots, { type: 'add', slotId: 3, id: 'other', title: 'Overwrite' }), /already/);
  assert.throws(() => applyAction(slots, { type: 'edit', slotId: 3, title: '   ' }), /title/);
  assert.throws(() => applyAction(slots, { type: 'edit', slotId: 3, title: 'x'.repeat(201) }), /200/);
});

test('saved state survives reload including completion and physical mapping', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  assert.deepEqual(loadSlots(storage), createEmptySlots());
  let slots = applyAction(createEmptySlots(), { type: 'add', slotId: 4, id: 'r4', title: 'Bring water' });
  slots = applyAction(slots, { type: 'activateControl', slotId: 4 });
  saveSlots(storage, slots);
  assert.deepEqual(loadSlots(storage), slots);
  const raw = values.get(STORAGE_KEY)!;
  values.set(STORAGE_KEY, '{broken');
  assert.throws(() => loadSlots(storage));
  assert.equal(values.get(STORAGE_KEY), '{broken');
  const invalid = JSON.parse(raw);
  invalid.slots.reverse();
  values.set(STORAGE_KEY, JSON.stringify(invalid));
  assert.throws(() => loadSlots(storage), /mapping/);
});

test('unsupported versions, duplicate IDs and invalid reminders are rejected', () => {
  const slots = createEmptySlots();
  slots[0].reminder = { id: 'same', title: 'A', completed: false };
  slots[1].reminder = { id: 'same', title: 'B', completed: false };
  const read = (data: unknown) => loadSlots({ getItem: () => JSON.stringify(data), setItem: () => {} });
  assert.throws(() => read({ version: 2, slots }), /invalid/);
  assert.throws(() => read({ version: 1, slots }), /invalid/);
  slots[1].reminder = { id: 'unique', title: '', completed: false };
  assert.throws(() => read({ version: 1, slots }), /invalid/);
});

test('storage read/write failures are surfaced to the controller', () => {
  const denied = { getItem: (): string | null => { throw new Error('denied'); }, setItem: () => { throw new Error('quota'); } };
  assert.throws(() => loadSlots(denied), /denied/);
  assert.throws(() => saveSlots(denied, createEmptySlots()), /quota/);
});
