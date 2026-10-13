#!/usr/bin/env node
/** A deliberately separate image-generation client; it never imports game runtime code. */
import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_BASE_URL = 'https://img.aishenji.top/v1';
export const DEFAULT_MODEL = 'gpt-image-2';
export const MAX_JSON_BYTES = 96 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 32 * 1024 * 1024;
export const MAX_INPUT_IMAGE_BYTES = 32 * 1024 * 1024;
export const MAX_INPUT_TOTAL_BYTES = 64 * 1024 * 1024;
export const MAX_INPUT_IMAGES = 16;
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const DEFAULT_TIMEOUT_MS = 300_000;

export const HELP = `Image generation through an OpenAI-compatible router (Node.js 22+).

Usage:\n  node scripts/imagegen-router.mjs check
  node scripts/imagegen-router.mjs generate --prompt "..." [options]
  node scripts/imagegen-router.mjs generate --prompt-file prompt.txt [options]
  node scripts/imagegen-router.mjs edit --prompt-file prompt.txt --image crop.png [--image style.png] [options]
  node scripts/imagegen-router.mjs edit-responses --response-model gpt-6-astra --prompt-file prompt.txt --image crop.png [--image style.png] [options]
  node scripts/imagegen-router.mjs configure --api-key-stdin [--base-url URL]

Generate/edit options:\n  --prompt TEXT       Exact prompt text; choose this OR --prompt-file.
  --prompt-file PATH  UTF-8 prompt file; text is sent without trimming.
  --image PATH       Edit only. Repeat for up to 16 distinct PNG/JPEG/WebP inputs.
                     First input is the edit target; label other input roles in the prompt.
                     Local limits: 32 MiB per input, 64 MiB combined.
  --response-model MODEL  Required for edit-responses: explicit text/orchestration model.
                          Image tool model remains the configured gpt-image-2.
  --responses-tool-mode MODE  edit-responses only: full (default) or minimal.
                             minimal sends only image tool type/model; it omits size,
                             quality, output_format and action from the tool request.
  --out PATH         Output file or extensionless stem. For n > 1, append -01, -02...
                     Default: a unique name under output/imagegen/.
                     The file extension follows the returned image signature.
  --size SIZE        Default 1024x1024; dimensions such as 1536x1024, or auto.
  --quality QUALITY  low (default), medium, high, or auto.
  --background MODE  Optional: transparent, opaque, or auto. Omitted by default.
                     Not supported in edit-responses minimal mode.
  --n COUNT          Number of images, 1 (default) through 10.
  --timeout SECONDS  Whole request/download deadline; default 300.
  --force            Permit replacement of existing output/metadata files.
  --dry-run          Print the request and destinations; no key, network, or files.
  --help             Show this help.

Configuration:\n  IMAGEGEN_ROUTER_CONFIG overrides the config file location; otherwise use
  %LOCALAPPDATA%/game-solo/imagegen-router.json.
  IMAGEGEN_ROUTER_BASE_URL overrides the stored base URL.
  IMAGEGEN_ROUTER_API_KEY overrides the Windows DPAPI-encrypted stored key.
  configure reads the key from stdin, never from a command-line flag.

check only verifies model-list access. It does not prove image generation works.
generate/edit/edit-responses send exactly one POST and never retry or
change model/endpoint automatically. gpt-image-2 input fidelity is always high;
input_fidelity is not sent. Outputs are previews awaiting owner review, and edits
do not prove geometric registration or preservation of the input layout.
edit uses generic multipart /images/edits; support depends on the configured router.
edit-responses uses JSON /responses with input_image data URLs and image_generation.
Responses edits request exactly one image; --n must be 1. No transport fallback.
In minimal mode image output options are intent only; the router chooses actual output.
`;

