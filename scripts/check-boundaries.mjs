import { readdir, readFile } from 'node:fs/promises';
import { dirname, extname, join, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirs = ['shared', 'client/src', 'server/src', 'tests', 'scripts'];
const sourceFiles = ['vite.config.ts'];
const extensions = new Set(['.ts', '.mjs', '.js', '.cjs']);
const aliases = { '@shared': 'shared' };

// A file belongs to the module with the longest matching path prefix (listed first).
const moduleRoots = [
  ['shared/', 'shared'],
  ['server/', 'server'],
  ['client/src/core/', 'client/core'],
  ['client/src/app/', 'client/app'],
  ['client/src/ui/', 'client/ui'],
  ['client/src/hud/', 'client/hud'],
  ['client/src/render/', 'client/render'],
  ['client/src/assets/', 'client/assets'],
  ['client/src/net/', 'client/net'],
  ['client/src/features/preview/', 'client/feature-preview'],
  ['client/src/features/courtyard/', 'client/feature-courtyard'],
  ['client/src/', 'client'],
  ['tests/', 'tests'],
  ['scripts/', 'scripts'],
  ['vite.config.ts', 'config'],
];

// Which module may import which. Files under tests/ may import everything.
const allowed = {
  shared: [],
  server: ['shared'],
  'client/core': ['shared', 'client/render', 'client/assets', 'client/net'],
  'client/app': ['shared', 'client/core', 'client/ui', 'client/hud', 'client/render', 'client/assets', 'client/net', 'client/feature-preview', 'client/feature-courtyard'],
  'client/ui': ['shared', 'client/core', 'client/feature-preview', 'client/feature-courtyard'],
  'client/hud': ['shared', 'client/core', 'client/render'],
  'client/render': ['shared', 'client/assets'],
  'client/assets': ['shared'],
  'client/net': ['shared'],
  'client/feature-preview': ['shared', 'client/core', 'client/render', 'client/ui'],
  'client/feature-courtyard': ['shared', 'client/core', 'client/render', 'client/net'],
  client: ['shared', 'client/app', 'client/core', 'client/ui', 'client/hud', 'client/render', 'client/assets', 'client/net', 'client/feature-preview', 'client/feature-courtyard'],
  scripts: ['shared'],
  config: ['scripts'],
};

// Packages that a layer must not use (pure rules stay free of frameworks).
const forbiddenPackages = {
  shared: ['three', 'colyseus', '@colyseus/sdk', '@colyseus/ws-transport'],
  client: ['colyseus', '@colyseus/ws-transport'],
  server: ['three', '@colyseus/sdk'],
};

const importPattern = /\b(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;
const toPosix = path => path.split(sep).join('/');
const moduleOf = path => moduleRoots.find(([prefix]) => path.startsWith(prefix))?.[1] ?? null;
const canImport = (from, to) => from === to || from === 'tests' || (allowed[from] ?? []).includes(to);
const isInternal = specifier => specifier.startsWith('.') || Object.keys(aliases).some(name => specifier === name || specifier.startsWith(`${name}/`));

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (extensions.has(extname(entry.name))) yield toPosix(relative(root, path));
  }
}

const files = [];
for (const dir of sourceDirs) {
  for await (const file of walk(join(root, dir))) files.push(file);
}
files.push(...sourceFiles);
const known = new Set(files);

function resolveTarget(from, specifier) {
  let base = specifier;
  if (specifier.startsWith('.')) base = posix.join(posix.dirname(from), specifier);
  else {
    const name = Object.keys(aliases).find(alias => specifier === alias || specifier.startsWith(`${alias}/`));
    if (name) base = aliases[name] + specifier.slice(name.length);
  }
  return [base, `${base}.ts`, `${base}.mjs`, `${base}.js`, `${base}.cjs`, `${base}/index.ts`].find(candidate => known.has(candidate)) ?? null;
}

const violations = [];
const graph = new Map(files.map(file => [file, new Set()]));
const modules = new Set();
for (const file of files) {
  const module = moduleOf(file);
  if (!module) continue;
  modules.add(module);
  const text = await readFile(join(root, file), 'utf8');
  for (const match of text.matchAll(importPattern)) {
    const specifier = match[1];
    const line = text.slice(0, match.index).split('\n').length;
    if (!isInternal(specifier)) {
      const pkg = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
      if ((forbiddenPackages[module.split('/')[0]] ?? []).includes(pkg)) violations.push(`${file}:${line} ${module} không được dùng gói "${pkg}"`);
      continue;
    }
    const target = resolveTarget(file, specifier);
    if (!target) continue;
    const targetModule = moduleOf(target);
    if (!canImport(module, targetModule)) violations.push(`${file}:${line} ${module} không được import ${targetModule} ("${specifier}")`);
    // Type-only imports are erased at runtime, so they cannot form a runtime cycle.
    const statement = text.slice(Math.max(text.lastIndexOf('\nimport', match.index), text.lastIndexOf('\nexport', match.index), 0), match.index);
    if (!/\b(?:import|export)\s+type\b/.test(statement)) graph.get(file).add(target);
  }
}

// Tarjan's strongly connected components: a component with more than one file, or a self import, is a cycle.
const cycles = [];
let counter = 0;
const order = new Map();
const low = new Map();
const stack = [];
const onStack = new Set();
function connect(node) {
  order.set(node, counter); low.set(node, counter); counter++;
  stack.push(node); onStack.add(node);
  for (const next of graph.get(node)) {
    if (!order.has(next)) { connect(next); low.set(node, Math.min(low.get(node), low.get(next))); }
    else if (onStack.has(next)) low.set(node, Math.min(low.get(node), order.get(next)));
  }
  if (low.get(node) === order.get(node)) {
    const component = [];
    let member;
    do { member = stack.pop(); onStack.delete(member); component.push(member); } while (member !== node);
    if (component.length > 1 || graph.get(node).has(node)) cycles.push(component.sort());
  }
}
for (const file of files) if (!order.has(file)) connect(file);
for (const cycle of cycles) violations.push(`Vòng phụ thuộc giữa: ${cycle.join(', ')}`);

if (violations.length) {
  console.error(`Vi phạm ranh giới module (${violations.length}):`);
  for (const violation of violations) console.error(`  ${violation}`);
  process.exitCode = 1;
} else {
  console.log(`OK: ${files.length} tệp, ${modules.size} module; không có vi phạm ranh giới hay vòng phụ thuộc.`);
}
