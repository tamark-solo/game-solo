#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALPHA_TYPES = new Set(['icon', 'prop', 'environment-part']);
const INSPECT = `import json,sys
from PIL import Image
def inspect(filename):
    with Image.open(filename) as im:
        rgba=im.convert('RGBA')
        alpha=rgba.getchannel('A')
        hist=alpha.histogram()
        return dict(width=im.width,height=im.height,totalPixels=im.width*im.height,transparentPixels=hist[0],partialPixels=sum(hist[1:255]),opaquePixels=hist[255],contentBounds=alpha.getbbox())
print(json.dumps(dict(prepared=inspect(sys.argv[1]),source=inspect(sys.argv[2]))))`;

function inside(directory, candidate) {
  const relative = path.relative(directory, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function execute(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks = [];
    let bytes = 0;
    let done = false;
    const finish = (error, output) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (error) reject(error); else resolve(output);
    };
    const timer = setTimeout(() => { child.kill(); finish(new Error('Local asset preparation timed out. Source image preserved.')); }, 90_000);
    child.stdout.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > 2 * 1024 * 1024) { child.kill(); finish(new Error('Local image helper returned too much output.')); }
      else chunks.push(chunk);
    });
    child.stderr.resume();
    child.on('error', () => finish(new Error('Could not start Python. Configure GAME_ASSET_PYTHON with Python and Pillow installed.')));
    child.on('close', (code) => {
      if (code !== 0) finish(new Error('Local image helper failed. Check Python, Pillow and the bundled ImageGen chroma helper. Source image preserved.'));
      else finish(null, Buffer.concat(chunks).toString('utf8'));
    });
  });
}