export function parseArgs(argv = []) {
  const args = { command: 'help' };
  const tokens = [...argv];
  if (tokens[0] && !tokens[0].startsWith('-')) args.command = tokens.shift();
  else if (tokens.length && !tokens.includes('--help') && !tokens.includes('-h')) args.command = 'generate';
  if (!['help', 'check', 'generate', 'edit', 'edit-responses', 'configure'].includes(args.command)) throw new Error('Unknown command. Use --help.');
  const values = new Map([['--prompt', 'prompt'], ['--prompt-file', 'promptFile'], ['--out', 'out'], ['--size', 'size'], ['--quality', 'quality'], ['--background', 'background'], ['--n', 'n'], ['--timeout', 'timeout'], ['--base-url', 'baseUrl'], ['--response-model', 'responseModel'], ['--responses-tool-mode', 'responsesToolMode']]);
  const flags = new Map([['--dry-run', 'dryRun'], ['--force', 'force'], ['--api-key-stdin', 'apiKeyStdin'], ['--help', 'help'], ['-h', 'help']]);
  const seen = new Set();
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    const split = token.indexOf('=');
    const option = split > 0 ? token.slice(0, split) : token;
    if (seen.has(option) && option !== '--image') throw new Error('An option was supplied more than once.');
    seen.add(option);
    if (option === '--image') {
      const value = split > 0 ? token.slice(split + 1) : tokens[++index];
      if (!value || (split < 0 && value.startsWith('--'))) throw new Error('Missing value for --image.');
      (args.images ??= []).push(value);
    } else if (flags.has(option)) {
      if (split > 0) throw new Error('Boolean flags do not accept values.');
      args[flags.get(option)] = true;
    } else if (values.has(option)) {
      const value = split > 0 ? token.slice(split + 1) : tokens[++index];
      if (value === undefined || (split < 0 && value.startsWith('--'))) throw new Error(`Missing value for ${option}.`);
      args[values.get(option)] = value;
    } else throw new Error('Unknown option or positional argument. Use --help.');
  }
  if (args.help || args.command === 'help') return { command: 'help' };
  const allowed = {
    check: new Set(['command', 'timeout']),
    generate: new Set(['command', 'prompt', 'promptFile', 'out', 'size', 'quality', 'background', 'n', 'timeout', 'dryRun', 'force']),
    edit: new Set(['command', 'prompt', 'promptFile', 'images', 'out', 'size', 'quality', 'background', 'n', 'timeout', 'dryRun', 'force']),
    'edit-responses': new Set(['command', 'prompt', 'promptFile', 'images', 'responseModel', 'responsesToolMode', 'out', 'size', 'quality', 'background', 'n', 'timeout', 'dryRun', 'force']),
    configure: new Set(['command', 'baseUrl', 'apiKeyStdin']),
  }[args.command];
  if (Object.keys(args).some((key) => !allowed.has(key))) throw new Error('An option is not supported by this command. Use --help.');
  if (['generate', 'edit', 'edit-responses'].includes(args.command) && (args.prompt === undefined) === (args.promptFile === undefined)) throw new Error('Supply exactly one of --prompt or --prompt-file.');
  if (['edit', 'edit-responses'].includes(args.command) && (!args.images?.length || args.images.length > MAX_INPUT_IMAGES)) throw new Error(`edit requires 1 through ${MAX_INPUT_IMAGES} --image inputs.`);
  if (args.command === 'edit-responses') args.responseModel = validateResponseModel(args.responseModel);
  if (args.responsesToolMode !== undefined) args.responsesToolMode = validateResponsesToolMode(args.responsesToolMode);
  if (args.background !== undefined) args.background = validateBackground(args.background);
  if (args.responsesToolMode === 'minimal' && args.background !== undefined) throw new Error('--background is not supported in edit-responses minimal mode.');
  if (args.timeout !== undefined) {
    const seconds = Number(args.timeout);
    if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 86_400) throw new Error('--timeout must be a positive number of seconds, at most 86400.');
    args.timeoutMs = Math.ceil(seconds * 1000);
    delete args.timeout;
  }
  if (args.n !== undefined) args.n = validateCount(args.n);
  if (args.command === 'edit-responses' && args.n !== undefined && args.n !== 1) throw new Error('edit-responses supports exactly one requested image; --n must be 1.');
  return args;
}

export function validateBaseUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('The router base URL must be a valid absolute URL.'); }
  const local = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) throw new Error('The router requires HTTPS; HTTP is allowed only for localhost tests.');
  if (url.username || url.password || url.search || url.hash) throw new Error('The router base URL cannot contain credentials, a query, or a fragment.');
  return url.href.replace(/\/+$/, '');
}

