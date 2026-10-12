import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import { fileURLToPath } from 'node:url';
import {
  createMcpHandler, DEFAULT_WORKSPACE_ROOT, MAX_LINE_BYTES,
  resolveWorkspaceRoot, startStdioServer, SUPPORTED_PROTOCOL_VERSIONS,
} from '../../scripts/game-assetgen-mcp.mjs';

// Credentials and tool results below are offline fixtures only. No paid request
// or real credential configuration is read by these tests.
const FIXTURE_KEY = 'test-mcp-router-credential-never-use';
const WORKSPACE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ASSET = { assetType: 'icon', name: 'test-cloud', prompt: 'Small jade cloud icon, clean readable shape.' };
const initialize = (id = 1, protocolVersion = '2025-11-25') => ({
  jsonrpc: '2.0', id, method: 'initialize',
  params: { protocolVersion, capabilities: {}, clientInfo: { name: 'offline-test', version: '1' } },
});
const request = (id, method, params = {}) => ({ jsonrpc: '2.0', id, method, params });
const call = (id, name, args = {}) => request(id, 'tools/call', { name, arguments: args });

async function session(options = {}) {
  const handler = createMcpHandler({ workspaceRoot: WORKSPACE_ROOT, env: {}, ...options });
  await handler(initialize());
  return handler;
}

function parseLines(text) {
  return text.split('\n').filter(Boolean).map((line) => JSON.parse(line));
}

async function fixtureWorkspace(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'game-solo-mcp-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('workspace resolution is absolute and independent of launch cwd', () => {
  assert.equal(DEFAULT_WORKSPACE_ROOT, WORKSPACE_ROOT);
  assert.equal(resolveWorkspaceRoot({ env: {} }), WORKSPACE_ROOT);
  assert.equal(resolveWorkspaceRoot({ env: { GAME_ASSET_WORKSPACE: tmpdir() } }), path.resolve(tmpdir()));
  assert.equal(resolveWorkspaceRoot({ argv: ['--workspace', WORKSPACE_ROOT], env: { GAME_ASSET_WORKSPACE: tmpdir() } }), WORKSPACE_ROOT);
  for (const options of [
    { env: { GAME_ASSET_WORKSPACE: 'relative' } },
    { argv: ['--workspace', 'relative'], env: {} },
    { argv: ['--workspace'], env: {} },
    { argv: ['--unknown', WORKSPACE_ROOT], env: {} },
    { argv: ['--workspace', WORKSPACE_ROOT, '--workspace', WORKSPACE_ROOT], env: {} },
  ]) assert.throws(() => resolveWorkspaceRoot(options), /absolute|workspace/);
});

test('initialize negotiates supported MCP versions and advertises tools only', async () => {
  for (const version of SUPPORTED_PROTOCOL_VERSIONS) {
    const handler = createMcpHandler({ env: {} });
    const response = await handler(initialize(1, version));
    assert.equal(response.result.protocolVersion, version);
    assert.deepEqual(response.result.capabilities, { tools: { listChanged: false } });
    assert.equal(response.result.serverInfo.name, 'game-solo-assetgen');
    assert.equal(await handler({ jsonrpc: '2.0', method: 'notifications/initialized' }), null);
  }
  const handler = createMcpHandler({ env: {} });
  assert.equal((await handler(initialize(1, 'unsupported-test-version'))).result.protocolVersion, SUPPORTED_PROTOCOL_VERSIONS[0]);
  assert.equal((await handler(request(2, 'initialize', {}))).error.code, -32602);
});

test('handler honors the explicit workspace environment variable', async () => {
  let receivedRoot;
  const handler = createMcpHandler({
    env: { GAME_ASSET_WORKSPACE: tmpdir() },
    planAsset: (_input, { workspaceRoot }) => { receivedRoot = workspaceRoot; return {}; },
  });
  await handler(initialize());
  await handler(call(2, 'plan_game_asset', ASSET));
  assert.equal(receivedRoot, path.resolve(tmpdir()));
});

