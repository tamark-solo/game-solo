import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { deflateSync } from 'node:zlib';
import { generateGameAsset } from '../../scripts/game-assetgen.mjs';
import { prepareGameAsset } from '../../scripts/game-asset-prepare.mjs';

const CODEX_DIRECTORY = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
const HELPER = path.join(CODEX_DIRECTORY, 'skills/.system/imagegen/scripts/remove_chroma_key.py');
const PYTHON = process.env.GAME_ASSET_PYTHON || 'python';
const ENV = { CODEX_HOME: CODEX_DIRECTORY, GAME_ASSET_PYTHON: PYTHON };
const FIXED_NOW = () => Date.parse('2026-10-12T00:00:00Z');
const HASH = (bytes) => createHash('sha256').update(bytes).digest('hex');
const STATS = { width: 12, height: 12, totalPixels: 144, transparentPixels: 108, partialPixels: 0, opaquePixels: 36, contentBounds: [3, 3, 9, 9] };
let localReady = true;
try { await fs.access(HELPER); execFileSync(PYTHON, ['-c', 'from PIL import Image'], { windowsHide: true, stdio: 'ignore', timeout: 10_000 }); }
catch { localReady = false; }
const LOCAL_TEST = { skip: localReady ? false : 'Python, Pillow and installed ImageGen chroma helper required for local alpha tests.' };

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, bytes) {
  const name = Buffer.from(type); const length = Buffer.alloc(4); const crc = Buffer.alloc(4);
  length.writeUInt32BE(bytes.length); crc.writeUInt32BE(crc32(Buffer.concat([name, bytes])));
  return Buffer.concat([length, name, bytes, crc]);
}
function keyedPng() {
  const header = Buffer.alloc(13); header.writeUInt32BE(12); header.writeUInt32BE(12, 4); header[8] = 8; header[9] = 2;
  const pixels = Buffer.alloc(12 * 37);
  for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
    const offset = y * 37 + 1 + x * 3;
    const rgb = x >= 3 && x < 9 && y >= 3 && y < 9 ? [20, 120, 90] : [255, 0, 255];
    rgb.forEach((channel, index) => { pixels[offset + index] = channel; });
  }
  return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}
const PNG = keyedPng();

async function fixture(t, assetType = 'prop') {
  const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'game-solo-alpha-test-'));
  t.after(async () => {
    const relative = path.relative(await fs.realpath(os.tmpdir()), await fs.realpath(workspaceRoot));
    assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative));
    assert.ok(path.basename(workspaceRoot).startsWith('game-solo-alpha-test-'));
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });
  const manifest = await generateGameAsset({ assetType, name: 'synthetic-fixture', prompt: 'Synthetic test fixture only' }, {
    workspaceRoot, env: {}, config: { baseUrl: 'https://fixture.invalid/v1', apiKey: 'offline-alpha-fixture', model: 'gpt-image-2' }, now: FIXED_NOW,
    fetchImpl: async () => new Response(JSON.stringify({ data: [{ b64_json: PNG.toString('base64') }] }), { headers: { 'content-type': 'application/json' } }),
  });
  return { workspaceRoot, manifest, manifestPath: manifest.manifestPath, sourcePath: manifest.files[0].path };
}

async function mockProcess(command, args) {
  if (args[0] === '-c') return JSON.stringify({ source: STATS, prepared: STATS });
  await fs.writeFile(args[args.indexOf('--out') + 1], PNG, { flag: 'wx' });
  return '';
}

