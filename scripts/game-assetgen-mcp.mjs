#!/usr/bin/env node
/** Local MCP stdio adapter. Stdout is reserved for newline-delimited JSON-RPC. */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listAssetProfiles, planGameAsset, generateGameAsset } from './game-assetgen.mjs';
import { prepareGameAsset } from './game-asset-prepare.mjs';
import { resolveConfig, runCheck, sanitizeError } from './imagegen-router.mjs';

export const SUPPORTED_PROTOCOL_VERSIONS = Object.freeze(['2025-11-25', '2025-06-18', '2024-11-05']);
export const MAX_LINE_BYTES = 1024 * 1024;
export const DEFAULT_WORKSPACE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_TYPES = ['icon', 'prop', 'environment-part', 'character-concept', 'vfx-concept', 'ui-art', 'map-concept'];
const QUALITIES = ['low', 'medium', 'high', 'auto'];
const ASSET_FIELDS = new Set(['assetType', 'name', 'prompt', 'size', 'quality', 'n']);
const ASSET_INPUT_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['assetType', 'name', 'prompt'],
  properties: {
    assetType: { type: 'string', enum: ASSET_TYPES },
    name: { type: 'string', minLength: 1, maxLength: 64, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', description: 'Lowercase ASCII slug; no path separators.' },
    prompt: { type: 'string', minLength: 1, maxLength: 32768, description: 'Asset brief, at most 32768 UTF-8 bytes.' },
    size: { type: 'string', pattern: '^(?:auto|[1-9][0-9]{0,3}x[1-9][0-9]{0,3})$', description: 'Optional dimensions or auto. Edges must be multiples of 16 up to 3840, aspect ratio at most 3:1, pixel count 655360 through 8294400. Profile defaults apply when omitted.' },
    quality: { type: 'string', enum: QUALITIES },
    n: { type: 'integer', minimum: 1, maximum: 4, description: 'Number of images in the single paid request; default 1.' },
  },
};
const EMPTY_INPUT_SCHEMA = { type: 'object', additionalProperties: false, properties: {} };
const PREPARE_INPUT_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['manifestPath'],
  properties: {
    manifestPath: { type: 'string', minLength: 1, description: 'Path to the saved game asset preview manifest inside this workspace.' },
    imageIndex: { type: 'integer', minimum: 1, maximum: 4, description: 'Saved image to prepare, counted from 1; default 1.' },
  },
};
const PREVIEW_NOTICE = 'New images are previews awaiting owner ART review; this tool never integrates assets into runtime or approves ART. gpt-image-2 chromakey/alpha output still requires inspection and processing.';
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const TOOLS = [
  {
    name: 'list_game_asset_profiles', title: 'List game asset profiles',
    description: `List the local production profiles for icons, props, environment parts, character concepts, VFX concepts, UI art and map concepts, including native scale and review rules. Reads no credentials, writes no files and makes no API request. ${PREVIEW_NOTICE}`,
    inputSchema: EMPTY_INPUT_SCHEMA, annotations: READ_ONLY,
  },
  {
    name: 'plan_game_asset', title: 'Plan game asset',
    description: `Compile an asset brief into the profile prompt, gpt-image-2 request parameters, output paths and review workflow under this project. Pure planning: reads no credentials, writes no files and makes no API request. ${PREVIEW_NOTICE}`,
    inputSchema: ASSET_INPUT_SCHEMA, annotations: READ_ONLY,
  },
  {
    name: 'generate_game_asset', title: 'Generate game asset preview',
    description: `Generate an explicitly requested asset preview using the configured image router and gpt-image-2. Makes exactly one paid image request with no automatic retry or model change, and saves source images, prompt/request metadata and a manifest under output/imagegen/game-assets. Returns local file paths and warnings, not inline image data. Only one generation may run at a time. ${PREVIEW_NOTICE}`,
    inputSchema: ASSET_INPUT_SCHEMA,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'prepare_game_asset', title: 'Prepare saved game asset alpha',
    description: `Process a saved game asset preview manifest locally using the chromakey alpha workflow; no network request or image regeneration. Preserves source images and source canvas dimensions, saves prepared files and returns file paths plus warnings. ${PREVIEW_NOTICE}`,
    inputSchema: PREPARE_INPUT_SCHEMA,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  {
    name: 'check_game_image_router', title: 'Check image router models',
    description: `Read the configured router's GET /models endpoint and check availability of gpt-image-2. This read-only check uses the existing local credential configuration; it makes no paid image request and does not prove generation works. ${PREVIEW_NOTICE}`,
    inputSchema: EMPTY_INPUT_SCHEMA,
    annotations: { ...READ_ONLY, openWorldHint: true },
  },
];

class InputError extends Error {}
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });
const rpcResult = (id, result) => ({ jsonrpc: '2.0', id, result });