test('tools/list describes strict schemas, payment boundary and review status', async () => {
  const handler = await session();
  const { tools } = (await handler(request(2, 'tools/list'))).result;
  assert.deepEqual(tools.map((tool) => tool.name), [
    'list_game_asset_profiles', 'plan_game_asset', 'generate_game_asset', 'prepare_game_asset', 'check_game_image_router',
  ]);
  for (const tool of tools) {
    assert.equal(tool.inputSchema.additionalProperties, false);
    assert.match(tool.description, /previews awaiting owner ART review/);
    assert.match(tool.description, /gpt-image-2 chromakey\/alpha/);
  }
  const generation = tools.find((tool) => tool.name === 'generate_game_asset');
  assert.deepEqual(generation.annotations, { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true });
  assert.equal(generation.inputSchema.properties.n.maximum, 4);
  assert.deepEqual(generation.inputSchema.properties.assetType.enum, ['icon', 'prop', 'environment-part', 'character-concept', 'vfx-concept', 'ui-art', 'map-concept']);
  assert.equal(tools.find((tool) => tool.name === 'prepare_game_asset').annotations.openWorldHint, false);
  assert.ok((await handler(request(3, 'tools/list', { _meta: { test: true } }))).result);
  assert.equal((await handler(request(4, 'tools/list', { cursor: 'unexpected' }))).error.code, -32602);
});

test('pure profile listing and plan produce matching structured and text results without files or network', async (t) => {
  const root = await fixtureWorkspace(t);
  const handler = await session({ workspaceRoot: root, fetchImpl: () => { throw new Error('Network must not be used for a plan.'); } });
  const profiles = (await handler(call(2, 'list_game_asset_profiles'))).result;
  assert.ok(Array.isArray(profiles.structuredContent.profiles));
  assert.ok(profiles.structuredContent.profiles.length >= 7);
  assert.deepEqual(JSON.parse(profiles.content[0].text), profiles.structuredContent);
  const plan = (await handler(call(3, 'plan_game_asset', ASSET))).result;
  assert.equal(plan.isError, undefined);
  assert.equal(plan.structuredContent.model, 'gpt-image-2');
  assert.equal(plan.structuredContent.assetType, ASSET.assetType);
  assert.equal(plan.structuredContent.name, ASSET.name);
  assert.deepEqual(JSON.parse(plan.content[0].text), plan.structuredContent);
  assert.deepEqual(await readdir(root), []);
});

test('strict tool arguments reject unknown fields, paths, invalid counts and oversized UTF-8 text', async () => {
  let invoked = 0;
  const handler = await session({ planAsset: () => { invoked += 1; return {}; } });
  for (const input of [
    { ...ASSET, apiKey: FIXTURE_KEY }, { ...ASSET, out: '../outside.png' },
    { ...ASSET, name: '../outside' }, { ...ASSET, name: 'Bad-Name' }, { ...ASSET, name: 'bad--name' },
    { ...ASSET, name: 'a'.repeat(65) }, { ...ASSET, assetType: 'unsupported' },
    { ...ASSET, prompt: ' ' }, { ...ASSET, prompt: '雪'.repeat(10923) }, { ...ASSET, prompt: 'before\0after' },
    { ...ASSET, size: '0x1024' }, { ...ASSET, size: '1024' }, { ...ASSET, size: '1024x1025' }, { ...ASSET, size: '16x16' }, { ...ASSET, size: '9999x9999' }, { ...ASSET, quality: 'best' },
    { ...ASSET, n: 0 }, { ...ASSET, n: 5 }, { ...ASSET, n: 1.5 }, { ...ASSET, n: '1' }, [], null,
  ]) {
    const response = await handler(call(2, 'plan_game_asset', input));
    assert.equal(response.error.code, -32602);
    assert.equal(JSON.stringify(response).includes(FIXTURE_KEY), false);
  }
  assert.equal(invoked, 0);
  assert.equal((await handler(call(3, 'list_game_asset_profiles', { anything: true }))).error.code, -32602);
});