export async function prepareGameAsset(input, { workspaceRoot = PROJECT_ROOT, env = process.env, executeImpl = execute, now = Date.now } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some((key) => !['manifestPath', 'imageIndex'].includes(key))) throw new Error('Supply only manifestPath and optional imageIndex.');
  if (typeof input.manifestPath !== 'string' || !input.manifestPath) throw new Error('manifestPath is required.');
  const index = input.imageIndex ?? 1;
  if (!Number.isInteger(index) || index < 1 || index > 4) throw new Error('imageIndex must be an integer from 1 through 4.');
  const root = await fs.realpath(workspaceRoot);
  const staging = await fs.realpath(path.join(root, 'output', 'imagegen', 'game-assets'));
  if (!inside(root, staging)) throw new Error('The asset staging directory escapes the workspace.');
  const manifestPath = await fs.realpath(path.resolve(root, input.manifestPath));
  if (!inside(staging, manifestPath)) throw new Error('Only game asset manifests inside the staging directory can be prepared.');
  if (path.basename(manifestPath) !== 'manifest.json') throw new Error('Select the manifest.json of a generated asset package.');
  const manifestStat = await fs.stat(manifestPath);
  if (!manifestStat.isFile() || manifestStat.size > 2 * 1024 * 1024) throw new Error('Asset manifest must be a file smaller than 2 MiB.');
  const rawManifest = await fs.readFile(manifestPath, 'utf8');
  if (Buffer.byteLength(rawManifest) > 2 * 1024 * 1024) throw new Error('Asset manifest is too large.');
  let manifest;
  try { manifest = JSON.parse(rawManifest); } catch { throw new Error('Asset manifest contains invalid JSON.'); }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest) || manifest.model !== 'gpt-image-2' || !ALPHA_TYPES.has(manifest.assetType)) throw new Error('Alpha preparation supports icon, prop and environment-part sources generated with gpt-image-2.');
  if (manifest.generationStatus !== 'completed' || manifest.runtimeContract?.alpha?.background !== '#FF00FF') throw new Error('Select a completed source package with a declared #FF00FF key background.');
  const item = manifest.files?.[index - 1];
  if (!item || typeof item.path !== 'string' || typeof item.sha256 !== 'string') throw new Error('The requested source image is missing from the asset manifest.');
  const directory = path.dirname(manifestPath);
  const sourcePath = await fs.realpath(path.resolve(directory, item.path));
  if (!inside(directory, sourcePath)) throw new Error('Source images must stay inside their own asset package.');
  const sourceStat = await fs.stat(sourcePath);
  if (!sourceStat.isFile() || sourceStat.size > 32 * 1024 * 1024) throw new Error('Source image must be a file smaller than 32 MiB.');
  const sourceBytes = await fs.readFile(sourcePath);
  const sourceHash = createHash('sha256').update(sourceBytes).digest('hex');
  if (sourceHash !== item.sha256) throw new Error('Source image hash differs from its manifest. Preparation stopped.');
  const helper = path.join(env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'skills', '.system', 'imagegen', 'scripts', 'remove_chroma_key.py');
  await fs.access(helper);
  const python = env.GAME_ASSET_PYTHON || 'python';
  const preparedDirectory = path.join(directory, 'prepared');
  await fs.mkdir(preparedDirectory, { recursive: true });
  const preparedReal = await fs.realpath(preparedDirectory);
  if (!inside(directory, preparedReal)) throw new Error('The prepared directory escapes its asset package.');
  const lockPath = `${manifestPath}.prepare.lock`;
  let lock;
  try { lock = await fs.open(lockPath, 'wx'); } catch { throw new Error('This asset package is already being prepared. Try after the current preparation finishes.'); }
  let outputPath;
  let reportPath;
  let complete = false;
  try {
    if (await fs.readFile(manifestPath, 'utf8') !== rawManifest) throw new Error('Asset manifest changed during preparation setup. Retry using the current package.');
    const stamp = new Date(now()).toISOString().replace(/[:.]/g, '-');
    outputPath = path.join(preparedReal, `image-${String(index).padStart(2, '0')}-alpha-${stamp}-${randomBytes(4).toString('hex')}.png`);
    reportPath = outputPath.replace(/\.png$/i, '.json');
    await executeImpl(python, [helper, '--input', sourcePath, '--out', outputPath, '--key-color', '#ff00ff', '--soft-matte', '--spill-cleanup']);
    const inspected = JSON.parse(await executeImpl(python, ['-c', INSPECT, outputPath, sourcePath]));
    const stats = inspected.prepared;
    if (!stats || !inspected.source || !['width', 'height', 'totalPixels', 'transparentPixels', 'partialPixels', 'opaquePixels'].every((key) => Number.isSafeInteger(stats[key]) && stats[key] >= 0) || stats.width < 1 || stats.height < 1 || stats.totalPixels !== stats.width * stats.height || stats.transparentPixels + stats.partialPixels + stats.opaquePixels !== stats.totalPixels) throw new Error('Local image inspection returned invalid pixel statistics.');
    if (stats.width !== inspected.source.width || stats.height !== inspected.source.height) throw new Error('Preparation changed image dimensions. Source image preserved.');
    if (createHash('sha256').update(await fs.readFile(sourcePath)).digest('hex') !== sourceHash) throw new Error('Source image changed during preparation. Result discarded.');
    const imageBytes = await fs.readFile(outputPath);
    const warnings = [];
    if (stats.transparentPixels === 0) warnings.push('No fully transparent pixels found. Inspect the key background and matte before use.');
    if (stats.opaquePixels + stats.partialPixels === 0) warnings.push('The result has no visible pixels. Review the source palette and key color.');
    const prepared = {
      version: 1, status: 'prepared-preview', ownerApproved: false, artApproved: false,
      sourcePath, sourceSha256: sourceHash, sourceImageIndex: index, path: outputPath, reportPath,
      sha256: createHash('sha256').update(imageBytes).digest('hex'), mimeType: 'image/png',
      dimensions: { width: stats.width, height: stats.height }, alpha: stats,
      preparation: { method: 'imagegen-chroma-helper', keyColor: '#ff00ff', softMatte: true, spillCleanup: true, canvasPreserved: true, resized: false, cropped: false, helperSha256: createHash('sha256').update(await fs.readFile(helper)).digest('hex') },
      preparedAt: new Date(now()).toISOString(), warnings,
      review: { alphaEdges: 'pending', measuredPivot: null, nativeExport: 'pending', runtimeIntegration: 'pending', ownerArtApproval: 'pending' },
    };
    await fs.writeFile(reportPath, `${JSON.stringify(prepared, null, 2)}\n`, { flag: 'wx' });
    manifest.preparedFiles = [...(Array.isArray(manifest.preparedFiles) ? manifest.preparedFiles : []), prepared];
    if (await fs.readFile(manifestPath, 'utf8') !== rawManifest) throw new Error('Asset manifest changed during local processing. Result discarded to preserve its current metadata.');
    const manifestTemporary = `${manifestPath}.${randomBytes(4).toString('hex')}.tmp`;
    try { await fs.writeFile(manifestTemporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' }); await fs.rename(manifestTemporary, manifestPath); }
    finally { await fs.rm(manifestTemporary, { force: true }); }
    complete = true;
    return { manifestPath, ...prepared };
  } finally {
    if (!complete) { if (outputPath) await fs.rm(outputPath, { force: true }); if (reportPath) await fs.rm(reportPath, { force: true }); }
    await lock.close();
    await fs.rm(lockPath, { force: true });
  }
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.length === 0 || argv.includes('--help')) {
    process.stdout.write('Usage: node scripts/game-asset-prepare.mjs --manifest PATH [--image-index 1]\nLocal chroma-key alpha extraction; keeps canvas, source, pivot review and approval status.\n');
    return 0;
  }
  const input = {};
  const seen = new Set();
  for (let i = 0; i < argv.length; i += 2) {
    if (seen.has(argv[i])) throw new Error('An option was supplied more than once.');
    seen.add(argv[i]);
    if (argv[i] === '--manifest' && argv[i + 1]) input.manifestPath = argv[i + 1];
    else if (argv[i] === '--image-index' && argv[i + 1]) input.imageIndex = Number(argv[i + 1]);
    else throw new Error('Use --manifest PATH and optional --image-index NUMBER.');
  }
  const result = await prepareGameAsset(input);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  main().then((code) => { process.exitCode = code; }).catch((error) => { process.stderr.write(`game-asset-prepare: ${error.message}\n`); process.exitCode = 1; });
}