test('real local extraction preserves source and canvas while recording alpha and pending review', LOCAL_TEST, async (t) => {
  const f = await fixture(t);
  const before = await fs.readFile(f.sourcePath);
  const result = await prepareGameAsset({ manifestPath: f.manifestPath }, { workspaceRoot: f.workspaceRoot, env: ENV, now: FIXED_NOW });
  assert.deepEqual(await fs.readFile(f.sourcePath), before);
  assert.equal(result.sourceSha256, HASH(before));
  assert.equal(result.sha256, HASH(await fs.readFile(result.path)));
  assert.deepEqual(result.dimensions, { width: 12, height: 12 });
  assert.deepEqual(result.alpha, STATS);
  assert.equal(result.ownerApproved, false); assert.equal(result.artApproved, false);
  assert.equal(result.preparation.keyColor, '#ff00ff');
  assert.equal(result.preparation.canvasPreserved, true);
  assert.equal(result.preparation.resized, false); assert.equal(result.preparation.cropped, false);
  assert.equal(result.preparation.helperSha256, HASH(await fs.readFile(HELPER)));
  assert.deepEqual(result.review, { alphaEdges: 'pending', measuredPivot: null, nativeExport: 'pending', runtimeIntegration: 'pending', ownerArtApproval: 'pending' });
  const updated = JSON.parse(await fs.readFile(f.manifestPath, 'utf8'));
  assert.equal(updated.preparedFiles.length, 1);
  assert.equal(updated.preparedFiles[0].path, result.path);
  assert.equal(updated.runtimeContract.alpha.extracted, false, 'prepared preview does not approve native alpha');
  assert.equal(updated.ownerApproved, false); assert.equal(updated.artApproved, false);
  assert.equal(JSON.parse(await fs.readFile(result.reportPath, 'utf8')).sha256, result.sha256);
  await assert.rejects(fs.access(`${f.manifestPath}.prepare.lock`));
  const second = await prepareGameAsset({ manifestPath: f.manifestPath }, { workspaceRoot: f.workspaceRoot, env: ENV, now: FIXED_NOW });
  assert.notEqual(second.path, result.path);
  assert.equal(JSON.parse(await fs.readFile(f.manifestPath, 'utf8')).preparedFiles.length, 2);
  await fs.access(result.path);
});

test('invalid input is rejected before starting a local helper', async () => {
  let calls = 0;
  for (const input of [null, [], {}, { manifestPath: '' }, { manifestPath: 'x', force: true }, { manifestPath: 'x', imageIndex: 0 }, { manifestPath: 'x', imageIndex: '1' }, { manifestPath: 'x', imageIndex: 5 }]) {
    await assert.rejects(prepareGameAsset(input, { executeImpl: async () => { calls++; } }));
  }
  assert.equal(calls, 0);
});

test('foreign manifest and source paths cannot be processed', async (t) => {
  const f = await fixture(t); let calls = 0;
  const options = { workspaceRoot: f.workspaceRoot, executeImpl: async () => { calls++; } };
  const outside = path.join(f.workspaceRoot, 'owner-fixture.png'); await fs.writeFile(outside, PNG);
  const foreignManifest = path.join(f.workspaceRoot, 'owner-manifest.json'); await fs.writeFile(foreignManifest, JSON.stringify(f.manifest));
  await assert.rejects(prepareGameAsset({ manifestPath: foreignManifest }, options), /staging directory/);
  const changed = { ...f.manifest, files: [{ ...f.manifest.files[0], path: outside }] };
  await fs.writeFile(f.manifestPath, JSON.stringify(changed));
  await assert.rejects(prepareGameAsset({ manifestPath: f.manifestPath }, options), /own asset package/);
  assert.equal(calls, 0); assert.deepEqual(await fs.readFile(outside), PNG);
});

test('hash mismatch, failed generation, non-keyed and malformed manifests fail before processing', async (t) => {
  const f = await fixture(t); let calls = 0;
  const options = { workspaceRoot: f.workspaceRoot, executeImpl: async () => { calls++; } };
  for (const value of [null, [], '{broken-json', { ...f.manifest, generationStatus: 'failed' }, { ...f.manifest, model: 'other-model' }, { ...f.manifest, assetType: 'vfx-concept' }, { ...f.manifest, runtimeContract: {} }, { ...f.manifest, files: [] }, { ...f.manifest, files: [{ ...f.manifest.files[0], sha256: 'bad-hash' }] }]) {
    await fs.writeFile(f.manifestPath, typeof value === 'string' ? value : JSON.stringify(value));
    await assert.rejects(prepareGameAsset({ manifestPath: f.manifestPath }, options));
  }
  assert.equal(calls, 0); assert.deepEqual(await fs.readFile(f.sourcePath), PNG);
});