test('injected generation passes options once and returns local paths, never inline images', async () => {
  let count = 0;
  let received;
  const fetchImpl = () => { throw new Error('Offline test'); };
  const now = () => 0;
  const config = { model: 'gpt-image-2', apiKey: FIXTURE_KEY };
  const handler = await session({
    env: { IMAGEGEN_ROUTER_API_KEY: FIXTURE_KEY }, config, fetchImpl, now,
    generateAsset: async (input, options) => {
      count += 1;
      received = { input, options };
      return { files: [{ path: path.join(WORKSPACE_ROOT, 'output/game-assets/test/source.png') }], warnings: ['Alpha pending visual review.'], artApproved: false };
    },
  });
  const response = await handler(call(2, 'generate_game_asset', { ...ASSET, n: 4 }));
  assert.equal(count, 1);
  assert.equal(received.options.workspaceRoot, WORKSPACE_ROOT);
  assert.equal(received.options.env.IMAGEGEN_ROUTER_API_KEY, FIXTURE_KEY);
  assert.equal(received.options.config, config);
  assert.equal(received.options.fetchImpl, fetchImpl);
  assert.equal(received.options.now, now);
  assert.equal(received.input.n, 4);
  assert.ok(response.result.structuredContent.files[0].path.endsWith('source.png'));
  assert.equal(response.result.structuredContent.artApproved, false);
  assert.deepEqual(response.result.content.map((content) => content.type), ['text']);
});

test('a long generation permits ping and rejects a second concurrent generation', async () => {
  let complete;
  let count = 0;
  const handler = await session({ generateAsset: () => { count += 1; return new Promise((resolve) => { complete = resolve; }); } });
  const first = handler(call(2, 'generate_game_asset', ASSET));
  assert.equal(count, 1);
  assert.deepEqual((await handler(request(3, 'ping'))).result, {});
  const busy = await handler(call(4, 'generate_game_asset', ASSET));
  assert.equal(busy.result.isError, true);
  assert.match(busy.result.structuredContent.error, /already running/);
  assert.equal(count, 1);
  complete({ files: [] });
  assert.ok((await first).result);
  const second = handler(call(5, 'generate_game_asset', ASSET));
  assert.equal(count, 2);
  complete({ files: [] });
  await second;
});

test('notifications never execute tool actions or produce responses', async () => {
  let count = 0;
  const handler = await session({ generateAsset: () => { count += 1; return {}; } });
  assert.equal(await handler({ jsonrpc: '2.0', method: 'tools/call', params: { name: 'generate_game_asset', arguments: ASSET } }), null);
  assert.equal(await handler({ jsonrpc: '2.0', method: 'unknown', params: 17 }), null);
  assert.equal(await handler({ jsonrpc: '2.0', method: 'notifications/initialized' }), null);
  assert.equal(count, 0);
});

test('prepare adapter validates its local-only input and passes workspace', async () => {
  let received;
  const handler = await session({ prepareAsset: async (input, options) => { received = { input, options }; return { preparedPath: 'local-alpha.png', warnings: ['Review pending.'] }; } });
  const input = { manifestPath: 'output/game-assets/test/manifest.json', imageIndex: 2 };
  const prepared = await handler(call(2, 'prepare_game_asset', input));
  assert.deepEqual(received.input, input);
  assert.equal(received.options.workspaceRoot, WORKSPACE_ROOT);
  assert.equal(prepared.result.structuredContent.preparedPath, 'local-alpha.png');
  for (const invalid of [{}, { manifestPath: '' }, { manifestPath: 'file\nname' }, { manifestPath: 'test', imageIndex: 0 }, { manifestPath: 'test', imageIndex: 5 }, { manifestPath: 'test', imageIndex: '1' }, { ...input, force: true }]) {
    assert.equal((await handler(call(3, 'prepare_game_asset', invalid))).error.code, -32602);
  }
});

