import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { previewRecipe, type PreviewBag, type PreviewItemDefinition, type PreviewRecipe } from '../../client/src/gameplay-recipe-preview';

const plan = JSON.parse(readFileSync('docs/design/systems/items-v1/plan.json', 'utf8')) as {
  items: PreviewItemDefinition[];
  recipes: PreviewRecipe[];
};
const recipe = (id: string) => plan.recipes.find(value => value.id === id)!;
const enough = (value: PreviewRecipe): PreviewBag => ({
  quantities: Object.fromEntries([...new Set([...Object.keys(value.consume), ...Object.keys(value.keep)])]
    .map(id => [id, (value.consume[id] ?? 0) + (value.keep[id] ?? 0)])),
  states: value.transform ? { [value.transform.item]: value.transform.from } : {},
  unlocked: [...value.requires], sealed: false,
});

test('six GDD recipes can be inspected repeatedly without spending the sample bag', () => {
  for (const value of plan.recipes) {
    const bag = enough(value), before = structuredClone(bag);
    const first = previewRecipe(value, bag, plan.items), second = previewRecipe(value, bag, plan.items);
    assert.equal(first.ready, true, value.id);
    assert.deepEqual(second, first);
    assert.deepEqual(bag, before);
    assert.notEqual(first.after!.quantities, bag.quantities);
  }
});

test('HN05/HN06 budget leaves two materials and transforms the same jade quantity', () => {
  const value = recipe('hn-refine-training-jade'), bag = enough(value);
  bag.quantities['hn-refining-material'] = 6;
  const result = previewRecipe(value, bag, plan.items);
  assert.deepEqual(result.after!.quantities, { 'hn-refining-material': 2, 'hn-training-jade': 1 });
  assert.equal(result.after!.states['hn-training-jade'], 'refined');
  bag.states['hn-training-jade'] = 'refined';
  const refined = previewRecipe(value, bag, plan.items);
  assert.equal(refined.after, null);
  assert.ok(refined.issues.some(issue => issue.kind === 'state'));
});

test('missing kept jade or missing progress prevents a proposed result and spends nothing', () => {
  const value = recipe('hn-refine-training-jade'), bag = enough(value);
  bag.quantities['hn-training-jade'] = 0;
  bag.unlocked = [];
  const result = previewRecipe(value, bag, plan.items);
  assert.equal(result.after, null);
  assert.ok(result.issues.some(issue => issue.kind === 'missing' && issue.item === 'hn-training-jade' && issue.quantity === 1));
  assert.equal(result.issues.filter(issue => issue.kind === 'locked').length, 2);
  assert.equal(bag.quantities['hn-refining-material'], 4);
});

test('existing unique tools prevent making a duplicate; recovery adds to one quantity', () => {
  for (const [recipeId, itemId] of [['vh-recipe-case', 'vh-sealed-case'], ['vh-recipe-compass', 'vh-flow-compass']]) {
    const value = recipe(recipeId), bag = enough(value);
    bag.quantities[itemId] = 1;
    const result = previewRecipe(value, bag, plan.items);
    assert.equal(result.after, null);
    assert.ok(result.issues.some(issue => issue.kind === 'capacity' && issue.item === itemId));
  }
  const value = recipe('vh-recipe-recovery'), bag = enough(value);
  bag.quantities.recovery = 7;
  assert.equal(previewRecipe(value, bag, plan.items).after!.quantities.recovery, 8);
});

test('seal keeps the case; missing case, started trip and existing seal block the preview', () => {
  const value = recipe('vh-recipe-seal'), bag = enough(value);
  const valid = previewRecipe(value, bag, plan.items);
  assert.equal(valid.after!.quantities['vh-sealed-case'], 1);
  assert.equal(valid.after!.quantities['vh-guiding-ink'], 0);
  assert.equal(valid.after!.sealed, true);
  for (const failure of [
    { ...bag, quantities: { ...bag.quantities, 'vh-sealed-case': 0 } },
    { ...bag, unlocked: ['EX03-accepted'] },
    { ...bag, sealed: true },
  ]) assert.equal(previewRecipe(value, failure, plan.items).after, null);
  assert.equal(bag.quantities['vh-guiding-ink'], 1);
});

test('invalid numeric input and unsafe output are rejected', () => {
  const value = recipe('vh-recipe-recovery');
  for (const quantity of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const bag = enough(value);
    bag.quantities['vh-clean-herb'] = quantity;
    const result = previewRecipe(value, bag, plan.items);
    assert.equal(result.after, null);
    assert.ok(result.issues.some(issue => issue.kind === 'invalid-quantity'));
  }
  const bag = enough(value);
  bag.quantities.recovery = Number.MAX_SAFE_INTEGER;
  assert.equal(previewRecipe(value, bag, plan.items).after, null);
});

test('an item required for consumption and retention must cover both quantities', () => {
  const value: PreviewRecipe = { id: 'review-fixture', stage: 'fixture', requires: [], consume: { material: 2 }, keep: { material: 1 }, produce: {} };
  const bag: PreviewBag = { quantities: { material: 2 }, states: {}, unlocked: [], sealed: false };
  assert.deepEqual(previewRecipe(value, bag, []).issues, [{ kind: 'missing', item: 'material', quantity: 1 }]);
});