export function sanitizeError(value, secrets = []) {
  let text = String(value instanceof Error ? value.message : value ?? 'Unknown error');
  for (const secret of secrets.filter((entry) => typeof entry === 'string' && entry.length)) {
    const variants = new Set([secret, encodeURIComponent(secret), JSON.stringify(secret).slice(1, -1), Buffer.from(secret).toString('base64')]);
    for (const variant of variants) text = text.split(variant).join('[REDACTED]');
  }
  text = text.replace(/\bBearer\s+[^\s"'<>]+/gi, 'Bearer [REDACTED]')
    .replace(/data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+/gi, '[REDACTED IMAGE DATA]')
    .replace(/\bsk-[A-Za-z0-9_-]+/g, '[REDACTED]')
    .replace(/((?:api[_ -]?key|authorization|access[_ -]?token)\s*[=:]\s*["']?)[^\s"',;}]+/gi, '$1[REDACTED]')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  return text.slice(0, 1000);
}

function defaultConfigPath(env) {
  if (env.IMAGEGEN_ROUTER_CONFIG) return path.resolve(env.IMAGEGEN_ROUTER_CONFIG);
  if (!env.LOCALAPPDATA) throw new Error('Set IMAGEGEN_ROUTER_CONFIG or LOCALAPPDATA to locate router configuration.');
  return path.join(env.LOCALAPPDATA, 'game-solo', 'imagegen-router.json');
}

async function readConfig(configPath, readFile = fs.readFile) {
  try {
    const raw = await readFile(configPath, 'utf8');
    if (Buffer.byteLength(raw, 'utf8') > 128 * 1024) throw new Error('Router configuration is too large.');
    const config = JSON.parse(raw);
    if (!config || typeof config !== 'object' || Array.isArray(config) || config.version !== 1) throw new Error('Router configuration must be a version 1 JSON object.');
    return config;
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    if (error instanceof SyntaxError) throw new Error('Router configuration contains invalid JSON.');
    if (error?.code) throw new Error('Could not read router configuration.');
    throw error;
  }
}

function validateApiKey(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('No API key configured. Set IMAGEGEN_ROUTER_API_KEY or use configure --api-key-stdin.');
  const key = value.trim();
  if (/[\r\n\u0000]/.test(key)) throw new Error('The API key contains invalid characters.');
  return key;
}

function powershellSecretTransform(input, encrypt) {
  if (process.platform !== 'win32') throw new Error('Stored DPAPI keys require Windows. Use IMAGEGEN_ROUTER_API_KEY on this platform.');
  const prelude = "$ErrorActionPreference = 'Stop'; $env:PSModulePath = [System.IO.Path]::Combine($PSHOME, 'Modules'); Import-Module Microsoft.PowerShell.Security -ErrorAction Stop; ";
  const script = prelude + (encrypt
    ? "$plain = [Console]::In.ReadToEnd(); $secure = ConvertTo-SecureString -String $plain -AsPlainText -Force; [Console]::Out.Write((ConvertFrom-SecureString -SecureString $secure))"
    : "$cipher = [Console]::In.ReadToEnd(); $secure = ConvertTo-SecureString -String $cipher; [Console]::Out.Write(([System.Net.NetworkCredential]::new('', $secure)).Password)");
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    const chunks = [];
    let length = 0;
    let settled = false;
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error); else resolve(result);
    };
    const timer = setTimeout(() => { child.kill(); finish(new Error('Windows key encryption/decryption timed out.')); }, 15_000);
    child.stdout.on('data', (chunk) => {
      length += chunk.length;
      if (length > 32 * 1024) { child.kill(); finish(new Error('Windows key encryption/decryption returned too much data.')); }
      else chunks.push(chunk);
    });
    // Never surface PowerShell output: it can contain the plaintext input.
    child.stderr.resume();
    child.on('error', () => finish(new Error('Could not start Windows key encryption/decryption.')));
    child.on('close', (code) => {
      if (code !== 0) finish(new Error('Could not decrypt/encrypt the key for this Windows user. Configure the key again.'));
      else finish(null, Buffer.concat(chunks).toString('utf8').replace(/^\uFEFF/, ''));
    });
    child.stdin.on('error', () => finish(new Error('Could not send the key to Windows encryption/decryption.')));
    child.stdin.end(input, 'utf8');
  });
}

export const decryptWindowsDpapi = (cipher) => powershellSecretTransform(cipher, false);
export const encryptWindowsDpapi = (key) => powershellSecretTransform(key, true);

export async function resolveConfig({ env = process.env, configPath, readFile = fs.readFile, decryptKey = decryptWindowsDpapi, requireKey = true } = {}) {
  const resolvedPath = configPath ? path.resolve(configPath) : defaultConfigPath(env);
  const stored = await readConfig(resolvedPath, readFile);
  const baseUrl = validateBaseUrl(env.IMAGEGEN_ROUTER_BASE_URL || stored.baseUrl || DEFAULT_BASE_URL);
  const model = stored.model || DEFAULT_MODEL;
  if (typeof model !== 'string' || !model.trim() || /[\r\n\u0000]/.test(model)) throw new Error('Router configuration has an invalid model.');
  let apiKey;
  if (requireKey) {
    if (env.IMAGEGEN_ROUTER_API_KEY) apiKey = validateApiKey(env.IMAGEGEN_ROUTER_API_KEY);
    else if (typeof stored.apiKeyDpapi === 'string' && stored.apiKeyDpapi) apiKey = validateApiKey(await decryptKey(stored.apiKeyDpapi));
    else apiKey = validateApiKey(undefined);
  }
  return { baseUrl, model, ...(apiKey ? { apiKey } : {}), configPath: resolvedPath };
}

function validateCount(value) {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1 || count > 10) throw new Error('n must be an integer from 1 through 10.');
  return count;
}

function validateResponseModel(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/.test(value) || value.startsWith('gpt-image-')) throw new Error('edit-responses requires an explicit text model via --response-model, separate from the image model.');
  return value;
}

function validateResponsesToolMode(value) {
  if (!['full', 'minimal'].includes(value)) throw new Error('--responses-tool-mode must be full or minimal.');
  return value;
}

function validateBackground(value) {
  if (!['transparent', 'opaque', 'auto'].includes(value)) throw new Error('background must be transparent, opaque, or auto.');
  return value;
}

function validateParameters({ prompt, size, quality, n, timeoutMs }) {
  if (typeof prompt !== 'string' || !prompt.trim()) throw new Error('The prompt must contain text.');
  if (Buffer.byteLength(prompt, 'utf8') > 1024 * 1024) throw new Error('The prompt exceeds the 1 MiB local safety limit.');
  if (typeof size !== 'string' || !(size === 'auto' || /^[1-9]\d{0,4}x[1-9]\d{0,4}$/.test(size))) throw new Error('size must be auto or positive WIDTHxHEIGHT dimensions.');
  if (!['low', 'medium', 'high', 'auto'].includes(quality)) throw new Error('quality must be low, medium, high, or auto.');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 86_400_000) throw new Error('timeoutMs must be positive and at most one day.');
  return validateCount(n);
}

export function detectImageType(buffer) {
  if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer);
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { extension: '.png', mimeType: 'image/png' };
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { extension: '.jpg', mimeType: 'image/jpeg' };
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return { extension: '.webp', mimeType: 'image/webp' };
  throw new Error('The router returned data without a supported PNG, JPEG, or WebP signature.');
}