test('router check performs only GET models and rejects a changed model before network', async () => {
  const calls = [];
  const handler = await session({
    config: { baseUrl: 'https://router.invalid/v1', model: 'gpt-image-2', apiKey: FIXTURE_KEY },
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ data: [{ id: 'gpt-image-2' }] }), { headers: { 'content-type': 'application/json' } });
    },
  });
  const response = await handler(call(2, 'check_game_image_router'));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://router.invalid/v1/models');
  assert.equal(calls[0].init.method, 'GET');
  assert.equal(response.result.structuredContent.modelAvailable, true);
  assert.equal(response.result.structuredContent.generationVerified, false);
  assert.equal(JSON.stringify(response).includes(FIXTURE_KEY), false);
  const changed = await session({ config: { model: 'other-model' }, fetchImpl: () => { throw new Error('Must not fetch'); } });
  assert.equal((await changed(call(3, 'check_game_image_router'))).result.isError, true);
});

test('tool errors redact known credential encodings and do not echo arbitrary errors to clients', async () => {
  const diagnostics = [];
  const handler = await session({
    env: { IMAGEGEN_ROUTER_API_KEY: FIXTURE_KEY },
    diagnostic: (text) => diagnostics.push(text),
    generateAsset: () => { throw new Error(`request private prompt Bearer ${FIXTURE_KEY} ${encodeURIComponent(FIXTURE_KEY)} ${Buffer.from(FIXTURE_KEY).toString('base64')}`); },
  });
  const response = await handler(call(2, 'generate_game_asset', ASSET));
  assert.equal(response.result.isError, true);
  assert.equal(JSON.stringify(response).includes('private prompt'), false);
  assert.equal(JSON.stringify(response).includes(FIXTURE_KEY), false);
  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].includes(FIXTURE_KEY), false);
  assert.equal(diagnostics[0].includes(Buffer.from(FIXTURE_KEY).toString('base64')), false);
  const results = await session({ env: { IMAGEGEN_ROUTER_API_KEY: FIXTURE_KEY }, planAsset: () => ({ apiKey: FIXTURE_KEY, nested: { apiKeyDpapi: 'cipher', text: `hidden ${FIXTURE_KEY}` } }) });
  const redacted = (await results(call(3, 'plan_game_asset', ASSET))).result;
  assert.equal(redacted.structuredContent.apiKey, undefined);
  assert.equal(redacted.structuredContent.nested.apiKeyDpapi, undefined);
  assert.equal(redacted.structuredContent.nested.text, 'hidden [REDACTED]');
});

test('JSON-RPC errors use correct codes and do not echo request values', async () => {
  const uninitialized = createMcpHandler({ env: {} });
  assert.deepEqual((await uninitialized(request(1, 'ping'))).result, {});
  assert.equal((await uninitialized(request(2, 'tools/list'))).error.code, -32000);
  const handler = await session();
  for (const invalid of [null, [], {}, { jsonrpc: '1.0', id: 3, method: 'ping' }, { jsonrpc: '2.0', id: {}, method: 'ping' }, { jsonrpc: '2.0', id: null, method: 'ping' }]) {
    const response = await handler(invalid);
    assert.equal(response.id, null);
    assert.equal(response.error.code, -32600);
  }
  assert.equal((await handler(request(3, 'unknown-method'))).error.code, -32601);
  assert.equal((await handler(call(4, FIXTURE_KEY))).error.code, -32602);
  assert.equal(JSON.stringify(await handler(call(4, FIXTURE_KEY))).includes(FIXTURE_KEY), false);
});

