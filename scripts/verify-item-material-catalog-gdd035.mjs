// Read-only checks for the GDD 0.35 asset/item catalog. No runtime or balance checks.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.resolve(root, 'docs/design/systems/item-material-catalog-gdd035-v1');
const readJson = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const read = name => fs.readFileSync(path.join(dir, name), 'utf8');
const check = (ok, message) => assert.ok(ok, message);
const items = readJson('items.json');
const assets = readJson('asset-inventory.json');
const recipes = readJson('recipes-and-sources.json');
check(items.schema === 'gdd035-item-catalog-1', 'items schema');
check(assets.schema === 'gdd035-asset-inventory-1', 'asset inventory schema');
check(recipes.schema === 'gdd035-recipes-sources-1', 'recipes/sources schema');
check(Array.isArray(items.items) && items.items.length > 0, 'catalog is empty');
check(Array.isArray(assets.assets) && assets.assets.length > 0, 'asset inventory is empty');
check(Array.isArray(recipes.sources) && recipes.sources.length > 0, 'source inventory is empty');
check(Array.isArray(recipes.recipes) && recipes.recipes.length > 0, 'recipe inventory is empty');
const ids = new Set();
for (const [i, item] of items.items.entries()) {
  check(typeof item.id === 'string' && item.id.length > 0, `item ${i} id`);
  check(/^[a-z0-9-]+$/.test(item.id), `${item.id} must use ASCII planning ID`);
  check(!ids.has(item.id), `duplicate item id ${item.id}`); ids.add(item.id);
  check(typeof item.name === 'string' && item.name.length > 0, `${item.id} name`);
  check(Array.isArray(item.sourceRefs), `${item.id} sourceRefs`);
  check(Array.isArray(item.missingDesign), `${item.id} missingDesign`);
  check(Array.isArray(item.servesRealms) && item.firstAcquisition, `${item.id} acquisition fields`);
  if (/^VG\d\d$/.test(item.firstAcquisition.act ?? '')) {
    const n = Number(item.firstAcquisition.act.slice(2));
    check(item.firstAcquisition.realm === (n <= 6 ? 'qi' : 'foundation'), `${item.id} acquisition realm follows VG gate`);
  }
}
const assetIds = new Set();
for (const [i, asset] of assets.assets.entries()) {
  check(typeof asset.id === 'string' && asset.id.length > 0, `asset ${i} id`);
  check(!assetIds.has(asset.id), `duplicate asset id ${asset.id}`); assetIds.add(asset.id);
  check(Array.isArray(asset.files), `${asset.id} files`);
  check(typeof (asset.requiredWork ?? asset.missingWork ?? '') === 'string' || Array.isArray(asset.requiredWork ?? asset.missingWork), `${asset.id} requiredWork`);
  for (const file of asset.files) {
    if (!file.path) continue;
    const target = path.resolve(root, file.path);
    check(target.startsWith(root + path.sep), `${asset.id} path escapes workspace`);
    check(fs.existsSync(target), `${asset.id} missing file ${file.path}`);
  }
}
const sourceIds = new Set();
for (const [i, source] of recipes.sources.entries()) {
  check(typeof source.id === 'string' && source.id.length > 0, `source ${i} id`);
  check(!sourceIds.has(source.id), `duplicate source id ${source.id}`); sourceIds.add(source.id);
  check(Array.isArray(source.outputs), `${source.id} outputs`);
  check(Array.isArray(source.sourceRefs), `${source.id} sourceRefs`);
}
const recipeIds = new Set();
for (const [i, recipe] of recipes.recipes.entries()) {
  check(typeof recipe.id === 'string' && recipe.id.length > 0, `recipe ${i} id`);
  check(!recipeIds.has(recipe.id), `duplicate recipe id ${recipe.id}`); recipeIds.add(recipe.id);
  check(Array.isArray(recipe.inputs) && Array.isArray(recipe.outputs), `${recipe.id} inputs/outputs`);
  check(Array.isArray(recipe.sourceRefs), `${recipe.id} sourceRefs`);
}
for (const name of ['items.json','asset-inventory.json','recipes-and-sources.json']) {
  const content = read(name);
  check(!/HN(?:0[1-9]|1[0-2])|EX0[1-4]|VP[0-4]/.test(content) || /legacy|historical|snapshot|lịch sử/i.test(content), `${name} promotes legacy HN/EX/VP without status`);
}
check(/VG01/.test(read('items.json')) && /VG11/.test(read('items.json')), 'catalog does not cover VG01–VG11');
check(/Nguyên Khí|Ngưng Khí|qi/i.test(read('items.json')), 'missing Qi realm');
check(/Hóa Thần|deity/i.test(read('items.json')), 'missing Hóa Thần realm');
const markdownFiles = ['README.md','item-coverage-notes.md','asset-audit-notes.md','recipes-source-notes.md'];
for (const file of markdownFiles) check(fs.existsSync(path.join(dir, file)), `missing ${file}`);
console.log(JSON.stringify({ status: 'passed', scope: 'GDD 0.35 catalog consistency only', itemRecords: items.items.length, assetRecords: assets.assets.length, sources: recipes.sources.length, recipes: recipes.recipes.length, runtimeIntegrated: false, balanceVerified: false }, null, 2));