export function detectImageDimensions(buffer) {
  if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer);
  const type = detectImageType(buffer);
  if (type.mimeType === 'image/png' && buffer.length >= 24 && buffer.toString('ascii', 12, 16) === 'IHDR') {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (width > 0 && height > 0) return { width, height };
  }
  if (type.mimeType === 'image/jpeg') {
    let offset = 2;
    const frameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    while (offset < buffer.length) {
      if (buffer[offset++] !== 0xff) return null;
      while (offset < buffer.length && buffer[offset] === 0xff) offset++;
      if (offset >= buffer.length) return null;
      const marker = buffer[offset++];
      if (marker === 0xda || marker === 0xd9) return null;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > buffer.length) return null;
      const length = buffer.readUInt16BE(offset);
      if (length < 2 || offset + length > buffer.length) return null;
      if (frameMarkers.has(marker) && length >= 8) {
        const height = buffer.readUInt16BE(offset + 3);
        const width = buffer.readUInt16BE(offset + 5);
        return width > 0 && height > 0 ? { width, height } : null;
      }
      offset += length;
    }
  }
  if (type.mimeType === 'image/webp') {
    const end = Math.min(buffer.length, buffer.readUInt32LE(4) + 8);
    let offset = 12;
    while (offset + 8 <= end) {
      const chunk = buffer.toString('ascii', offset, offset + 4);
      const length = buffer.readUInt32LE(offset + 4);
      const data = offset + 8;
      if (data + length > end) return null;
      if (chunk === 'VP8X' && length >= 10) return { width: buffer.readUIntLE(data + 4, 3) + 1, height: buffer.readUIntLE(data + 7, 3) + 1 };
      if (chunk === 'VP8L' && length >= 5 && buffer[data] === 0x2f) {
        const bits = buffer.readUInt32LE(data + 1);
        return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
      }
      if (chunk === 'VP8 ' && length >= 10 && buffer.subarray(data + 3, data + 6).equals(Buffer.from([0x9d, 0x01, 0x2a]))) {
        const width = buffer.readUInt16LE(data + 6) & 0x3fff;
        const height = buffer.readUInt16LE(data + 8) & 0x3fff;
        return width > 0 && height > 0 ? { width, height } : null;
      }
      offset = data + length + (length & 1);
    }
  }
  return null;
}

async function readEditInputs(images) {
  if (!Array.isArray(images) || images.length < 1 || images.length > MAX_INPUT_IMAGES) throw new Error(`edit requires 1 through ${MAX_INPUT_IMAGES} image paths.`);
  const inputs = [];
  const paths = new Set();
  const hashes = new Set();
  let totalBytes = 0;
  for (let index = 0; index < images.length; index++) {
    const input = images[index];
    if (typeof input !== 'string' || !input.trim() || /[\u0000]/.test(input)) throw new Error(`Image input ${index + 1} must be a local file path.`);
    const filename = path.resolve(input);
    let canonicalPath;
    let handle;
    let bytes;
    try {
      canonicalPath = await fs.realpath(filename);
      const pathKey = process.platform === 'win32' ? canonicalPath.toLowerCase() : canonicalPath;
      if (paths.has(pathKey)) throw new Error('Edit inputs must be distinct; a file path was supplied more than once.');
      paths.add(pathKey);
      handle = await fs.open(canonicalPath, 'r');
      const stat = await handle.stat();
      if (!stat.isFile()) throw new Error(`Image input ${index + 1} must be a regular file.`);
      if (stat.size === 0 || stat.size > MAX_INPUT_IMAGE_BYTES) throw new Error(`Image input ${index + 1} must contain 1 through 32 MiB of image data.`);
      if (totalBytes + stat.size > MAX_INPUT_TOTAL_BYTES) throw new Error('Combined edit inputs exceed the local 64 MiB limit.');
      const chunks = [];
      let length = 0;
      for await (const chunk of handle.createReadStream({ autoClose: false })) {
        length += chunk.length;
        if (length > MAX_INPUT_IMAGE_BYTES || totalBytes + length > MAX_INPUT_TOTAL_BYTES) throw new Error('Edit input data exceeds the local per-image or combined limit.');
        chunks.push(chunk);
      }
      bytes = Buffer.concat(chunks, length);
    } catch (error) {
      if (error?.code) throw new Error(`Could not read image input ${index + 1} as a local regular file.`);
      throw error;
    } finally { await handle?.close(); }
    const type = detectImageType(bytes);
    const dimensions = detectImageDimensions(bytes);
    if (!dimensions) throw new Error(`Image input ${index + 1} has no readable PNG, JPEG, or WebP dimensions.`);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    if (hashes.has(sha256)) throw new Error('Edit inputs must be distinct; duplicate image contents were supplied.');
    hashes.add(sha256);
    totalBytes += bytes.length;
    inputs.push({ bytes, canonicalPath, metadata: { index: index + 1, role: index === 0 ? 'edit-target' : 'supporting-input', path: filename, filename: path.basename(filename), mimeType: type.mimeType, bytes: bytes.length, sha256, dimensions } });
  }
  return inputs;
}

