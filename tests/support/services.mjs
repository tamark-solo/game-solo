import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
export async function waitFor(predicate, description, timeout = 12000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try { if (await predicate()) return; } catch { /* Wait for the process/socket to become ready. */ }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Timeout: ${description}`);
}
export async function startService(args, url, env = {}) {
  // Plain logs keep readiness markers matchable; Windows tools colorize piped output by default.
  const child = spawn(process.execPath, args, { cwd: root, env: { ...process.env, NO_COLOR: '1', ...env }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', data => { output += data.toString(); });
  child.stderr.on('data', data => { output += data.toString(); });
  child.on('error', error => { output += error.message; });
  try {
    await waitFor(async () => {
      if (child.exitCode !== null) throw new Error(output);
      const readyMarker = args.some(arg => arg.includes('/vite/')) ? 'Local:' : 'Backend preview:';
      if (!output.includes(readyMarker)) return false;
      return (await fetch(url)).ok;
    }, url);
  } catch (error) { child.kill(); throw new Error(`${String(error)}\n${output}`); }
  return { child, stop: () => child.kill(), output: () => output };
}