export function resolveWorkspaceRoot({ argv = [], env = process.env } = {}) {
  let cliRoot;
  if (argv.length) {
    if (argv.length !== 2 || argv[0] !== '--workspace' || !argv[1]) throw new InputError('Use only --workspace followed by an absolute project path.');
    cliRoot = argv[1];
  }
  const root = cliRoot ?? env.GAME_ASSET_WORKSPACE ?? DEFAULT_WORKSPACE_ROOT;
  if (typeof root !== 'string' || !path.isAbsolute(root)) throw new InputError('The game asset workspace must be an absolute project path.');
  return path.resolve(root);
}

function validateEmptyInput(value) {
  if (!isObject(value) || Object.keys(value).length) throw new InputError('This tool accepts an empty arguments object only.');
}

function validateAssetInput(value) {
  if (!isObject(value) || Object.keys(value).some((key) => !ASSET_FIELDS.has(key))) throw new InputError('Asset arguments must be an object with only assetType, name, prompt, size, quality and n.');
  if (!ASSET_TYPES.includes(value.assetType)) throw new InputError('assetType must be one of the listed game asset profiles.');
  if (typeof value.name !== 'string' || value.name.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.name)) throw new InputError('name must be a lowercase ASCII hyphen slug of at most 64 characters.');
  if (typeof value.prompt !== 'string' || !value.prompt.trim() || value.prompt.includes('\0') || Buffer.byteLength(value.prompt, 'utf8') > 32768) throw new InputError('prompt must contain text without NUL and be at most 32768 UTF-8 bytes.');
  if (own(value, 'size') && value.size !== 'auto') {
    const dimensions = typeof value.size === 'string' ? /^([1-9][0-9]{0,3})x([1-9][0-9]{0,3})$/.exec(value.size) : null;
    const width = Number(dimensions?.[1]);
    const height = Number(dimensions?.[2]);
    const pixels = width * height;
    if (!dimensions || width > 3840 || height > 3840 || width % 16 !== 0 || height % 16 !== 0 || Math.max(width, height) / Math.min(width, height) > 3 || pixels < 655360 || pixels > 8294400) throw new InputError('size must be auto or WIDTHxHEIGHT with edges in multiples of 16 up to 3840, aspect ratio at most 3:1, and 655360 through 8294400 pixels.');
  }
  if (own(value, 'quality') && !QUALITIES.includes(value.quality)) throw new InputError('quality must be low, medium, high or auto.');
  if (own(value, 'n') && (!Number.isInteger(value.n) || value.n < 1 || value.n > 4)) throw new InputError('n must be an integer from 1 through 4.');
}

function validatePrepareInput(value) {
  if (!isObject(value) || Object.keys(value).some((key) => !['manifestPath', 'imageIndex'].includes(key))) throw new InputError('Preparation arguments must contain only manifestPath and optional imageIndex.');
  if (typeof value.manifestPath !== 'string' || !value.manifestPath.trim() || /[\u0000\r\n]/.test(value.manifestPath)) throw new InputError('manifestPath must be a nonempty local path.');
  if (own(value, 'imageIndex') && (!Number.isInteger(value.imageIndex) || value.imageIndex < 1 || value.imageIndex > 4)) throw new InputError('imageIndex must be an integer from 1 through 4.');
}

function redactValue(value, secrets) {
  if (typeof value === 'string') {
    let result = value;
    for (const secret of secrets) {
      const variants = new Set([secret, encodeURIComponent(secret), JSON.stringify(secret).slice(1, -1), Buffer.from(secret).toString('base64')]);
      for (const variant of variants) result = result.split(variant).join('[REDACTED]');
    }
    return result;
  }
  if (Array.isArray(value)) return value.map((entry) => redactValue(entry, secrets));
  if (isObject(value)) return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !/^(?:api[_-]?key(?:dpapi)?|authorization|access[_-]?token)$/i.test(key))
    .map(([key, entry]) => [key, redactValue(entry, secrets)]));
  return value;
}