test('prepared directory junction escape is refused without writing outside the package', LOCAL_TEST, async (t) => {
  const f = await fixture(t);
  const outside = path.join(f.workspaceRoot, 'owner-fixture'); await fs.mkdir(outside);
  await fs.symlink(outside, path.join(f.manifest.outputDirectory, 'prepared'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(prepareGameAsset({ manifestPath: f.manifestPath }, { workspaceRoot: f.workspaceRoot, env: ENV }), /escapes/);
  assert.deepEqual(await fs.readdir(outside), []);
});

test('helper failure and invalid dimensions clean partial outputs and release package lock', LOCAL_TEST, async (t) => {
  for (const mode of ['helper-error', 'different-canvas', 'bad-statistics', 'invalid-clock']) {
    const f = await fixture(t); const original = await fs.readFile(f.manifestPath, 'utf8');
    const executeImpl = async (command, args) => {
      if (args[0] !== '-c') { await mockProcess(command, args); if (mode === 'helper-error') throw new Error('synthetic helper failure'); return ''; }
      const stats = mode === 'bad-statistics' ? { ...STATS, totalPixels: 1 } : { ...STATS, width: 13, totalPixels: 156, transparentPixels: 120 };
      return JSON.stringify({ source: STATS, prepared: stats });
    };
    await assert.rejects(prepareGameAsset({ manifestPath: f.manifestPath }, { workspaceRoot: f.workspaceRoot, env: ENV, executeImpl, now: mode === 'invalid-clock' ? () => NaN : FIXED_NOW }));
    assert.equal(await fs.readFile(f.manifestPath, 'utf8'), original);
    assert.deepEqual(await fs.readFile(f.sourcePath), PNG);
    assert.deepEqual(await fs.readdir(path.join(f.manifest.outputDirectory, 'prepared')), []);
    await assert.rejects(fs.access(`${f.manifestPath}.prepare.lock`));
  }
});

test('concurrent preparations refuse the second operation without losing metadata', LOCAL_TEST, async (t) => {
  const f = await fixture(t); let started; let release;
  const ready = new Promise((resolve) => { started = resolve; });
  const held = new Promise((resolve) => { release = resolve; });
  const first = prepareGameAsset({ manifestPath: f.manifestPath }, { workspaceRoot: f.workspaceRoot, env: ENV, executeImpl: async (command, args) => { if (args[0] !== '-c') { started(); await held; } return mockProcess(command, args); } });
  await ready;
  await assert.rejects(prepareGameAsset({ manifestPath: f.manifestPath }, { workspaceRoot: f.workspaceRoot, env: ENV, executeImpl: mockProcess }), /already being prepared/);
  release(); await first;
  assert.equal(JSON.parse(await fs.readFile(f.manifestPath, 'utf8')).preparedFiles.length, 1);
});

test('external manifest or source edits during preparation are preserved and partial results discarded', LOCAL_TEST, async (t) => {
  for (const target of ['manifest', 'source']) {
    const f = await fixture(t);
    const changed = target === 'manifest' ? `${JSON.stringify({ ...f.manifest, ownerNote: 'external update' })}\n` : Buffer.from('external source update');
    const editedPath = target === 'manifest' ? f.manifestPath : f.sourcePath;
    const executeImpl = async (command, args) => {
      const result = await mockProcess(command, args);
      if (args[0] !== '-c') await fs.writeFile(editedPath, changed);
      return result;
    };
    await assert.rejects(prepareGameAsset({ manifestPath: f.manifestPath }, { workspaceRoot: f.workspaceRoot, env: ENV, executeImpl }), /changed during/);
    assert.deepEqual(await fs.readFile(editedPath), Buffer.from(changed));
    assert.deepEqual(await fs.readdir(path.join(f.manifest.outputDirectory, 'prepared')), []);
    await assert.rejects(fs.access(`${f.manifestPath}.prepare.lock`));
  }
});
