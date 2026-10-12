// Explicitly selected, already-planned region requests. One CLI POST per ID, no retries.
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = resolve(root, 'docs/design/world/hang-nhac-van-ngoc-detail-v2/regions');
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--ids') throw new Error('Specify the already-planned new region IDs with --ids D07,D08,...');
const ids = args[1].split(',');
const manifest = JSON.parse(await readFile(resolve(base, 'inputs.json'), 'utf8'));
if (!ids.length || new Set(ids).size !== ids.length || ids.some(id => !manifest.regions.some(r => r.id === id))) throw new Error('Unknown or repeated region ID');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
for (const id of ids) {
  const region = manifest.regions.find(r => r.id === id);
  for (const [field, hashName] of [['guide', 'guide'], ['style', 'style'], ['prompt', 'prompt']]) {
    if (sha(await readFile(resolve(base, region[field]))) !== region.inputHashes[hashName]) throw new Error(`${id}: prepared ${field} changed`);
  }
  for (const file of [region.generated, region.generationMetadata]) {
    try { await access(resolve(base, file)); throw new Error(`${id}: destination exists; choose a new revision instead of retrying`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}
let next = 0, failed = false;
async function worker() {
  while (!failed && next < ids.length) {
    const id = ids[next++], region = manifest.regions.find(r => r.id === id);
    console.log(`${id}: starting one gpt-image-2 edit request`);
    const result = await new Promise(resolveResult => {
      const child = spawn(process.execPath, [resolve(root, 'scripts/imagegen-router.mjs'), 'edit',
        '--prompt-file', resolve(base, region.prompt), '--image', resolve(base, region.guide),
        '--image', resolve(base, region.style), '--size', '1232x1232', '--quality', 'high',
        '--timeout', '600', '--out', resolve(base, region.generated)],
      { cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
      let stdout = '', stderr = '';
      child.stdout.on('data', data => { stdout += data.toString(); });
      child.stderr.on('data', data => { stderr += data.toString(); });
      child.on('error', error => resolveResult({ code: 1, stdout, stderr: error.message }));
      child.on('close', code => resolveResult({ code, stdout, stderr }));
    });
    if (result.code !== 0) {
      failed = true; process.exitCode = 1;
      console.error(`${id}: failed; queued requests stopped; no retry. ${result.stderr || result.stdout}`);
      return;
    }
    const metadata = JSON.parse(await readFile(resolve(base, region.generationMetadata), 'utf8'));
    console.log(`${id}: saved ${metadata.image.dimensions.width}x${metadata.image.dimensions.height}, ${metadata.image.bytes} bytes, preview only`);
  }
}
await Promise.all([worker(), worker()]);