function toolResult(value, secrets, isError = false) {
  const structuredContent = redactValue(isObject(value) ? value : { value }, secrets);
  return { content: [{ type: 'text', text: JSON.stringify(structuredContent) }], structuredContent, ...(isError ? { isError: true } : {}) };
}

async function defaultCheckRouter({ env, config, fetchImpl }) {
  const resolved = config ?? await resolveConfig({ env });
  if (resolved.model !== 'gpt-image-2') throw new InputError('This game asset server requires the configured model gpt-image-2.');
  return runCheck({ config: resolved, fetchImpl });
}

/** Returns an async JSON-RPC handler. Notifications return null and never execute paid tools. */
export function createMcpHandler({
  workspaceRoot, env = process.env, config, fetchImpl = globalThis.fetch, now = Date.now,
  planAsset = planGameAsset, generateAsset = generateGameAsset, listProfiles = listAssetProfiles,
  prepareAsset = prepareGameAsset,
  checkRouter = defaultCheckRouter, diagnostic = () => {},
} = {}) {
  const root = resolveWorkspaceRoot({ env: workspaceRoot === undefined ? env : { GAME_ASSET_WORKSPACE: workspaceRoot } });
  const secrets = [env?.IMAGEGEN_ROUTER_API_KEY, config?.apiKey].filter((value) => typeof value === 'string' && value.length);
  let initialized = false;
  let generating = false;
  return async function handle(message) {
    if (!isObject(message) || message.jsonrpc !== '2.0' || typeof message.method !== 'string' || !message.method ||
      (own(message, 'id') && typeof message.id !== 'string' && !(typeof message.id === 'number' && Number.isFinite(message.id)))) return rpcError(null, -32600, 'Invalid JSON-RPC request.');
    // JSON-RPC notifications require no response. Tool calls must carry an id so a
    // malformed notification cannot trigger an unacknowledged paid generation.
    if (!own(message, 'id')) return null;
    const id = message.id;
    if (own(message, 'params') && !isObject(message.params) && !Array.isArray(message.params)) return rpcError(id, -32600, 'Invalid JSON-RPC request.');
    const params = message.params ?? {};
    if (message.method === 'initialize') {
      if (!isObject(params) || typeof params.protocolVersion !== 'string' || !isObject(params.capabilities) || !isObject(params.clientInfo) || typeof params.clientInfo.name !== 'string' || typeof params.clientInfo.version !== 'string') return rpcError(id, -32602, 'initialize requires protocolVersion, capabilities and clientInfo.');
      initialized = true;
      return rpcResult(id, {
        protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : SUPPORTED_PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'game-solo-assetgen', version: '1.0.0' },
        instructions: 'Use plan_game_asset before an explicit paid generation. Generated files remain previews awaiting owner review; no runtime or ART approval is automatic.',
      });
    }
    if (message.method === 'ping') return rpcResult(id, {});
    if (!initialized) return rpcError(id, -32000, 'Initialize the MCP session first.');
    if (message.method === 'tools/list') {
      if (!isObject(params) || Object.keys(params).some((key) => key !== '_meta') || (own(params, '_meta') && !isObject(params._meta))) return rpcError(id, -32602, 'tools/list accepts an empty params object or optional _meta only.');
      return rpcResult(id, { tools: structuredClone(TOOLS) });
    }
    if (message.method !== 'tools/call') return rpcError(id, -32601, 'Method not found.');
    if (!isObject(params) || typeof params.name !== 'string' || Object.keys(params).some((key) => !['name', 'arguments', '_meta'].includes(key)) || (own(params, '_meta') && !isObject(params._meta))) return rpcError(id, -32602, 'tools/call requires a tool name and arguments object.');
    const tool = TOOLS.find((entry) => entry.name === params.name);
    if (!tool) return rpcError(id, -32602, 'Unknown tool name.');
    const input = params.arguments ?? {};
    try {
      if (tool.inputSchema === EMPTY_INPUT_SCHEMA) validateEmptyInput(input);
      else if (tool.inputSchema === PREPARE_INPUT_SCHEMA) validatePrepareInput(input);
      else validateAssetInput(input);
    } catch (error) {
      return rpcError(id, -32602, error instanceof InputError ? error.message : 'Invalid tool arguments.');
    }
    if (params.name === 'generate_game_asset' && generating) return rpcResult(id, toolResult({ error: 'A game asset generation is already running. Wait for its result before explicitly generating again.' }, secrets, true));
    const isGeneration = params.name === 'generate_game_asset';
    if (isGeneration) generating = true;
    try {
      let result;
      if (params.name === 'list_game_asset_profiles') result = { profiles: await listProfiles() };
      else if (params.name === 'plan_game_asset') result = await planAsset(input, { workspaceRoot: root });
      else if (isGeneration) result = await generateAsset(input, { workspaceRoot: root, env, config, fetchImpl, now });
      else if (params.name === 'prepare_game_asset') result = await prepareAsset(input, { workspaceRoot: root, env });
      else result = await checkRouter({ workspaceRoot: root, env, config, fetchImpl });
      return rpcResult(id, toolResult(result, secrets));
    } catch (error) {
      // Core/router errors are already sanitized, and supplied env/config keys are
      // redacted again here. Never expose arbitrary exception text to the client.
      try { diagnostic(`Game asset tool failed: ${sanitizeError(error, secrets)}`); } catch { /* Diagnostics cannot break JSON-RPC. */ }
      return rpcResult(id, toolResult({ error: error instanceof InputError ? error.message : 'Game asset operation failed. Check the local router configuration and sanitized server diagnostics before retrying explicitly.' }, secrets, true));
    } finally {
      if (isGeneration) generating = false;
    }
  };
}