async function assertInputDestinations(inputs, plan) {
  const inputPaths = new Set(inputs.map((input) => process.platform === 'win32' ? input.canonicalPath.toLowerCase() : input.canonicalPath));
  for (const filename of [plan.lockPath, ...plan.candidates]) {
    let canonicalPath;
    try { canonicalPath = await fs.realpath(filename); }
    catch (error) { if (error?.code === 'ENOENT') continue; throw error; }
    if (inputPaths.has(process.platform === 'win32' ? canonicalPath.toLowerCase() : canonicalPath)) throw new Error('An edit output destination overlaps an input image. Choose a separate --out path even with --force.');
  }
}

async function boundedBody(response, maxBytes, label) {
  const declared = response.headers?.get?.('content-length');
  if (declared && Number(declared) > maxBytes) {
    await response.body?.cancel?.().catch(() => {});
    throw new Error(`${label} exceeds the local ${Math.round(maxBytes / 1024 / 1024)} MiB limit.`);
  }
  const chunks = [];
  let length = 0;
  if (!response.body) return Buffer.alloc(0);
  for await (const chunk of response.body) {
    length += chunk.length;
    if (length > maxBytes) throw new Error(`${label} exceeds the local ${Math.round(maxBytes / 1024 / 1024)} MiB limit.`);
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks, length);
}

function requestId(response, body, secrets) {
  const id = response.headers?.get?.('x-request-id') || body?.request_id || body?.error?.request_id;
  return id === undefined ? undefined : sanitizeError(id, secrets).slice(0, 256);
}

async function jsonResponse(response, secrets) {
  const bytes = await boundedBody(response, MAX_JSON_BYTES, 'Router JSON response');
  let body;
  try { body = JSON.parse(bytes.toString('utf8')); } catch {
    if (response.status === 429) throw new Error('Router rate limited the request (HTTP 429), with a non-JSON response. No automatic retry was performed.');
    throw new Error(`Router returned invalid JSON (HTTP ${response.status}).`);
  }
  const id = requestId(response, body, secrets);
  if (!response.ok || body?.error) {
    const suffix = body?.error?.message ?? (typeof body?.error === 'string' ? body.error : undefined);
    const kind = response.status === 429 ? 'Router rate limited the request' : 'Router request failed';
    const safeMessage = suffix ? `: ${sanitizeError(suffix, secrets)}` : '';
    throw new Error(`${kind} (HTTP ${response.status})${id ? ` [request ${id}]` : ''}${safeMessage}. No automatic retry was performed.`);
  }
  return { body, requestId: id };
}

async function withDeadline(timeoutMs, secrets, operation) {
  const controller = new AbortController();
  let expired = false;
  const timer = setTimeout(() => { expired = true; controller.abort(); }, timeoutMs);
  try { return await operation(controller.signal); }
  catch (error) {
    if (expired) throw new Error(`Router request timed out after ${timeoutMs / 1000} seconds. No automatic retry was performed; a submitted generation may still be billed.`);
    throw new Error(sanitizeError(error, secrets));
  } finally { clearTimeout(timer); }
}

export async function runCheck({ config, fetchImpl = globalThis.fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (!config) throw new Error('Router configuration is required.');
  const baseUrl = validateBaseUrl(config.baseUrl);
  const apiKey = validateApiKey(config.apiKey);
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('timeoutMs must be positive.');
  return withDeadline(timeoutMs, [apiKey], async (signal) => {
    const response = await fetchImpl(`${baseUrl}/models`, { method: 'GET', headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' }, redirect: 'error', signal });
    const parsed = await jsonResponse(response, [apiKey]);
    if (!Array.isArray(parsed.body?.data)) throw new Error('Router model-list response has no data array.');
    const model = config.model || DEFAULT_MODEL;
    const models = parsed.body.data.filter((item) => item?.id === model).map(() => ({ id: model }));
    return { endpoint: `${baseUrl}/models`, model, models, modelAvailable: models.length > 0, verification: 'model-list-only', generationVerified: false, ...(parsed.requestId ? { requestId: parsed.requestId } : {}) };
  });
}

function outputPlan(out, count, now) {
  const timestamp = new Date(now()).toISOString().replace(/[:.]/g, '-');
  const absolute = path.resolve(out || path.join('output', 'imagegen', `image-${timestamp}-${randomBytes(4).toString('hex')}.png`));
  const extension = path.extname(absolute).toLowerCase();
  if (extension && !IMAGE_EXTENSIONS.includes(extension)) throw new Error('--out must be an image filename (.png/.jpg/.jpeg/.webp) or an extensionless stem.');
  const stem = extension ? absolute.slice(0, -extension.length) : absolute;
  const stems = Array.from({ length: count }, (_, index) => count > 1 ? `${stem}-${String(index + 1).padStart(2, '0')}` : stem);
  return { stem, stems, directory: path.dirname(stem), lockPath: `${stem}.imagegen.lock`, candidates: stems.flatMap((item) => [...IMAGE_EXTENSIONS.map((ext) => `${item}${ext}`), `${item}.json`]) };
}

async function assertDestinations(plan, force, { skipLock = false } = {}) {
  for (const filename of [...(skipLock ? [] : [plan.lockPath]), ...plan.candidates]) {
    try {
      const stat = await fs.lstat(filename);
      if (filename === plan.lockPath) throw new Error('This output is reserved by another generation. Choose a different --out path.');
      if (stat.isDirectory()) throw new Error('An output destination is a directory. Choose another --out path.');
      if (!force) throw new Error('An output image or metadata file already exists. Choose another --out path or explicitly use --force.');
    } catch (error) { if (error?.code !== 'ENOENT') throw error; }
  }
}

function decodeBase64(value) {
  if (typeof value !== 'string' || !value.length) throw new Error('The router returned empty base64 image data.');
  if (value.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 1024) throw new Error('Base64 image data exceeds the local 32 MiB limit.');
  const compact = value.replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(compact) || compact.length % 4 === 1 || /=/.test(compact.slice(0, -2))) throw new Error('The router returned invalid base64 image data.');
  const bytes = Buffer.from(compact, 'base64');
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error('The returned image is empty or exceeds the local 32 MiB limit.');
  return bytes;
}

function validateDownloadUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('The router returned an invalid image download URL.'); }
  const local = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) throw new Error('Image downloads require HTTPS (or localhost HTTP for tests).');
  if (url.username || url.password) throw new Error('Image download URLs cannot contain embedded credentials.');
  return url.href;
}

