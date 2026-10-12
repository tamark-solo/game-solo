import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  ASSET_PROFILES,
  listAssetProfiles,
  planGameAsset,
  generateGameAsset,
  main,
} from '../../scripts/game-assetgen.mjs';

// All credentials, image bytes and responses are offline fixtures. No owner files are used.
const FIXTURE_KEY = 'game-assetgen-offline-credential-never-use';
const BASE_URL = 'https://game-assets.invalid/v1';
const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jE7sAAAAASUVORK5CYII=';
const PNG = Buffer.from(PNG_BASE64, 'base64');
const PROMPT = '  Cổ kiếm bên hồ ngọc. Keep the owner text exactly.\nKhông tự duyệt ART.\n';
const FIXED_NOW = () => new Date('2026-10-12T00:00:00.000Z');
const ASSET_TYPES = ['icon', 'prop', 'environment-part', 'character-concept', 'vfx-concept', 'ui-art', 'map-concept'];

function input(overrides = {}) {
  return { assetType: 'prop', name: 'offline-fixture', prompt: PROMPT, ...overrides };
}

function fixtureConfig(overrides = {}) {
  return { baseUrl: BASE_URL, apiKey: FIXTURE_KEY, model: 'gpt-image-2', ...overrides };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function mockFetch(respond = () => jsonResponse({ data: [{ b64_json: PNG_BASE64 }] })) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const call = { url: String(url), init };
    calls.push(call);
    return respond(call, calls.length);
  };
  return { calls, fetchImpl };
}

async function temporaryWorkspace(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'game-solo-game-assets-test-'));
  t.after(async () => {
    assert.ok(isInside(tmpdir(), directory));
    assert.ok(path.basename(directory).startsWith('game-solo-game-assets-test-'));
    await rm(directory, { recursive: true, force: true });
  });
  return directory;
}