/** Read bounded newline JSON messages concurrently; a slow tool never blocks ping. */
export function startStdioServer({
  input = process.stdin, output = process.stdout, errorOutput = process.stderr,
  handler, maxLineBytes = MAX_LINE_BYTES, ...handlerOptions
} = {}) {
  if (!Number.isInteger(maxLineBytes) || maxLineBytes < 1) throw new InputError('maxLineBytes must be a positive integer.');
  const diagnostic = (message) => errorOutput.write(`${message}\n`);
  const handle = handler ?? createMcpHandler({ ...handlerOptions, diagnostic });
  let buffer = Buffer.alloc(0);
  let discarding = false;
  let ended = false;
  const pending = new Set();
  return new Promise((resolve, reject) => {
    const finish = () => { if (ended && pending.size === 0) resolve(); };
    const write = (response) => {
      if (response !== null && response !== undefined) output.write(`${JSON.stringify(response)}\n`);
    };
    const dispatch = (line) => {
      if (!line.length) return;
      let request;
      try { request = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(line)); }
      catch { write(rpcError(null, -32700, 'Invalid JSON.')); return; }
      const task = Promise.resolve().then(() => handle(request)).then(write).catch(() => {
        // No request or error object is echoed: either can contain secrets.
        write(rpcError(null, -32603, 'Internal server error.'));
        diagnostic('MCP request handling failed.');
      }).finally(() => { pending.delete(task); finish(); });
      pending.add(task);
    };
    const append = (chunk) => {
      if (discarding) return;
      if (buffer.length + chunk.length > maxLineBytes) {
        buffer = Buffer.alloc(0);
        discarding = true;
        write(rpcError(null, -32700, 'JSON message exceeds the line size limit.'));
      } else buffer = Buffer.concat([buffer, chunk]);
    };
    input.on('data', (data) => {
      const chunk = Buffer.isBuffer(data) ? data : Buffer.from(data);
      let offset = 0;
      let end;
      while ((end = chunk.indexOf(10, offset)) !== -1) {
        append(chunk.subarray(offset, end));
        if (!discarding) dispatch(buffer);
        buffer = Buffer.alloc(0);
        discarding = false;
        offset = end + 1;
      }
      append(chunk.subarray(offset));
    });
    input.on('end', () => {
      if (!discarding && buffer.length) dispatch(buffer);
      buffer = Buffer.alloc(0);
      ended = true;
      finish();
    });
    input.on('error', () => {
      diagnostic('MCP input stream failed.');
      reject(new Error('MCP input stream failed.'));
    });
    output.on('error', () => reject(new Error('MCP output stream failed.')));
  });
}

export async function main({ argv = process.argv.slice(2), env = process.env, ...options } = {}) {
  const errorOutput = options.errorOutput ?? process.stderr;
  try {
    const workspaceRoot = resolveWorkspaceRoot({ argv, env });
    await startStdioServer({ ...options, workspaceRoot, env });
    return 0;
  } catch {
    errorOutput.write('Game asset MCP server could not start or its stdio stream failed. Use --workspace with an absolute project path.\n');
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