test('newline transport handles split UTF-8, invalid JSON, oversize lines and EOF', async () => {
  const input = new PassThrough();
  const output = new PassThrough();
  const errors = new PassThrough();
  let captured = '';
  output.on('data', (chunk) => { captured += chunk.toString('utf8'); });
  let diagnostic = '';
  errors.on('data', (chunk) => { diagnostic += chunk; });
  const done = startStdioServer({ input, output, errorOutput: errors, maxLineBytes: 200, handler: async (message) => ({ jsonrpc: '2.0', id: message.id, result: { value: message.params?.value } }) });
  const utf8 = Buffer.from(JSON.stringify(request(1, 'echo', { value: '雪' })) + '\r\n');
  const split = utf8.indexOf(Buffer.from('雪')) + 1;
  input.write(utf8.subarray(0, split));
  input.write(utf8.subarray(split));
  input.write('{invalid-json}\n');
  input.write(Buffer.from([0xff, 10]));
  input.write('x'.repeat(120));
  input.write('x'.repeat(120) + '\n');
  input.end(JSON.stringify(request(2, 'echo', { value: 'EOF' })));
  await done;
  const responses = parseLines(captured);
  assert.equal(responses.find((response) => response.id === 1).result.value, '雪');
  assert.equal(responses.find((response) => response.id === 2).result.value, 'EOF');
  assert.equal(responses.filter((response) => response.error?.code === -32700).length, 3);
  assert.equal(diagnostic, '');
  assert.equal(MAX_LINE_BYTES, 1024 * 1024);
});

test('stdio transport returns ping before a pending generation resolves', async () => {
  let complete;
  const handler = await session({ generateAsset: () => new Promise((resolve) => { complete = resolve; }) });
  const input = new PassThrough();
  const output = new PassThrough();
  const errors = new PassThrough();
  let captured = '';
  output.on('data', (chunk) => { captured += chunk; });
  const done = startStdioServer({ input, output, errorOutput: errors, handler });
  input.write(JSON.stringify(call(2, 'generate_game_asset', ASSET)) + '\n' + JSON.stringify(request(3, 'ping')) + '\n');
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(parseLines(captured).map((response) => response.id), [3]);
  input.end();
  complete({ files: [] });
  await done;
  assert.deepEqual(parseLines(captured).map((response) => response.id), [3, 2]);
});

test('real child stdio initialize/list/plan stays offline and writes no files', async (t) => {
  const root = await fixtureWorkspace(t);
  const script = path.join(WORKSPACE_ROOT, 'scripts/game-assetgen-mcp.mjs');
  const child = spawn(process.execPath, [script, '--workspace', root], {
    cwd: tmpdir(), windowsHide: true,
    env: { ...process.env, GAME_ASSET_WORKSPACE: root, IMAGEGEN_ROUTER_API_KEY: '', IMAGEGEN_ROUTER_CONFIG: path.join(root, 'config-must-not-be-read.json') },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  t.after(() => { if (child.exitCode === null) child.kill(); });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const closed = new Promise((resolve, reject) => { child.on('error', reject); child.on('close', (code) => resolve(code)); });
  child.stdin.end([
    initialize(), { jsonrpc: '2.0', method: 'notifications/initialized' }, request(2, 'tools/list'), call(3, 'plan_game_asset', ASSET), request(4, 'ping'),
  ].map((message) => JSON.stringify(message)).join('\n') + '\n');
  assert.equal(await closed, 0);
  assert.equal(stderr, '');
  assert.equal(stdout.includes('Content-Length'), false);
  const responses = parseLines(stdout);
  assert.equal(responses.length, 4);
  assert.equal(responses.find((response) => response.id === 1).result.protocolVersion, '2025-11-25');
  assert.equal(responses.find((response) => response.id === 2).result.tools.length, 5);
  assert.equal(responses.find((response) => response.id === 3).result.structuredContent.model, 'gpt-image-2');
  assert.deepEqual(responses.find((response) => response.id === 4).result, {});
  assert.deepEqual(await readdir(root), []);
});
