import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QuestSelection, type QuestSelectionSnapshot } from '../../client/src/core/quest-selection';

type Quest = 'HN05' | 'HN06' | 'HN07' | 'HN08';
const snapshot = (extra: Partial<QuestSelectionSnapshot<Quest>> = {}): QuestSelectionSnapshot<Quest> => ({
  profileId: 'one', order: ['HN05', 'HN06', 'HN07', 'HN08'], completed: [], active: [], available: ['HN05'], ...extra,
});

test('confirmed completion advances to the next active, available or gated step', () => {
  const selection = new QuestSelection<Quest>();
  assert.equal(selection.update(snapshot()), 'HN05');
  assert.equal(selection.update(snapshot({ active: ['HN05'], available: [] })), 'HN05');
  assert.equal(selection.update(snapshot({ completed: ['HN05'], available: [] })), 'HN06', 'show the next gated objective when M02 is needed');
  assert.equal(selection.update(snapshot({ completed: ['HN05'], available: ['HN06'] })), 'HN06');
  assert.equal(selection.update(snapshot({ completed: ['HN05', 'HN06'], active: ['HN07'], available: ['HN08'] })), 'HN07');
});

test('manual browsing survives unrelated updates and old completion snapshots', () => {
  const selection = new QuestSelection<Quest>();
  const view = snapshot({ completed: ['HN05'], active: ['HN06'], available: ['HN06'] });
  selection.update(view);
  selection.select('HN05');
  assert.equal(selection.update(view), 'HN05', 'do not redirect a completed quest selected for rereading');
  selection.select('HN08');
  assert.equal(selection.update({ ...view, completed: ['HN05', 'HN06'], available: ['HN07'] }), 'HN08');
});

test('opening an old quest before the first snapshot keeps the requested detail', () => {
  const selection = new QuestSelection<Quest>();
  selection.select('HN05');
  assert.equal(selection.update(snapshot({ completed: ['HN05'], available: ['HN06'] })), 'HN05');
});

test('profile changes and explicit resets discard the previous browsing selection', () => {
  const selection = new QuestSelection<Quest>();
  selection.update(snapshot({ completed: ['HN05', 'HN06'], active: ['HN07'] }));
  selection.select('HN08');
  assert.equal(selection.update(snapshot({ profileId: 'two' })), 'HN05');
  selection.select('HN08');
  selection.reset();
  assert.equal(selection.selected, undefined);
  assert.equal(selection.update(snapshot({ completed: ['HN05'], available: ['HN06'] })), 'HN06');
});

test('all complete retains the last step without a loop and does not mutate snapshots', () => {
  const selection = new QuestSelection<Quest>();
  const view = snapshot({ completed: ['HN05', 'HN06', 'HN07'], active: ['HN08'], available: [] });
  const before = JSON.stringify(view);
  assert.equal(selection.update(view), 'HN08');
  assert.equal(JSON.stringify(view), before);
  const complete = { ...view, completed: view.order };
  assert.equal(selection.update(complete), 'HN08');
  assert.equal(selection.update(complete), 'HN08');
});