async function generatedFixture(t, overrides = {}, respond) {
  const workspaceRoot = await temporaryWorkspace(t);
  const transport = mockFetch(respond);
  const result = await generateGameAsset(input(overrides), {
    workspaceRoot, env: {}, config: fixtureConfig(), fetchImpl: transport.fetchImpl, now: FIXED_NOW,
  });
  return { workspaceRoot, ...transport, result };
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

test('all seven asset profiles plan offline without creating workspace files', async (t) => {
  const workspaceRoot = await temporaryWorkspace(t);
  assert.deepEqual(Object.keys(ASSET_PROFILES).sort(), [...ASSET_TYPES].sort());
  const profiles = listAssetProfiles();
  assert.equal(profiles.length, ASSET_TYPES.length);
  for (const assetType of ASSET_TYPES) {
    const first = planGameAsset(input({ assetType }), { workspaceRoot });
    const second = planGameAsset(input({ assetType }), { workspaceRoot });
    assert.deepEqual(first, second, `${assetType} planning must be deterministic`);
  }
  assert.deepEqual(await readdir(workspaceRoot), []);
});

test('planning needs neither an existing directory nor a router key', async (t) => {
  const workspaceRoot = await temporaryWorkspace(t);
  const nonexistent = path.join(workspaceRoot, 'does-not-exist');
  const plan = planGameAsset(input(), { workspaceRoot: nonexistent });
  assert.equal(plan.input.prompt, PROMPT);
  assert.ok(isInside(nonexistent, plan.outputPlan.directoryTemplate));
  assert.deepEqual(await readdir(workspaceRoot), []);
});

test('strict planning rejects unsupported fields, types, names and prompts', () => {
  const invalidInputs = [
    null, [], 'prop', {}, new Date(), Object.assign(Object.create({ inherited: true }), input()),
    input({ assetType: 'sprite' }), input({ assetType: '' }),
    input({ name: '' }), input({ name: '.' }), input({ name: '..' }),
    input({ name: '../escape' }), input({ name: 'nested/name' }),
    input({ name: 'nested\\name' }), input({ name: 'C:\\escape' }),
    input({ name: '/escape' }), input({ name: 'bad:name' }),
    input({ name: 'CON' }), input({ name: 'name.png' }), input({ name: 'a'.repeat(65) }),
    input({ prompt: '' }), input({ prompt: ' \r\n\t' }), input({ prompt: 123 }),
    input({ prompt: 'a'.repeat(32769) }), input({ prompt: 'á'.repeat(16385) }), input({ prompt: 'contains\0NUL' }),
    input({ out: 'owner-map.png' }), input({ model: 'other-model' }),
    input({ ownerApproved: true }), input({ workspaceRoot: 'elsewhere' }),
  ];
  for (const value of invalidInputs) assert.throws(() => planGameAsset(value), undefined, JSON.stringify(value));
});

test('planning enforces image size, quality, count and UTF-8 byte boundaries', () => {
  for (const size of ['auto', '1024x1024', '1024x640', '1536x512', '3840x2160']) {
    assert.doesNotThrow(() => planGameAsset(input({ size })));
  }
  for (const size of ['640x640', '3840x2176', '3072x512', '1000x1000', '3856x1024', '0x1024', 1024]) {
    assert.throws(() => planGameAsset(input({ size })), undefined, String(size));
  }
  for (const n of [1, 2, 3, 4]) assert.doesNotThrow(() => planGameAsset(input({ n })));
  for (const n of [0, 5, 1.5, '2', null]) assert.throws(() => planGameAsset(input({ n })), undefined, String(n));
  for (const quality of ['low', 'medium', 'high', 'auto']) assert.doesNotThrow(() => planGameAsset(input({ quality })));
  for (const quality of ['', 'expensive', 1]) assert.throws(() => planGameAsset(input({ quality })));
  assert.doesNotThrow(() => planGameAsset(input({ prompt: 'a'.repeat(32768) })));
  assert.doesNotThrow(() => planGameAsset(input({ prompt: 'á'.repeat(16384) })));
  assert.doesNotThrow(() => planGameAsset(input({ name: 'a'.repeat(64) })));
});

test('planning preserves the exact brief and records the unmeasured native contract', () => {
  const original = input({ assetType: 'environment-part', size: '1536x1024', quality: 'medium', n: 2 });
  const plan = planGameAsset(original);
  assert.deepEqual(plan.input, original);
  assert.equal(plan.input.prompt, PROMPT);
  assert.equal(plan.model, 'gpt-image-2');
  assert.ok(plan.compiledPrompt.endsWith(PROMPT));
  assert.notEqual(plan.compiledPrompt, PROMPT);
  assert.deepEqual(plan.routerParameters, {
    model: 'gpt-image-2', prompt: plan.compiledPrompt, size: '1536x1024', quality: 'medium', n: 2, timeoutMs: 300000,
  });
  assert.deepEqual(plan.runtimeContract.character, { frame: { width: 64, height: 96 }, anchor: { x: 32, y: 88 }, scale: 1 });
  assert.deepEqual(plan.runtimeContract.vfxR01, { canvas: { width: 96, height: 96 }, body: 80, pivot: { x: 48, y: 88 }, scale: 1 });
  assert.equal(plan.runtimeContract.sourceIsNativeArtifact, false);
  assert.deepEqual(plan.runtimeContract.nativeArtifact, { status: 'not-produced', path: null, automaticResize: false });
  assert.deepEqual(plan.runtimeContract.pivot, { status: 'pending-measurement-and-review', value: null });
  assert.equal(plan.runtimeContract.needsAlphaExtraction, true);
  assert.equal(plan.runtimeContract.alpha.extracted, false);
  assert.equal(plan.runtimeContract.alpha.background, '#FF00FF');
  assert.match(plan.runtimeContract.alpha.status, /pending/);
  assert.equal(plan.runtimeContract.multipart.sharedCanvasAndPivotRequired, true);
  assert.deepEqual(plan.runtimeContract.gameplayData, { produced: false, collision: false, navigation: false });
  assert.deepEqual(plan.review, { status: 'preview-only', ownerApproved: false, artApproved: false, visualReview: 'pending', nativeReview: 'pending', pivotReview: 'pending' });
  assert.equal(plan.workflow.automaticRuntimeImport, false);
  assert.equal(plan.workflow.automaticNativeExport, false);
  assert.equal(plan.outputPlan.pathIsReserved, false);
  original.prompt = 'changed after plan';
  assert.equal(plan.input.prompt, PROMPT, 'the original input must be copied');
});

test('profile listing is detached from the frozen profile registry', () => {
  const listing = listAssetProfiles();
  const icon = listing.find((profile) => profile.assetType === 'icon');
  icon.promptGuidance.push('offline mutation');
  icon.defaultSize = 'auto';
  assert.ok(Object.isFrozen(ASSET_PROFILES));
  assert.ok(Object.isFrozen(ASSET_PROFILES.icon.promptGuidance));
  assert.equal(ASSET_PROFILES.icon.defaultSize, '1024x1024');
  assert.ok(!ASSET_PROFILES.icon.promptGuidance.includes('offline mutation'));
});

test('alpha profiles compile a pure magenta source brief without claiming extracted alpha', () => {
  for (const assetType of ASSET_TYPES) {
    const plan = planGameAsset(input({ assetType }));
    const needsAlpha = ['icon', 'prop', 'environment-part'].includes(assetType);
    assert.equal(plan.runtimeContract.needsAlphaExtraction, needsAlpha);
    assert.equal(plan.runtimeContract.alpha.extracted, false);
    if (needsAlpha) {
      assert.match(plan.compiledPrompt, /perfectly flat solid magenta background \(#FF00FF\)/);
      assert.match(plan.compiledPrompt, /do not draw a checkerboard or claim transparent pixels/);
      assert.match(plan.runtimeContract.alpha.status, /pending-chroma-key-extraction/);
    } else {
      assert.equal(plan.runtimeContract.alpha.status, 'pending-production-decision');
    }
  }
});

test('generation sends one fixed-model POST and saves a completed source preview manifest', async (t) => {
  const { workspaceRoot, calls, result } = await generatedFixture(t, { size: '1536x1024', quality: 'medium' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${BASE_URL}/images/generations`);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.redirect, 'error');
  assert.equal(new Headers(calls[0].init.headers).get('authorization'), `Bearer ${FIXTURE_KEY}`);
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body, { model: 'gpt-image-2', prompt: result.compiledPrompt, size: '1536x1024', quality: 'medium', n: 1, output_format: 'png' });
  assert.equal(result.input.prompt, PROMPT);
  assert.ok(result.compiledPrompt.endsWith(PROMPT));
  assert.equal(result.generationStatus, 'completed');
  assert.equal(result.status, 'preview-only');
  assert.equal(result.ownerApproved, false);
  assert.equal(result.artApproved, false);
  assert.equal(result.generationVerified, true);
  assert.equal(result.requestedCount, 1);
  assert.equal(result.returnedCount, 1);
  assert.equal(result.requestedAt, '2026-10-12T00:00:00.000Z');
  assert.equal(result.generatedAt, '2026-10-12T00:00:00.000Z');
  assert.ok(isInside(path.join(workspaceRoot, 'output', 'imagegen', 'game-assets'), result.outputDirectory));
  assert.equal(path.basename(result.requestPath), 'request.json');
  assert.equal(path.basename(result.manifestPath), 'manifest.json');
  assert.ok(isInside(result.outputDirectory, result.requestPath));
  assert.ok(isInside(result.outputDirectory, result.manifestPath));
  const manifestText = await readFile(result.manifestPath, 'utf8');
  assert.deepEqual(JSON.parse(manifestText), result);
  const requestText = await readFile(result.requestPath, 'utf8');
  const request = JSON.parse(requestText);
  assert.equal(request.generationStatus, 'request-saved-before-network');
  assert.equal(request.input.prompt, PROMPT);
  assert.deepEqual(request.routerParameters, result.routerParameters);
  for (const text of [requestText, manifestText]) assert.ok(!text.includes(FIXTURE_KEY));
  const file = result.files[0];
  assert.equal(file.sourcePath, file.path);
  assert.equal(file.role, 'generated-source-preview');
  assert.equal(file.mimeType, 'image/png');
  assert.equal(file.sha256, createHash('sha256').update(PNG).digest('hex'));
  assert.deepEqual(file.dimensions, { width: 1, height: 1 });
  assert.equal(file.sizeMatchesRequest, false);
  assert.deepEqual(file.nativeArtifact, { status: 'not-produced', path: null });
  assert.deepEqual(file.pivot, { status: 'pending-measurement-and-review', value: null });
  assert.equal(file.needsAlphaExtraction, true);
  assert.ok(isInside(result.outputDirectory, file.path));
  assert.deepEqual(await readFile(file.path), PNG);
  assert.match(result.warnings[0], /returned 1x1, requested 1536x1024/);
  const metadata = JSON.parse(await readFile(file.metadataPath, 'utf8'));
  assert.equal(metadata.image.source, 'b64_json');
  assert.equal(metadata.image.sha256, file.sha256);
  assert.equal(metadata.image.bytes, PNG.length);
  assert.deepEqual(metadata.image.dimensions, file.dimensions);
  assert.equal(metadata.prompt, result.compiledPrompt);
  assert.equal(metadata.ownerApproved, false);
  assert.equal(metadata.artApproved, false);
  assert.equal(metadata.verification.visualReview, 'pending');
  assert.equal(metadata.verification.sizeMatchesRequest, false);
  assert.deepEqual((await readdir(result.outputDirectory)).sort(), ['manifest.json', 'request.json', 'source.json', 'source.png']);
});

test('request and exact brief are saved before the generation POST begins', async (t) => {
  const workspaceRoot = await temporaryWorkspace(t);
  const transport = mockFetch(async () => {
    const directories = await readdir(path.join(workspaceRoot, 'output', 'imagegen', 'game-assets'));
    assert.equal(directories.length, 1);
    const directory = path.join(workspaceRoot, 'output', 'imagegen', 'game-assets', directories[0]);
    const request = JSON.parse(await readFile(path.join(directory, 'request.json'), 'utf8'));
    assert.equal(request.input.prompt, PROMPT);
    assert.equal(request.generationStatus, 'request-saved-before-network');
    return jsonResponse({ data: [{ b64_json: PNG_BASE64 }] });
  });
  await generateGameAsset(input(), { workspaceRoot, env: {}, config: fixtureConfig(), fetchImpl: transport.fetchImpl, now: FIXED_NOW });
  assert.equal(transport.calls.length, 1);
});

test('repeated names and multi-image outputs reserve new directories without replacing sources', async (t) => {
  const workspaceRoot = await temporaryWorkspace(t);
  const transport = mockFetch(() => jsonResponse({ data: [{ b64_json: PNG_BASE64 }, { b64_json: PNG_BASE64 }] }));
  const options = { workspaceRoot, env: {}, config: fixtureConfig(), fetchImpl: transport.fetchImpl, now: FIXED_NOW };
  const first = await generateGameAsset(input({ n: 2 }), options);
  const firstManifest = await readFile(first.manifestPath, 'utf8');
  const firstSource = await readFile(first.files[0].path);
  const second = await generateGameAsset(input({ n: 2 }), options);
  assert.equal(transport.calls.length, 2, 'one POST per explicit call');
  assert.notEqual(first.outputDirectory, second.outputDirectory);
  assert.deepEqual(first.files.map((file) => path.basename(file.path)), ['source-01.png', 'source-02.png']);
  assert.deepEqual(second.files.map((file) => path.basename(file.path)), ['source-01.png', 'source-02.png']);
  assert.equal(await readFile(first.manifestPath, 'utf8'), firstManifest);
  assert.deepEqual(await readFile(first.files[0].path), firstSource);
  for (const call of transport.calls) assert.equal(JSON.parse(call.init.body).n, 2);
  for (const file of [...first.files, ...second.files]) assert.deepEqual(await readFile(file.path), PNG);
});

test('invalid generation input fails before network and before output reservation', async (t) => {
  const workspaceRoot = await temporaryWorkspace(t);
  const transport = mockFetch(() => { throw new Error('must fail before POST'); });
  for (const invalid of [input({ name: '../escape' }), input({ assetType: 'unknown' }), input({ force: true }), input({ size: '64x96' }), input({ prompt: ' ' }), input({ n: 5 })]) {
    await assert.rejects(generateGameAsset(invalid, { workspaceRoot, env: {}, config: fixtureConfig(), fetchImpl: transport.fetchImpl }));
  }
  assert.equal(transport.calls.length, 0);
  assert.deepEqual(await readdir(workspaceRoot), []);
});

test('wrong configured model creates a failed review manifest without sending a POST', async (t) => {
  const workspaceRoot = await temporaryWorkspace(t);
  const transport = mockFetch(() => { throw new Error('wrong model must fail before POST'); });
  let failure;
  await assert.rejects(generateGameAsset(input(), { workspaceRoot, env: {}, config: fixtureConfig({ model: 'another-model' }), fetchImpl: transport.fetchImpl, now: FIXED_NOW }), (error) => {
    failure = error;
    assert.match(error.message, /requires configured model gpt-image-2/);
    return true;
  });
  assert.equal(transport.calls.length, 0);
  const manifest = JSON.parse(await readFile(failure.manifestPath, 'utf8'));
  assert.equal(manifest.generationStatus, 'failed');
  assert.equal(manifest.model, 'gpt-image-2');
  assert.equal(manifest.input.prompt, PROMPT);
  assert.equal(manifest.retryPerformed, false);
  assert.equal(manifest.ownerApproved, false);
  assert.equal(manifest.artApproved, false);
  assert.deepEqual(manifest.files, []);
  assert.deepEqual((await readdir(failure.outputDirectory)).sort(), ['manifest.json', 'request.json']);
});

test('symlink output escapes fail before network and leave the destination unchanged', async (t) => {
  for (const level of ['output', 'imagegen', 'game-assets']) {
    const workspaceRoot = await temporaryWorkspace(t);
    const outside = await temporaryWorkspace(t);
    await writeFile(path.join(outside, 'owner-fixture.txt'), 'preserve outside fixture');
    const components = ['output', 'imagegen', 'game-assets'];
    const index = components.indexOf(level);
    const parent = path.join(workspaceRoot, ...components.slice(0, index));
    await mkdir(parent, { recursive: true });
    // A Windows junction is available without developer-mode symlink privileges.
    await symlink(outside, path.join(parent, level), process.platform === 'win32' ? 'junction' : 'dir');
    const transport = mockFetch(() => { throw new Error('symlink escape must fail before POST'); });
    await assert.rejects(generateGameAsset(input(), { workspaceRoot, env: {}, config: fixtureConfig(), fetchImpl: transport.fetchImpl, now: FIXED_NOW }), /symbolic links|outside the workspace|ordinary directories/);
    assert.equal(transport.calls.length, 0);
    assert.deepEqual(await readdir(outside), ['owner-fixture.txt']);
    assert.equal(await readFile(path.join(outside, 'owner-fixture.txt'), 'utf8'), 'preserve outside fixture');
  }
});

test('router failures create sanitized failed manifests and never retry a paid POST', async (t) => {
  for (const respond of [
    () => { throw new Error(`socket failure ${FIXTURE_KEY}; Authorization: Bearer other-offline-private-token`); },
    () => jsonResponse({ error: { message: `Invalid credential ${FIXTURE_KEY}; Authorization: Bearer other-offline-private-token` } }, 429),
    () => jsonResponse({ data: [{ b64_json: Buffer.from('not an image').toString('base64') }] }),
  ]) {
    const workspaceRoot = await temporaryWorkspace(t);
    const transport = mockFetch(respond);
    let failure;
    await assert.rejects(generateGameAsset(input(), { workspaceRoot, env: {}, config: fixtureConfig(), fetchImpl: transport.fetchImpl, now: FIXED_NOW }), (error) => {
      failure = error;
      assert.ok(!String(error).includes(FIXTURE_KEY));
      assert.ok(!String(error).includes('other-offline-private-token'));
      return true;
    });
    assert.equal(transport.calls.length, 1);
    assert.equal(transport.calls[0].init.method, 'POST');
    const manifestText = await readFile(failure.manifestPath, 'utf8');
    const manifest = JSON.parse(manifestText);
    assert.equal(manifest.generationStatus, 'failed');
    assert.equal(manifest.generationVerified, false);
    assert.equal(manifest.retryPerformed, false);
    assert.equal(manifest.error, failure.message);
    assert.equal(manifest.input.prompt, PROMPT);
    assert.equal(manifest.ownerApproved, false);
    assert.equal(manifest.artApproved, false);
    assert.equal(manifest.review.nativeReview, 'pending');
    assert.deepEqual(manifest.files, []);
    assert.ok(!manifestText.includes(FIXTURE_KEY));
    assert.ok(!manifestText.includes('other-offline-private-token'));
    assert.deepEqual((await readdir(failure.outputDirectory)).sort(), ['manifest.json', 'request.json']);
  }
});

function capturedStreams() {
  let stdoutText = '';
  let stderrText = '';
  return {
    stdout: { write: (value) => { stdoutText += value; } },
    stderr: { write: (value) => { stderrText += value; } },
    output: () => ({ stdoutText, stderrText }),
  };
}

test('CLI UTF-8 spec dry-run preserves the exact brief without files, keys or network', async (t) => {
  const workspaceRoot = await temporaryWorkspace(t);
  const specPath = path.join(workspaceRoot, 'offline-spec.json');
  await writeFile(specPath, JSON.stringify(input({ assetType: 'character-concept' })), 'utf8');
  const streams = capturedStreams();
  const transport = mockFetch(() => { throw new Error('dry-run must not fetch'); });
  const env = { get IMAGEGEN_ROUTER_API_KEY() { throw new Error('dry-run must not read a key'); } };
  const code = await main(['generate', '--spec-file', specPath, '--dry-run'], {
    workspaceRoot, env, fetchImpl: transport.fetchImpl, ...streams,
  });
  assert.equal(code, 0);
  const { stdoutText, stderrText } = streams.output();
  assert.equal(stderrText, '');
  const plan = JSON.parse(stdoutText);
  assert.equal(plan.input.prompt, PROMPT);
  assert.ok(plan.compiledPrompt.endsWith(PROMPT));
  assert.equal(plan.model, 'gpt-image-2');
  assert.equal(plan.outputPlan.pathIsReserved, false);
  assert.equal(transport.calls.length, 0);
  assert.deepEqual(await readdir(workspaceRoot), ['offline-spec.json']);
});

test('CLI rejects ambiguous specs, unknown arguments and invalid UTF-8 before network', async (t) => {
  const workspaceRoot = await temporaryWorkspace(t);
  const badUtf8 = path.join(workspaceRoot, 'bad-utf8.json');
  await writeFile(badUtf8, Buffer.from([0xc3, 0x28]));
  const oversized = path.join(workspaceRoot, 'oversized.json');
  await writeFile(oversized, 'a'.repeat(65537));
  const malformed = path.join(workspaceRoot, 'malformed.json');
  await writeFile(malformed, `{ malformed ${FIXTURE_KEY}`, 'utf8');
  const transport = mockFetch(() => { throw new Error('CLI errors must fail before POST'); });
  for (const argv of [
    ['plan'],
    ['plan', '--spec', JSON.stringify(input()), '--spec-file', badUtf8],
    ['generate', '--spec', JSON.stringify(input()), '--force'],
    ['generate', '--spec', JSON.stringify(input()), '--api-key', FIXTURE_KEY],
    ['plan', '--spec', JSON.stringify(input()), '--dry-run'],
    ['plan', '--spec', JSON.stringify(input()), '--spec', JSON.stringify(input())],
    ['plan', '--spec-file', badUtf8],
    ['plan', '--spec-file', oversized],
    ['plan', '--spec-file', malformed],
  ]) {
    const streams = capturedStreams();
    const code = await main(argv, { workspaceRoot, env: {}, fetchImpl: transport.fetchImpl, ...streams });
    assert.equal(code, 1, argv.join(' '));
    const { stdoutText, stderrText } = streams.output();
    assert.equal(stdoutText, '');
    assert.equal(typeof JSON.parse(stderrText).error, 'string');
    assert.ok(!stderrText.includes(FIXTURE_KEY));
  }
  assert.equal(transport.calls.length, 0);
  assert.deepEqual((await readdir(workspaceRoot)).sort(), ['bad-utf8.json', 'malformed.json', 'oversized.json']);
});

test('CLI generation returns sanitized JSON failure and its saved manifest path', async (t) => {
  const workspaceRoot = await temporaryWorkspace(t);
  const streams = capturedStreams();
  const transport = mockFetch(() => { throw new Error(`transport failed ${FIXTURE_KEY}`); });
  const code = await main(['generate', '--spec', JSON.stringify(input())], {
    workspaceRoot, env: {}, config: fixtureConfig(), fetchImpl: transport.fetchImpl, now: FIXED_NOW, ...streams,
  });
  assert.equal(code, 1);
  assert.equal(transport.calls.length, 1);
  const { stdoutText, stderrText } = streams.output();
  assert.equal(stdoutText, '');
  assert.ok(!stderrText.includes(FIXTURE_KEY));
  const cliError = JSON.parse(stderrText);
  assert.match(cliError.error, /transport failed/);
  assert.ok(isInside(path.join(workspaceRoot, 'output', 'imagegen', 'game-assets'), cliError.manifestPath));
  const manifest = JSON.parse(await readFile(cliError.manifestPath, 'utf8'));
  assert.equal(manifest.generationStatus, 'failed');
  assert.equal(manifest.retryPerformed, false);
  assert.equal(manifest.error, cliError.error);
  assert.equal(manifest.input.prompt, PROMPT);
});
