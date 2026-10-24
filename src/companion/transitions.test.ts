import assert from 'node:assert/strict';
import test from 'node:test';
import { completionTransitions } from './transitions.ts';

const slot = (id: string, completed: boolean, slotId = 1) => ({ slotId, reminder: { id, completed } });

test('companion celebrates only an existing incomplete reminder becoming complete', () => {
  const initial = completionTransitions([slot('a', false), slot('b', true, 2)], null);
  assert.deepEqual(initial.newlyCompleted, []);
  const completed = completionTransitions([slot('a', true), slot('b', true, 2)], initial.current);
  assert.deepEqual(completed.newlyCompleted, ['1:a']);
  assert.deepEqual(completionTransitions([slot('a', true), slot('b', true, 2)], completed.current).newlyCompleted, []);
  const undone = completionTransitions([slot('a', false)], completed.current);
  assert.deepEqual(undone.newlyCompleted, []);
  assert.deepEqual(completionTransitions([slot('a', true)], undone.current).newlyCompleted, ['1:a']);
});

test('companion does not reward loading, replacement, empty slots or a replayed baseline', () => {
  const initial = completionTransitions([slot('a', false)], null);
  const replacement = completionTransitions([slot('new', true)], initial.current);
  assert.deepEqual(replacement.newlyCompleted, []);
  assert.deepEqual(completionTransitions([slot('a', true)], null).newlyCompleted, []);
  const empty = completionTransitions([{ slotId: 1, reminder: null }], replacement.current);
  assert.equal(empty.current.size, 0);
  assert.deepEqual(empty.newlyCompleted, []);
  const hiddenUpdate = completionTransitions([slot('a', true)], initial.current);
  assert.deepEqual(completionTransitions([slot('a', true)], hiddenUpdate.current).newlyCompleted, []);
});