async function downloadImage(value, fetchImpl, signal) {
  let url = validateDownloadUrl(value);
  for (let redirects = 0; redirects <= 3; redirects++) {
    // Deliberately omit Authorization, including when downloading from the router itself.
    const response = await fetchImpl(url, { method: 'GET', headers: { Accept: 'image/png,image/jpeg,image/webp' }, redirect: 'manual', signal });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers?.get?.('location');
      await response.body?.cancel?.().catch(() => {});
      if (!location || redirects === 3) throw new Error('Image download returned too many redirects or no redirect location.');
      url = validateDownloadUrl(new URL(location, url).href);
      continue;
    }
    if (!response.ok) { await response.body?.cancel?.().catch(() => {}); throw new Error(`Image download failed (HTTP ${response.status}).`); }
    const bytes = await boundedBody(response, MAX_IMAGE_BYTES, 'Downloaded image');
    if (!bytes.length) throw new Error('The image download was empty.');
    return bytes;
  }
  throw new Error('Image download did not complete.');
}

async function writeOutput(filename, bytes, force) {
  if (!force) { await fs.writeFile(filename, bytes, { flag: 'wx', mode: 0o600 }); return; }
  const temporary = `${filename}.${randomBytes(6).toString('hex')}.tmp`;
  try { await fs.writeFile(temporary, bytes, { flag: 'wx', mode: 0o600 }); await fs.rename(temporary, filename); }
  finally { await fs.rm(temporary, { force: true }); }
}

export async function runGenerate(options = {}) {
  return runImageRequest({ ...options, operation: 'generate' });
}

export async function runEdit({ images, ...options } = {}) {
  const inputs = await readEditInputs(images);
  return runImageRequest({ ...options, inputs, operation: 'edit' });
}

export async function runEditResponses({ images, responseModel, responsesToolMode = 'full', ...options } = {}) {
  responseModel = validateResponseModel(responseModel);
  responsesToolMode = validateResponsesToolMode(responsesToolMode);
  const inputs = await readEditInputs(images);
  return runImageRequest({ ...options, responseModel, responsesToolMode, inputs, operation: 'edit-responses' });
}

function responseImageItems(body, secrets) {
  if (body?.status !== 'completed') throw new Error('Responses request did not complete; no images were saved and no automatic retry was performed.');
  if (!Array.isArray(body.output)) throw new Error('Responses request has no output array.');
  const imageCalls = body.output.filter((item) => item?.type === 'image_generation_call');
  if (!imageCalls.length) throw new Error('Responses returned no image_generation_call; no automatic retry was performed.');
  for (const item of imageCalls) {
    if ((item.status !== undefined && item.status !== 'completed') || typeof item.result !== 'string' || !item.result) throw new Error('Responses image_generation_call did not contain a completed base64 image result.');
  }
  return imageCalls.map((item) => ({ b64_json: item.result, source: 'image_generation_call.result', callCompletion: { responseStatus: 'completed', imageCallStatus: item.status ?? null, verifiedBy: item.status === 'completed' ? 'response-and-image-call' : 'completed-response-and-valid-result' }, callId: typeof item.id === 'string' ? sanitizeError(item.id, secrets).slice(0, 256) : undefined }));
}

