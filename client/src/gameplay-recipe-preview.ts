// Arithmetic for the standalone design review. Does not execute a game command.
export interface PreviewItemDefinition {
  id: string;
  name: string;
  maxOwned?: number;
}

export interface PreviewRecipe {
  id: string;
  stage: string;
  requires: string[];
  consume: Record<string, number>;
  keep: Record<string, number>;
  produce: Record<string, number>;
  transform?: { item: string; from: string; to: string; sameInstance: boolean };
  effect?: { id: string; postStartRefund: boolean };
}

export interface PreviewBag {
  quantities: Record<string, number>;
  states: Record<string, string>;
  unlocked: string[];
  sealed: boolean;
}

export type PreviewIssue =
  | { kind: 'invalid-quantity'; item: string }
  | { kind: 'missing'; item: string; quantity: number }
  | { kind: 'locked'; requirement: string }
  | { kind: 'state'; item: string; expected: string }
  | { kind: 'capacity'; item: string; limit: number }
  | { kind: 'already-sealed' };

export interface PreviewResult {
  ready: boolean;
  issues: PreviewIssue[];
  // A proposed result, available only if every check passes. Never mutates the bag.
  after: PreviewBag | null;
}

export function previewRecipe(
  recipe: PreviewRecipe,
  bag: PreviewBag,
  definitions: PreviewItemDefinition[],
): PreviewResult {
  const ids = new Set([
    ...Object.keys(recipe.consume), ...Object.keys(recipe.keep),
    ...Object.keys(recipe.produce), ...(recipe.transform ? [recipe.transform.item] : []),
  ]);
  const issues: PreviewIssue[] = [];
  for (const id of ids) {
    const quantity = bag.quantities[id] ?? 0;
    if (!Number.isSafeInteger(quantity) || quantity < 0) {
      issues.push({ kind: 'invalid-quantity', item: id });
      continue;
    }
    const needed = (recipe.consume[id] ?? 0) + (recipe.keep[id] ?? 0);
    if (quantity < needed) issues.push({ kind: 'missing', item: id, quantity: needed - quantity });
    const next = quantity - (recipe.consume[id] ?? 0) + (recipe.produce[id] ?? 0);
    if (!Number.isSafeInteger(next)) issues.push({ kind: 'invalid-quantity', item: id });
    const limit = definitions.find(item => item.id === id)?.maxOwned;
    if (limit !== undefined && next > limit) issues.push({ kind: 'capacity', item: id, limit });
  }
  for (const requirement of recipe.requires) {
    if (!bag.unlocked.includes(requirement)) issues.push({ kind: 'locked', requirement });
  }
  if (recipe.transform && (bag.quantities[recipe.transform.item] ?? 0) > 0
    && bag.states[recipe.transform.item] !== recipe.transform.from) {
    issues.push({ kind: 'state', item: recipe.transform.item, expected: recipe.transform.from });
  }
  if (recipe.effect?.id === 'trip-seal' && bag.sealed) issues.push({ kind: 'already-sealed' });
  if (issues.length) return { ready: false, issues, after: null };

  const after: PreviewBag = {
    quantities: { ...bag.quantities }, states: { ...bag.states },
    unlocked: [...bag.unlocked], sealed: bag.sealed,
  };
  for (const [id, quantity] of Object.entries(recipe.consume)) after.quantities[id] = (after.quantities[id] ?? 0) - quantity;
  for (const [id, quantity] of Object.entries(recipe.produce)) after.quantities[id] = (after.quantities[id] ?? 0) + quantity;
  if (recipe.transform) after.states[recipe.transform.item] = recipe.transform.to;
  if (recipe.effect?.id === 'trip-seal') after.sealed = true;
  return { ready: true, issues: [], after };
}