async function runImageRequest({ config, prompt, out, size = '1024x1024', quality = 'low', background, n = 1, timeoutMs = DEFAULT_TIMEOUT_MS, force = false, dryRun = false, fetchImpl = globalThis.fetch, now = Date.now, operation, inputs = [], responseModel, responsesToolMode } = {}) {
  n = validateParameters({ prompt, size, quality, n, timeoutMs });
  if (background !== undefined) background = validateBackground(background);
  if (!config) throw new Error('Router configuration is required.');
  const baseUrl = validateBaseUrl(config.baseUrl);
  const model = config.model || DEFAULT_MODEL;
  if (typeof model !== 'string' || !model.trim()) throw new Error('The configured model is invalid.');
  const responses = operation === 'edit-responses';
  const minimalResponses = responses && responsesToolMode === 'minimal';
  if (minimalResponses && background !== undefined) throw new Error('--background is not supported in edit-responses minimal mode.');
  const backgroundOption = background === undefined ? {} : { background };
  const isEdit = operation === 'edit' || responses;
  if (responses && model !== DEFAULT_MODEL) throw new Error('edit-responses requires the configured image model to remain gpt-image-2; no model change was performed.');
  if (responses && n !== 1) throw new Error('edit-responses supports exactly one requested image; n must be 1.');
  const endpoint = responses ? `${baseUrl}/responses` : `${baseUrl}/images/${operation === 'edit' ? 'edits' : 'generations'}`;
  const request = responses ? {
    model: responseModel,
    input: [{ role: 'user', content: [
      { type: 'input_text', text: prompt },
      ...inputs.map((input) => ({ type: 'input_image', image_url: `data:${input.metadata.mimeType};base64,[IMAGE DATA OMITTED]` })),
    ] }],
    tools: [{ type: 'image_generation', model, ...(minimalResponses ? {} : { action: 'edit', size, quality, output_format: 'png', ...backgroundOption }) }],
    tool_choice: { type: 'image_generation' },
    stream: false,
  } : { model, prompt, n, size, quality, output_format: 'png', ...backgroundOption };
  const editDescription = isEdit ? { operation, encoding: responses ? 'application/json' : 'multipart/form-data', ...(responses ? { responseModel, imageModel: model, responsesToolMode, imageOptions: { intended: { size, quality, output_format: 'png', action: 'edit', ...backgroundOption }, transmitted: minimalResponses ? {} : { size, quality, output_format: 'png', action: 'edit', ...backgroundOption }, omitted: minimalResponses ? ['size', 'quality', 'output_format', 'action'] : [] }, inputDataOmitted: true } : { imageField: 'image[]' }), inputImages: inputs.map((input) => input.metadata), registrationVerified: false } : {};
  const plan = outputPlan(out, n, now);
  if (isEdit) await assertInputDestinations(inputs, plan);
  await assertDestinations(plan, force);
  if (dryRun) return { dryRun: true, endpoint, request, ...editDescription, plannedFiles: plan.stems.map((stem) => ({ path: `${stem}.png`, metadataPath: `${stem}.json` })), generationVerified: false, status: 'preview-only', ownerApproved: false };
  const apiKey = validateApiKey(config.apiKey);
  await fs.mkdir(plan.directory, { recursive: true });
  let lock;
  try { lock = await fs.open(plan.lockPath, 'wx', 0o600); }
  catch (error) { if (error?.code === 'EEXIST') throw new Error('Another generation reserved this output. Choose a different --out path.'); throw new Error('Could not reserve the output location before generation.'); }
  const written = [];
  try {
    // Check again while holding the lock, immediately before the paid operation.
    if (isEdit) await assertInputDestinations(inputs, plan);
    await assertDestinations(plan, force, { skipLock: true });
    return await withDeadline(timeoutMs, [apiKey], async (signal) => {
      const headers = { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' };
      let body;
      if (operation === 'edit') {
        body = new FormData();
        for (const [key, value] of Object.entries(request)) body.append(key, String(value));
        for (const input of inputs) body.append('image[]', new Blob([input.bytes], { type: input.metadata.mimeType }), input.metadata.filename);
        // fetch supplies the multipart boundary. gpt-image-2 does not accept input_fidelity.
      } else {
        headers['Content-Type'] = 'application/json';
        const actualRequest = responses ? { ...request, input: [{ role: 'user', content: [
          { type: 'input_text', text: prompt },
          ...inputs.map((input) => ({ type: 'input_image', image_url: `data:${input.metadata.mimeType};base64,${input.bytes.toString('base64')}` })),
        ] }] } : request;
        body = JSON.stringify(actualRequest);
      }
      const response = await fetchImpl(endpoint, { method: 'POST', headers, body, redirect: 'error', signal });
      const parsed = await jsonResponse(response, [apiKey]);
      const imageItems = responses ? responseImageItems(parsed.body, [apiKey]) : parsed.body?.data;
      if (!Array.isArray(imageItems) || imageItems.length === 0) throw new Error('The router returned no image data.');
      if (imageItems.length > n) throw new Error('The router returned more images than requested; no files were saved.');
      const prepared = [];
      for (const item of imageItems) {
        if (!item || typeof item !== 'object') throw new Error('The router returned an invalid image item.');
        let bytes;
        let source;
        if (item.b64_json !== undefined) { bytes = decodeBase64(item.b64_json); source = item.source || 'b64_json'; }
        else if (typeof item.url === 'string' && item.url) { bytes = await downloadImage(item.url, fetchImpl, signal); source = 'url'; }
        else throw new Error('An image item contains neither b64_json nor a download URL.');
        const type = detectImageType(bytes);
        prepared.push({ bytes, source, ...(item.callId ? { callId: item.callId } : {}), ...(item.callCompletion ? { callCompletion: item.callCompletion } : {}), ...type, dimensions: detectImageDimensions(bytes) });
      }
      const generatedAt = new Date(now()).toISOString();
      const files = [];
      const warnings = minimalResponses ? ['Responses minimal mode intentionally omitted size, quality, output_format and action from the image tool request; actual output is chosen by the router.'] : [];
      for (let index = 0; index < prepared.length; index++) {
        const image = prepared[index];
        const filename = `${plan.stems[index]}${image.extension}`;
        const metadataPath = `${plan.stems[index]}.json`;
        const sha256 = createHash('sha256').update(image.bytes).digest('hex');
        const actualSize = image.dimensions ? `${image.dimensions.width}x${image.dimensions.height}` : null;
        const sizeMatchesIntent = size === 'auto' || !actualSize ? null : actualSize === size;
        const sizeMatchesRequest = minimalResponses ? null : sizeMatchesIntent;
        if (sizeMatchesRequest === false) warnings.push(`Image ${index + 1}: router returned ${actualSize}, requested ${size}. Image saved unchanged; no additional generation was sent.`);
        const metadata = {
          version: 1, status: 'preview-only', ownerApproved: false, artApproved: false,
          prompt, model, endpoint, requestParameters: request, generatedAt,
          ...editDescription,
          ...(parsed.requestId ? { requestId: parsed.requestId } : {}),
          image: { filename: path.basename(filename), index: index + 1, requestedCount: n, returnedCount: prepared.length, source: image.source, ...(image.callId ? { callId: image.callId } : {}), ...(image.callCompletion ? { callCompletion: image.callCompletion } : {}), mimeType: image.mimeType, bytes: image.bytes.length, sha256, dimensions: image.dimensions },
          verification: { status: 'signature-verified', signatureVerified: true, mimeType: image.mimeType, visualReview: 'pending', generationVerified: true, sizeMatchesRequest, ...(minimalResponses ? { sizeMatchesIntent } : {}) },
        };
        await writeOutput(filename, image.bytes, force);
        written.push(filename);
        await writeOutput(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, force);
        written.push(metadataPath);
        files.push({ path: filename, metadataPath, sha256, mimeType: image.mimeType, dimensions: image.dimensions, sizeMatchesRequest, ...(minimalResponses ? { sizeMatchesIntent } : {}) });
      }
      return { dryRun: false, endpoint, model, ...editDescription, files, warnings, requestedCount: n, returnedCount: files.length, generationVerified: true, status: 'preview-only', ownerApproved: false, ...(parsed.requestId ? { requestId: parsed.requestId } : {}) };
    });
  } catch (error) {
    // Exclusive writes can be removed safely; force replacements cannot be rolled back.
    if (!force) await Promise.all(written.map((filename) => fs.rm(filename, { force: true }).catch(() => {})));
    throw new Error(sanitizeError(error, [apiKey]));
  } finally { await lock.close(); await fs.rm(plan.lockPath, { force: true }); }
}

async function readStdin(stream, limit = 16 * 1024) {
  const chunks = [];
  let length = 0;
  for await (const chunk of stream) {
    const bytes = Buffer.from(chunk);
    length += bytes.length;
    if (length > limit) throw new Error('API key input exceeds the local limit.');
    chunks.push(bytes);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export async function configure({ env = process.env, baseUrl, apiKeyStdin = false, stdin = process.stdin, encryptKey = encryptWindowsDpapi } = {}) {
  const configPath = defaultConfigPath(env);
  const stored = await readConfig(configPath);
  const config = { version: 1, baseUrl: validateBaseUrl(baseUrl || stored.baseUrl || DEFAULT_BASE_URL), model: stored.model || DEFAULT_MODEL };
  if (stored.apiKeyDpapi) config.apiKeyDpapi = stored.apiKeyDpapi;
  if (apiKeyStdin) config.apiKeyDpapi = await encryptKey(validateApiKey(await readStdin(stdin)));
  if (!apiKeyStdin && !baseUrl) throw new Error('configure requires --api-key-stdin or --base-url.');
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await writeOutput(configPath, `${JSON.stringify(config, null, 2)}\n`, true);
  return { configPath, baseUrl: config.baseUrl, model: config.model, keyStored: Boolean(config.apiKeyDpapi) };
}

export async function main(argv = process.argv.slice(2), { env = process.env, stdout = process.stdout, stderr = process.stderr, stdin = process.stdin, fetchImpl = globalThis.fetch } = {}) {
  try {
    const args = parseArgs(argv);
    if (args.command === 'help') { stdout.write(HELP); return 0; }
    let result;
    if (args.command === 'configure') result = await configure({ env, stdin, baseUrl: args.baseUrl, apiKeyStdin: args.apiKeyStdin });
    else {
      const config = await resolveConfig({ env, requireKey: !args.dryRun });
      if (args.command === 'check') result = await runCheck({ config, fetchImpl, timeoutMs: args.timeoutMs });
      else {
        let prompt = args.prompt;
        if (args.promptFile !== undefined) {
          try { prompt = await fs.readFile(path.resolve(args.promptFile), 'utf8'); }
          catch { throw new Error('Could not read the UTF-8 prompt file.'); }
        }
        const run = args.command === 'edit-responses' ? runEditResponses : args.command === 'edit' ? runEdit : runGenerate;
        result = await run({ ...args, prompt, config, fetchImpl });
      }
    }
    stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return 0;
  } catch (error) {
    stderr.write(`imagegen-router: ${sanitizeError(error, [env.IMAGEGEN_ROUTER_API_KEY])}\n`);
    return 1;
  }
}

const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
const modulePath = fileURLToPath(import.meta.url);
if (process.platform === 'win32' ? entryPath.toLowerCase() === modulePath.toLowerCase() : entryPath === modulePath) {
  main().then((code) => { process.exitCode = code; }).catch(() => { process.stderr.write('imagegen-router: Unexpected failure.\n'); process.exitCode = 1; });
}
