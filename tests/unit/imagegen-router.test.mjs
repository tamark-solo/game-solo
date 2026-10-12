import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, open, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  detectImageType,
  detectImageDimensions,
  main,
  parseArgs,
  resolveConfig,
  runCheck,
  runGenerate,
  runEdit,
  runEditResponses,
  sanitizeError,
  validateBaseUrl,
} from '../../scripts/imagegen-router.mjs';

// All credentials, URLs, images and responses in this suite are offline fixtures.
const FIXTURE_KEY = 'test-image-router-credential-never-use';
const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jE7sAAAAASUVORK5CYII=';
const PNG = Buffer.from(PNG_BASE64, 'base64');
const BASE_URL = 'https://router.invalid/v1';
const PROMPT = 'Một hồ nước trong sương. Keep this exact prompt.\nNo owner approval.';

function fixtureConfig(overrides = {}) {
  return { baseUrl: BASE_URL, apiKey: FIXTURE_KEY, model: 'gpt-image-2', ...overrides };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function imageResponse(image = PNG, status = 200) {
  return new Response(image, { status, headers: { 'content-type': 'image/png' } });
}

function mockFetch(respond) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const call = { url: String(url), init };
    calls.push(call);
    return respond(call, calls.length);
  };
  return { calls, fetchImpl };
}

async function temporaryFixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'game-solo-image-router-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return { directory, out: path.join(directory, 'preview.png') };
}

function requestHeaders(call) {
  return new Headers(call.init.headers);
}

async function generate(t, respond, overrides = {}) {
  const fixture = await temporaryFixture(t);
  const transport = mockFetch(respond);
  const result = await runGenerate({
    config: fixtureConfig(),
    prompt: PROMPT,
    out: fixture.out,
    fetchImpl: transport.fetchImpl,
    now: () => new Date('2026-10-12T00:00:00.000Z'),
    ...overrides,
  });
  return { ...fixture, ...transport, result };
}

test('image type detection requires supported image bytes, not a file extension', () => {
  assert.equal(detectImageType(PNG).mimeType, 'image/png');
  for (const invalid of [Buffer.alloc(0), Buffer.from('<html>not an image</html>'), Buffer.from('{}')]) {
    assert.throws(() => detectImageType(invalid), /signature/);
  }
});

test('PNG dimensions are read from the image header', () => {
  assert.deepEqual(detectImageDimensions(PNG), { width: 1, height: 1 });
  assert.equal(detectImageDimensions(PNG.subarray(0, 8)), null);
});

test('router size mismatch is recorded without a second paid generation or resizing', async (t) => {
  const { calls, result } = await generate(t, () => jsonResponse({ data: [{ b64_json: PNG_BASE64 }] }));
  assert.equal(calls.length, 1);
  assert.deepEqual(result.files[0].dimensions, { width: 1, height: 1 });
  assert.equal(result.files[0].sizeMatchesRequest, false);
  assert.match(result.warnings[0], /returned 1x1, requested 1024x1024/);
  assert.deepEqual(await readFile(result.files[0].path), PNG);
  const metadata = JSON.parse(await readFile(result.files[0].metadataPath, 'utf8'));
  assert.deepEqual(metadata.image.dimensions, { width: 1, height: 1 });
  assert.equal(metadata.verification.sizeMatchesRequest, false);
});

test('CLI parsing preserves prompts and explicit request options', () => {
  assert.deepEqual(parseArgs([
    'generate', '--prompt', PROMPT, '--out', 'output/example.png', '--size', '1536x1024',
    '--quality', 'medium', '--n', '2', '--timeout', '1.25', '--dry-run', '--force',
  ]), {
    command: 'generate', prompt: PROMPT, out: 'output/example.png', size: '1536x1024',
    quality: 'medium', n: 2, timeoutMs: 1250, dryRun: true, force: true,
  });
  assert.equal(parseArgs(['generate', '--prompt-file', 'example.txt']).promptFile, 'example.txt');
});

test('CLI parsing rejects ambiguous prompts, invalid counts and command-line credentials', () => {
  for (const args of [
    ['generate'],
    ['generate', '--prompt', 'first', '--prompt-file', 'second.txt'],
    ['generate', '--prompt', 'first', '--prompt', 'second'],
    ['generate', '--prompt', 'first', '--api-key', FIXTURE_KEY],
    ['generate', '--prompt', 'first', '--n', '0'],
    ['generate', '--prompt', 'first', '--n', '1.5'],
    ['generate', '--prompt', 'first', '--n', '11'],
    ['generate', '--prompt', 'first', '--timeout', '0'],
    ['check', '--prompt', 'first'],
    ['generate', '--prompt-file'],
  ]) assert.throws(() => parseArgs(args));
});

test('stored local config uses injected DPAPI decryption and returns no ciphertext', async (t) => {
  const { directory } = await temporaryFixture(t);
  const configPath = path.join(directory, 'router.json');
  const cipher = 'offline-dpapi-cipher-fixture';
  await writeFile(configPath, JSON.stringify({ version: 1, baseUrl: `${BASE_URL}/`, model: 'gpt-image-2', apiKeyDpapi: cipher }));
  const decrypted = [];
  const resolved = await resolveConfig({
    env: {}, configPath, readFile,
    decryptKey: async (value) => { decrypted.push(value); return FIXTURE_KEY; },
  });
  assert.deepEqual(decrypted, [cipher]);
  assert.equal(resolved.baseUrl, BASE_URL);
  assert.equal(resolved.apiKey, FIXTURE_KEY);
  assert.equal(resolved.model, 'gpt-image-2');
  assert.equal(resolved.configPath, configPath);
  assert.ok(!JSON.stringify(resolved).includes(cipher));
});

test('environment config overrides stored URL and key without decrypting old credentials', async (t) => {
  const { directory } = await temporaryFixture(t);
  const configPath = path.join(directory, 'router.json');
  await writeFile(configPath, JSON.stringify({ version: 1, baseUrl: BASE_URL, model: 'gpt-image-2', apiKeyDpapi: 'unused-cipher' }));
  const resolved = await resolveConfig({
    env: { IMAGEGEN_ROUTER_CONFIG: configPath, IMAGEGEN_ROUTER_BASE_URL: 'https://override.invalid/v1/', IMAGEGEN_ROUTER_API_KEY: FIXTURE_KEY },
    readFile,
    decryptKey: async () => { throw new Error('override must bypass stored key decryption'); },
  });
  assert.equal(resolved.baseUrl, 'https://override.invalid/v1');
  assert.equal(resolved.apiKey, FIXTURE_KEY);
  assert.equal(resolved.configPath, configPath);
});

test('invalid local config fails without echoing its raw contents', async () => {
  await assert.rejects(resolveConfig({
    env: {}, configPath: 'invalid-offline-config.json',
    readFile: async () => `{ malformed ${FIXTURE_KEY}`,
    decryptKey: async () => { throw new Error('invalid JSON must fail first'); },
  }), (error) => {
    assert.match(String(error), /invalid JSON/);
    assert.ok(!String(error).includes(FIXTURE_KEY));
    return true;
  });
});

test('base URL validation rejects credential-bearing and non-HTTPS endpoints', () => {
  assert.ok(validateBaseUrl('https://router.invalid/v1/'));
  for (const unsafe of [
    'http://router.invalid/v1',
    'https://user:password@router.invalid/v1',
    'https://router.invalid/v1?api_key=secret',
    'https://router.invalid/v1#secret',
    'file:///tmp/image-router',
    'not a url',
  ]) {
    assert.throws(() => validateBaseUrl(unsafe), undefined, unsafe);
  }
});

test('error sanitization removes exact credentials and bearer values', () => {
  const message = sanitizeError(`Failed ${FIXTURE_KEY}; Authorization: Bearer another-private-token`, [FIXTURE_KEY]);
  assert.equal(typeof message, 'string');
  assert.ok(!message.includes(FIXTURE_KEY));
  assert.ok(!message.includes('another-private-token'));
  assert.ok(message.includes('Failed'));
});

test('generate sends one authorized request to the image generation endpoint', async (t) => {
  const { calls, result } = await generate(t, () => jsonResponse({ data: [{ b64_json: PNG_BASE64 }] }));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${BASE_URL}/images/generations`);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.redirect, 'error');
  assert.equal(requestHeaders(calls[0]).get('authorization'), `Bearer ${FIXTURE_KEY}`);
  assert.equal(requestHeaders(calls[0]).get('content-type'), 'application/json');
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.prompt, PROMPT);
  assert.equal(body.model, 'gpt-image-2');
  assert.equal(body.size, '1024x1024');
  assert.equal(body.quality, 'low');
  assert.equal(body.n, 1);
  assert.equal(result.files.length, 1);
});

test('base64 output is saved byte-for-byte with its hash and unapproved metadata', async (t) => {
  const { result } = await generate(t, () => jsonResponse({ data: [{ b64_json: PNG_BASE64, revised_prompt: 'A revised prompt' }] }));
  const file = result.files[0];
  const bytes = await readFile(file.path);
  assert.deepEqual(bytes, PNG);
  assert.equal(file.sha256, createHash('sha256').update(PNG).digest('hex'));
  assert.equal(file.mimeType, 'image/png');
  const metadataText = await readFile(file.metadataPath, 'utf8');
  const metadata = JSON.parse(metadataText);
  assert.equal(metadata.prompt, PROMPT);
  assert.equal(metadata.ownerApproved, false);
  assert.equal(metadata.artApproved, false);
  assert.equal(metadata.status, 'preview-only');
  assert.equal(metadata.image.sha256, file.sha256);
  assert.equal(metadata.image.bytes, PNG.length);
  assert.equal(metadata.image.mimeType, 'image/png');
  assert.equal(metadata.image.source, 'b64_json');
  assert.equal(metadata.generatedAt, '2026-10-12T00:00:00.000Z');
  assert.equal(metadata.verification.visualReview, 'pending');
  assert.ok(!metadataText.includes(FIXTURE_KEY));
});

test('URL image download never receives the generation Authorization header', async (t) => {
  const downloadUrl = 'https://images.invalid/private-output.png?signature=fixture';
  const { calls, result } = await generate(t, (call, count) => count === 1
    ? jsonResponse({ data: [{ url: downloadUrl }] })
    : imageResponse());
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, downloadUrl);
  assert.equal(calls[1].init.method ?? 'GET', 'GET');
  assert.equal(calls[1].init.redirect, 'manual');
  assert.equal(requestHeaders(calls[1]).get('authorization'), null);
  assert.deepEqual(await readFile(result.files[0].path), PNG);
});

test('manual image redirects validate each destination and never forward credentials', async (t) => {
  const { calls, result } = await generate(t, (call, count) => {
    if (count === 1) return jsonResponse({ data: [{ url: 'https://images.invalid/first.png' }] });
    if (count === 2) return new Response(null, { status: 302, headers: { location: 'https://cdn.invalid/final.png' } });
    return imageResponse();
  });
  assert.equal(calls.length, 3);
  assert.equal(calls[2].url, 'https://cdn.invalid/final.png');
  for (const download of calls.slice(1)) {
    assert.equal(download.init.redirect, 'manual');
    assert.equal(requestHeaders(download).get('authorization'), null);
  }
  assert.deepEqual(await readFile(result.files[0].path), PNG);
});

test('unsafe image URLs and redirects fail before fetching the unsafe destination', async (t) => {
  for (const responseUrl of ['http://remote.invalid/image.png', 'https://user:password@images.invalid/image.png', 'file:///tmp/image.png']) {
    const { directory, out } = await temporaryFixture(t);
    const { calls, fetchImpl } = mockFetch(() => jsonResponse({ data: [{ url: responseUrl }] }));
    await assert.rejects(runGenerate({ config: fixtureConfig(), prompt: PROMPT, out, fetchImpl }));
    assert.equal(calls.length, 1);
    assert.deepEqual(await readdir(directory), []);
  }
  const { directory, out } = await temporaryFixture(t);
  const { calls, fetchImpl } = mockFetch((call, count) => count === 1
    ? jsonResponse({ data: [{ url: 'https://images.invalid/image.png' }] })
    : new Response(null, { status: 302, headers: { location: 'http://remote.invalid/unsafe.png' } }));
  await assert.rejects(runGenerate({ config: fixtureConfig(), prompt: PROMPT, out, fetchImpl }));
  assert.equal(calls.length, 2);
  assert.deepEqual(await readdir(directory), []);
});

test('an existing image prevents any billable POST unless force is explicit', async (t) => {
  const { directory, out } = await temporaryFixture(t);
  await writeFile(out, 'keep the existing owner file');
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('must not fetch'); });
  await assert.rejects(runGenerate({ config: fixtureConfig(), prompt: PROMPT, out, fetchImpl }));
  assert.equal(calls.length, 0);
  assert.equal(await readFile(out, 'utf8'), 'keep the existing owner file');
  assert.deepEqual(await readdir(directory), ['preview.png']);
});

test('existing metadata or a different image extension also prevents a billable POST', async (t) => {
  for (const suffix of ['.json', '.jpg', '.webp']) {
    const { directory, out } = await temporaryFixture(t);
    const conflictingPath = out.slice(0, -4) + suffix;
    await writeFile(conflictingPath, 'preserve this fixture');
    const { calls, fetchImpl } = mockFetch(() => { throw new Error('must fail before POST'); });
    await assert.rejects(runGenerate({ config: fixtureConfig(), prompt: PROMPT, out, fetchImpl }));
    assert.equal(calls.length, 0);
    assert.equal(await readFile(conflictingPath, 'utf8'), 'preserve this fixture');
    assert.equal((await readdir(directory)).length, 1);
  }
});

test('force explicitly allows replacement without a second generation request', async (t) => {
  const { directory, out } = await temporaryFixture(t);
  await writeFile(out, 'old preview');
  await writeFile(out.slice(0, -4) + '.json', '{"status":"old-preview"}');
  const { calls, fetchImpl } = mockFetch(() => jsonResponse({ data: [{ b64_json: PNG_BASE64 }] }));
  const result = await runGenerate({ config: fixtureConfig(), prompt: PROMPT, out, force: true, fetchImpl });
  assert.equal(calls.length, 1);
  assert.deepEqual(await readFile(result.files[0].path), PNG);
  assert.equal(JSON.parse(await readFile(result.files[0].metadataPath, 'utf8')).status, 'preview-only');
  assert.deepEqual((await readdir(directory)).sort(), ['preview.json', 'preview.png']);
});

test('multi-image output has unique names and every returned image is verified before writing', async (t) => {
  const { calls, result } = await generate(t, () => jsonResponse({ data: [{ b64_json: PNG_BASE64 }, { b64_json: PNG_BASE64 }] }), { n: 2 });
  assert.equal(calls.length, 1);
  assert.equal(JSON.parse(calls[0].init.body).n, 2);
  assert.deepEqual(result.files.map((file) => path.basename(file.path)), ['preview-01.png', 'preview-02.png']);
  for (const file of result.files) {
    assert.deepEqual(await readFile(file.path), PNG);
    assert.equal(JSON.parse(await readFile(file.metadataPath, 'utf8')).ownerApproved, false);
  }
  const { directory, out } = await temporaryFixture(t);
  const { fetchImpl } = mockFetch(() => jsonResponse({ data: [{ b64_json: PNG_BASE64 }, { b64_json: Buffer.from('invalid image').toString('base64') }] }));
  await assert.rejects(runGenerate({ config: fixtureConfig(), prompt: PROMPT, out, n: 2, fetchImpl }));
  assert.deepEqual(await readdir(directory), []);
});

test('a generation HTTP error is redacted and never automatically retried', async (t) => {
  const { directory, out } = await temporaryFixture(t);
  const { calls, fetchImpl } = mockFetch(() => jsonResponse({ error: { message: `Invalid api key: ${FIXTURE_KEY}` } }, 429));
  await assert.rejects(runGenerate({ config: fixtureConfig(), prompt: PROMPT, out, fetchImpl }), (error) => {
    assert.ok(!String(error).includes(FIXTURE_KEY));
    assert.match(String(error), /429/);
    return true;
  });
  assert.equal(calls.length, 1);
  assert.deepEqual(await readdir(directory), []);
});

test('ambiguous transport failure never automatically repeats a generation POST', async (t) => {
  const { directory, out } = await temporaryFixture(t);
  const { calls, fetchImpl } = mockFetch(() => { throw new Error(`socket failed ${FIXTURE_KEY}`); });
  await assert.rejects(runGenerate({ config: fixtureConfig(), prompt: PROMPT, out, fetchImpl }), (error) => {
    assert.ok(!String(error).includes(FIXTURE_KEY));
    return true;
  });
  assert.equal(calls.length, 1);
  assert.deepEqual(await readdir(directory), []);
});

test('empty, error-shaped and invalid-image generation responses produce no files', async (t) => {
  const invalidResponses = [
    {},
    { data: [] },
    { error: { message: 'router refused this request' } },
    { data: [{ b64_json: Buffer.from('not an image').toString('base64') }] },
    { data: [{ b64_json: 'not-valid-base64!' }] },
  ];
  for (const response of invalidResponses) {
    const { directory, out } = await temporaryFixture(t);
    const { calls, fetchImpl } = mockFetch(() => jsonResponse(response));
    await assert.rejects(runGenerate({ config: fixtureConfig(), prompt: PROMPT, out, fetchImpl }));
    assert.equal(calls.length, 1);
    assert.deepEqual(await readdir(directory), []);
  }
});

test('dry-run needs no key, sends no network request and writes no image', async (t) => {
  const { directory, out } = await temporaryFixture(t);
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('dry-run must not fetch'); });
  await runGenerate({ config: fixtureConfig({ apiKey: undefined }), prompt: PROMPT, out, dryRun: true, fetchImpl });
  assert.equal(calls.length, 0);
  assert.deepEqual(await readdir(directory), []);
});

test('invalid generation options fail before network or output writes', async (t) => {
  for (const overrides of [{ n: 0 }, { n: 11 }, { n: 1.5 }, { quality: 'expensive' }, { size: '0x1024' }, { prompt: '  ' }, { timeoutMs: 0 }]) {
    const { directory, out } = await temporaryFixture(t);
    const { calls, fetchImpl } = mockFetch(() => { throw new Error('must validate before POST'); });
    await assert.rejects(runGenerate({ config: fixtureConfig(), prompt: PROMPT, out, fetchImpl, ...overrides }));
    assert.equal(calls.length, 0);
    assert.deepEqual(await readdir(directory), []);
  }
});

test('generation deadline aborts once without retrying a possibly billed POST', async (t) => {
  const { directory, out } = await temporaryFixture(t);
  const { calls, fetchImpl } = mockFetch((call) => new Promise((resolve, reject) => {
    call.init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }));
  await assert.rejects(runGenerate({ config: fixtureConfig(), prompt: PROMPT, out, fetchImpl, timeoutMs: 10 }), /timed out/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.signal.aborted, true);
  assert.deepEqual(await readdir(directory), []);
});

test('check performs an authorized models GET without invoking image generation', async () => {
  const { calls, fetchImpl } = mockFetch(() => jsonResponse({ data: [{ id: 'gpt-image-2' }] }));
  const result = await runCheck({ config: fixtureConfig(), fetchImpl });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${BASE_URL}/models`);
  assert.equal(calls[0].init.method ?? 'GET', 'GET');
  assert.equal(calls[0].init.redirect, 'error');
  assert.equal(requestHeaders(calls[0]).get('authorization'), `Bearer ${FIXTURE_KEY}`);
  assert.equal(result.modelAvailable, true);
  assert.equal(result.verification, 'model-list-only');
  assert.equal(result.generationVerified, false);
});

test('check reports a missing configured model without claiming generation succeeded', async () => {
  const { calls, fetchImpl } = mockFetch(() => jsonResponse({ data: [{ id: 'another-model' }] }));
  const result = await runCheck({ config: fixtureConfig(), fetchImpl });
  assert.equal(calls.length, 1);
  assert.equal(result.modelAvailable, false);
  assert.equal(result.generationVerified, false);
});

test('main dry-run reads a prompt file exactly with no API key or network', async (t) => {
  const { directory, out } = await temporaryFixture(t);
  const promptPath = path.join(directory, 'prompt.txt');
  await writeFile(promptPath, `  ${PROMPT}\n`);
  let stdoutText = '';
  let stderrText = '';
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('dry-run must not fetch'); });
  const code = await main(['generate', '--prompt-file', promptPath, '--out', out, '--dry-run'], {
    env: { IMAGEGEN_ROUTER_CONFIG: path.join(directory, 'missing-router.json'), IMAGEGEN_ROUTER_BASE_URL: BASE_URL },
    stdout: { write: (value) => { stdoutText += value; } },
    stderr: { write: (value) => { stderrText += value; } },
    fetchImpl,
  });
  assert.equal(code, 0);
  assert.equal(stderrText, '');
  assert.equal(JSON.parse(stdoutText).request.prompt, `  ${PROMPT}\n`);
  assert.equal(calls.length, 0);
  assert.deepEqual(await readdir(directory), ['prompt.txt']);
});

function pngWithDimensions(width, height) {
  const bytes = Buffer.from(PNG);
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  return bytes;
}

async function editFixture(t) {
  const fixture = await temporaryFixture(t);
  const targetPath = path.join(fixture.directory, 'target.png');
  const stylePath = path.join(fixture.directory, 'style.png');
  const style = pngWithDimensions(2, 3);
  await writeFile(targetPath, PNG);
  await writeFile(stylePath, style);
  return { ...fixture, targetPath, stylePath, style };
}

test('edit CLI accepts ordered repeated image inputs and rejects missing or misplaced inputs', () => {
  assert.deepEqual(parseArgs(['edit', '--prompt-file', 'prompt.txt', '--image', 'crop.png', '--image=style.webp', '--quality', 'high', '--dry-run']), {
    command: 'edit', promptFile: 'prompt.txt', images: ['crop.png', 'style.webp'], quality: 'high', dryRun: true,
  });
  for (const args of [
    ['edit', '--prompt', PROMPT],
    ['edit', '--prompt', PROMPT, '--image'],
    ['edit', '--prompt', PROMPT, '--image='],
    ['generate', '--prompt', PROMPT, '--image', 'crop.png'],
    ['check', '--image', 'crop.png'],
    ['edit', '--prompt', PROMPT, ...Array.from({ length: 17 }, (_, index) => ['--image', `image-${index}.png`]).flat()],
  ]) assert.throws(() => parseArgs(args));
});

test('edit sends one multipart POST with ordered image inputs and no unsupported fidelity parameter', async (t) => {
  const { out, targetPath, stylePath, style } = await editFixture(t);
  const { calls, fetchImpl } = mockFetch(() => jsonResponse({ data: [{ b64_json: PNG_BASE64 }] }));
  const result = await runEdit({ config: fixtureConfig(), prompt: PROMPT, images: [targetPath, stylePath], out, quality: 'high', fetchImpl });
  assert.equal(calls.length, 1);
  const call = calls[0];
  assert.equal(call.url, `${BASE_URL}/images/edits`);
  assert.equal(call.init.method, 'POST');
  assert.equal(call.init.redirect, 'error');
  assert.equal(requestHeaders(call).get('authorization'), `Bearer ${FIXTURE_KEY}`);
  assert.equal(requestHeaders(call).get('content-type'), null);
  assert.ok(call.init.body instanceof FormData);
  assert.equal(call.init.body.get('model'), 'gpt-image-2');
  assert.equal(call.init.body.get('prompt'), PROMPT);
  assert.equal(call.init.body.get('quality'), 'high');
  assert.equal(call.init.body.get('n'), '1');
  assert.equal(call.init.body.get('output_format'), 'png');
  assert.equal(call.init.body.has('input_fidelity'), false);
  const images = call.init.body.getAll('image[]');
  assert.deepEqual(images.map((image) => image.name), ['target.png', 'style.png']);
  assert.deepEqual(Buffer.from(await images[0].arrayBuffer()), PNG);
  assert.deepEqual(Buffer.from(await images[1].arrayBuffer()), style);
  assert.deepEqual(images.map((image) => image.type), ['image/png', 'image/png']);
  assert.deepEqual(await readFile(result.files[0].path), PNG);
  const metadata = JSON.parse(await readFile(result.files[0].metadataPath, 'utf8'));
  assert.equal(metadata.operation, 'edit');
  assert.equal(metadata.encoding, 'multipart/form-data');
  assert.equal(metadata.registrationVerified, false);
  assert.equal(metadata.ownerApproved, false);
  assert.equal(metadata.artApproved, false);
  assert.deepEqual(metadata.inputImages.map((input) => input.role), ['edit-target', 'supporting-input']);
  assert.deepEqual(metadata.inputImages.map((input) => input.dimensions), [{ width: 1, height: 1 }, { width: 2, height: 3 }]);
  assert.equal(metadata.inputImages[0].path, targetPath);
  assert.equal(metadata.inputImages[0].sha256, createHash('sha256').update(PNG).digest('hex'));
  assert.equal(metadata.inputImages[0].bytes, PNG.length);
  assert.equal(metadata.requestParameters.prompt, PROMPT);
  assert.ok(!JSON.stringify(metadata).includes(FIXTURE_KEY));
});

test('edit dry-run reports hashes and dimensions without image data, key, output or network', async (t) => {
  const { out, targetPath, stylePath, directory } = await editFixture(t);
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('dry-run must not fetch'); });
  const result = await runEdit({ config: fixtureConfig({ apiKey: undefined }), prompt: PROMPT, images: [targetPath, stylePath], out, dryRun: true, fetchImpl });
  assert.equal(calls.length, 0);
  assert.equal(result.endpoint, `${BASE_URL}/images/edits`);
  assert.equal(result.generationVerified, false);
  assert.equal(result.registrationVerified, false);
  assert.deepEqual(result.inputImages.map((input) => input.dimensions), [{ width: 1, height: 1 }, { width: 2, height: 3 }]);
  assert.ok(!JSON.stringify(result).includes(PNG_BASE64));
  assert.ok(!JSON.stringify(result).includes(FIXTURE_KEY));
  assert.deepEqual((await readdir(directory)).sort(), ['style.png', 'target.png']);
});

test('edit rejects duplicate file paths and duplicate content before network or output', async (t) => {
  const { out, targetPath, stylePath, directory } = await editFixture(t);
  await writeFile(stylePath, PNG);
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('invalid inputs must not fetch'); });
  for (const images of [[targetPath, path.join(directory, '.', 'target.png')], [targetPath, stylePath]]) {
    await assert.rejects(runEdit({ config: fixtureConfig(), prompt: PROMPT, images, out, fetchImpl }), /distinct/);
  }
  assert.equal(calls.length, 0);
  assert.deepEqual((await readdir(directory)).sort(), ['style.png', 'target.png']);
});

test('edit validates count, local regular files, actual signature and readable dimensions', async (t) => {
  const { out, directory, targetPath } = await editFixture(t);
  const folder = path.join(directory, 'folder');
  const invalidPath = path.join(directory, 'fake.png');
  const truncatedPath = path.join(directory, 'truncated.png');
  const emptyPath = path.join(directory, 'empty.png');
  await mkdir(folder);
  await writeFile(invalidPath, '<html>not an image</html>');
  await writeFile(truncatedPath, PNG.subarray(0, 8));
  await writeFile(emptyPath, '');
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('invalid inputs must not fetch'); });
  for (const images of [[], Array.from({ length: 17 }, () => targetPath), [''], [path.join(directory, 'missing.png')], [folder], [invalidPath], [truncatedPath], [emptyPath]]) {
    await assert.rejects(runEdit({ config: fixtureConfig(), prompt: PROMPT, images, out, fetchImpl }));
  }
  assert.equal(calls.length, 0);
  assert.ok(!(await readdir(directory)).includes('preview.png'));
});

test('edit rejects a sparse oversized input before reading its contents or creating output', async (t) => {
  const { directory, out } = await temporaryFixture(t);
  const imagePath = path.join(directory, 'too-large.png');
  const handle = await open(imagePath, 'w');
  await handle.truncate(32 * 1024 * 1024 + 1);
  await handle.close();
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('invalid inputs must not fetch'); });
  await assert.rejects(runEdit({ config: fixtureConfig(), prompt: PROMPT, images: [imagePath], out, fetchImpl }), /32 MiB/);
  assert.equal(calls.length, 0);
  assert.deepEqual(await readdir(directory), ['too-large.png']);
});

test('edit rejects combined input size before sending a multipart request', async (t) => {
  const { directory, out } = await temporaryFixture(t);
  const images = [];
  for (let index = 0; index < 3; index++) {
    const imagePath = path.join(directory, `input-${index}.png`);
    const handle = await open(imagePath, 'w');
    await handle.write(pngWithDimensions(index + 1, 1));
    await handle.truncate(24 * 1024 * 1024);
    await handle.close();
    images.push(imagePath);
  }
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('oversized combined inputs must not fetch'); });
  await assert.rejects(runEdit({ config: fixtureConfig(), prompt: PROMPT, images, out, fetchImpl }), /64 MiB/);
  assert.equal(calls.length, 0);
  assert.deepEqual((await readdir(directory)).sort(), ['input-0.png', 'input-1.png', 'input-2.png']);
});

test('edit force cannot overwrite an input image or metadata destination that is an input', async (t) => {
  const { targetPath, stylePath, directory } = await editFixture(t);
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('overlap must not fetch'); });
  await assert.rejects(runEdit({ config: fixtureConfig(), prompt: PROMPT, images: [targetPath, stylePath], out: targetPath, force: true, fetchImpl }), /overlaps/);
  const metadataPath = path.join(directory, 'metadata.json');
  await writeFile(metadataPath, PNG);
  await assert.rejects(runEdit({ config: fixtureConfig(), prompt: PROMPT, images: [metadataPath], out: path.join(directory, 'metadata.png'), force: true, fetchImpl }), /overlaps/);
  assert.equal(calls.length, 0);
  assert.deepEqual(await readFile(targetPath), PNG);
  assert.deepEqual(await readFile(metadataPath), PNG);
});

test('edit rate-limit and transport failures redact credentials, clean locks and never retry', async (t) => {
  for (const failure of [() => jsonResponse({ error: { message: `Unauthorized ${FIXTURE_KEY}` } }, 429), () => { throw new Error(`Socket failed ${FIXTURE_KEY}`); }]) {
    const { out, targetPath, directory } = await editFixture(t);
    const { calls, fetchImpl } = mockFetch(failure);
    await assert.rejects(runEdit({ config: fixtureConfig(), prompt: PROMPT, images: [targetPath], out, fetchImpl }), (error) => {
      assert.ok(!String(error).includes(FIXTURE_KEY));
      assert.match(String(error), /Unauthorized|Socket failed/);
      return true;
    });
    assert.equal(calls.length, 1);
    assert.deepEqual((await readdir(directory)).sort(), ['style.png', 'target.png']);
  }
});

test('main edit dry-run keeps exact prompt and ordered inputs without decrypting a key', async (t) => {
  const { directory, out, targetPath, stylePath } = await editFixture(t);
  const promptPath = path.join(directory, 'prompt.txt');
  await writeFile(promptPath, `  ${PROMPT}\n`);
  let stdoutText = '';
  let stderrText = '';
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('dry-run must not fetch'); });
  const code = await main(['edit', '--prompt-file', promptPath, '--image', targetPath, '--image', stylePath, '--out', out, '--dry-run'], {
    env: { IMAGEGEN_ROUTER_CONFIG: path.join(directory, 'missing-router.json'), IMAGEGEN_ROUTER_BASE_URL: BASE_URL },
    stdout: { write: (value) => { stdoutText += value; } },
    stderr: { write: (value) => { stderrText += value; } },
    fetchImpl,
  });
  assert.equal(code, 0);
  assert.equal(stderrText, '');
  assert.equal(JSON.parse(stdoutText).request.prompt, `  ${PROMPT}\n`);
  assert.deepEqual(JSON.parse(stdoutText).inputImages.map((input) => input.path), [targetPath, stylePath]);
  assert.equal(calls.length, 0);
});

test('JPEG and WebP dimensions are read with bounded header checks', () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x20, 0x00, 0x30, 0x01, 0x01, 0x11, 0x00, 0xff, 0xd9]);
  assert.deepEqual(detectImageDimensions(jpeg), { width: 48, height: 32 });
  const webp = Buffer.alloc(30);
  webp.write('RIFF');
  webp.writeUInt32LE(22, 4);
  webp.write('WEBPVP8X', 8);
  webp.writeUInt32LE(10, 16);
  webp.writeUIntLE(47, 24, 3);
  webp.writeUIntLE(31, 27, 3);
  assert.deepEqual(detectImageDimensions(webp), { width: 48, height: 32 });
  assert.equal(detectImageDimensions(webp.subarray(0, 20)), null);
  assert.equal(detectImageDimensions(jpeg.subarray(0, 9)), null);
});

function responseEditBody(overrides = {}) {
  return { id: 'response-offline-fixture', status: 'completed', output: [{ id: 'image-call-fixture', type: 'image_generation_call', status: 'completed', result: PNG_BASE64 }], ...overrides };
}

test('edit-responses CLI requires an explicit text model and exactly one requested image', () => {
  assert.deepEqual(parseArgs(['edit-responses', '--response-model', 'gpt-6-astra', '--prompt', PROMPT, '--image', 'crop.png', '--image', 'style.webp', '--n', '1']), {
    command: 'edit-responses', responseModel: 'gpt-6-astra', prompt: PROMPT, images: ['crop.png', 'style.webp'], n: 1,
  });
  for (const args of [
    ['edit-responses', '--prompt', PROMPT, '--image', 'crop.png'],
    ['edit-responses', '--response-model', 'gpt-image-2', '--prompt', PROMPT, '--image', 'crop.png'],
    ['edit-responses', '--response-model', 'gpt-6-astra', '--prompt', PROMPT, '--image', 'crop.png', '--n', '2'],
    ['edit', '--response-model', 'gpt-6-astra', '--prompt', PROMPT, '--image', 'crop.png'],
    ['generate', '--response-model', 'gpt-6-astra', '--prompt', PROMPT],
  ]) assert.throws(() => parseArgs(args));
  assert.equal(parseArgs(['edit-responses', '--response-model', 'gpt-6-astra', '--responses-tool-mode', 'minimal', '--prompt', PROMPT, '--image', 'crop.png']).responsesToolMode, 'minimal');
  assert.throws(() => parseArgs(['edit-responses', '--response-model', 'gpt-6-astra', '--responses-tool-mode', 'unknown', '--prompt', PROMPT, '--image', 'crop.png']));
  assert.throws(() => parseArgs(['edit', '--responses-tool-mode', 'minimal', '--prompt', PROMPT, '--image', 'crop.png']));
});

test('edit-responses sends one explicit-model JSON POST with ordered input images and image tool edit action', async (t) => {
  const { out, targetPath, stylePath, style } = await editFixture(t);
  const { calls, fetchImpl } = mockFetch(() => jsonResponse(responseEditBody()));
  const result = await runEditResponses({ config: fixtureConfig(), responseModel: 'gpt-6-astra', prompt: PROMPT, images: [targetPath, stylePath], quality: 'high', size: '1536x1024', out, fetchImpl });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${BASE_URL}/responses`);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.redirect, 'error');
  assert.equal(requestHeaders(calls[0]).get('authorization'), `Bearer ${FIXTURE_KEY}`);
  assert.equal(requestHeaders(calls[0]).get('content-type'), 'application/json');
  const request = JSON.parse(calls[0].init.body);
  assert.equal(request.model, 'gpt-6-astra');
  assert.equal(request.stream, false);
  assert.deepEqual(request.tool_choice, { type: 'image_generation' });
  assert.deepEqual(request.tools, [{ type: 'image_generation', model: 'gpt-image-2', action: 'edit', size: '1536x1024', quality: 'high', output_format: 'png' }]);
  assert.deepEqual(request.input, [{ role: 'user', content: [
    { type: 'input_text', text: PROMPT },
    { type: 'input_image', image_url: `data:image/png;base64,${PNG_BASE64}` },
    { type: 'input_image', image_url: `data:image/png;base64,${style.toString('base64')}` },
  ] }]);
  assert.equal(request.tools[0].input_fidelity, undefined);
  assert.equal(request.n, undefined);
  assert.deepEqual(await readFile(result.files[0].path), PNG);
  const metadataText = await readFile(result.files[0].metadataPath, 'utf8');
  const metadata = JSON.parse(metadataText);
  assert.equal(result.responseModel, 'gpt-6-astra');
  assert.equal(result.imageModel, 'gpt-image-2');
  assert.equal(result.endpoint, `${BASE_URL}/responses`);
  assert.equal(metadata.operation, 'edit-responses');
  assert.equal(metadata.encoding, 'application/json');
  assert.equal(metadata.inputDataOmitted, true);
  assert.equal(metadata.requestParameters.model, 'gpt-6-astra');
  assert.equal(metadata.requestParameters.tools[0].model, 'gpt-image-2');
  assert.equal(metadata.image.source, 'image_generation_call.result');
  assert.equal(metadata.image.callId, 'image-call-fixture');
  assert.equal(metadata.registrationVerified, false);
  assert.equal(metadata.ownerApproved, false);
  assert.equal(metadata.artApproved, false);
  assert.equal(metadata.inputImages[0].sha256, createHash('sha256').update(PNG).digest('hex'));
  assert.ok(!metadataText.includes(PNG_BASE64));
  assert.ok(!metadataText.includes(style.toString('base64')));
  assert.ok(!metadataText.includes(FIXTURE_KEY));
  assert.ok(!JSON.stringify(result).includes(PNG_BASE64));
});

test('edit-responses dry-run omits pixels, performs no key access or request and keeps input provenance', async (t) => {
  const { out, targetPath, stylePath, directory } = await editFixture(t);
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('dry-run must not fetch'); });
  const result = await runEditResponses({ config: fixtureConfig({ apiKey: undefined }), responseModel: 'gpt-6-astra', prompt: PROMPT, images: [targetPath, stylePath], out, dryRun: true, fetchImpl });
  assert.equal(calls.length, 0);
  assert.equal(result.endpoint, `${BASE_URL}/responses`);
  assert.equal(result.request.model, 'gpt-6-astra');
  assert.equal(result.request.tools[0].model, 'gpt-image-2');
  assert.match(result.request.input[0].content[1].image_url, /IMAGE DATA OMITTED/);
  assert.ok(!JSON.stringify(result).includes(PNG_BASE64));
  assert.ok(!JSON.stringify(result).includes(FIXTURE_KEY));
  assert.equal(result.inputImages[0].sha256, createHash('sha256').update(PNG).digest('hex'));
  assert.deepEqual(result.inputImages.map((input) => input.dimensions), [{ width: 1, height: 1 }, { width: 2, height: 3 }]);
  assert.deepEqual((await readdir(directory)).sort(), ['style.png', 'target.png']);
});

test('edit-responses validates text/image model separation, count and input before network', async (t) => {
  const { out, targetPath, directory } = await editFixture(t);
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('invalid options must not fetch'); });
  for (const overrides of [
    { responseModel: undefined }, { responseModel: 'gpt-image-2' }, { responseModel: 'model\ninvalid' },
    { config: fixtureConfig({ model: 'gpt-image-1.5' }) }, { n: 2 }, { images: [] },
    { images: [targetPath, targetPath] }, { out: targetPath, force: true },
  ]) await assert.rejects(runEditResponses({ config: fixtureConfig(), responseModel: 'gpt-6-astra', prompt: PROMPT, images: [targetPath], out, fetchImpl, ...overrides }));
  assert.equal(calls.length, 0);
  assert.deepEqual((await readdir(directory)).sort(), ['style.png', 'target.png']);
});

test('edit-responses ignores text output and saves a completed image_generation_call only', async (t) => {
  const { out, targetPath } = await editFixture(t);
  const { calls, fetchImpl } = mockFetch(() => jsonResponse(responseEditBody({ output: [
    { type: 'message', status: 'completed', content: [{ type: 'output_text', text: 'Do not treat this text as a file or image.' }] },
    ...responseEditBody().output,
  ] })));
  const result = await runEditResponses({ config: fixtureConfig(), responseModel: 'gpt-6-astra', prompt: PROMPT, images: [targetPath], out, fetchImpl });
  assert.equal(calls.length, 1);
  assert.equal(result.files.length, 1);
  assert.deepEqual(await readFile(result.files[0].path), PNG);
});

test('edit-responses rejects missing, unfinished, excess and invalid image call output without saving files or fallback', async (t) => {
  const invalidResponses = [
    {}, responseEditBody({ status: 'incomplete' }), responseEditBody({ status: 'in_progress' }), responseEditBody({ output: [] }),
    responseEditBody({ output: [{ type: 'message', content: [{ type: 'output_text', text: PNG_BASE64 }] }] }),
    responseEditBody({ output: [{ type: 'image_generation_call', status: 'in_progress', result: PNG_BASE64 }] }),
    responseEditBody({ output: [{ type: 'image_generation_call', status: 'completed', result: '' }] }),
    responseEditBody({ output: [{ type: 'image_generation_call', status: 'completed', result: 'not-base64!' }] }),
    responseEditBody({ output: [{ type: 'image_generation_call', status: 'completed', result: Buffer.from('not an image').toString('base64') }] }),
    responseEditBody({ output: [...responseEditBody().output, ...responseEditBody().output] }),
  ];
  for (const body of invalidResponses) {
    const { out, targetPath, directory } = await editFixture(t);
    const { calls, fetchImpl } = mockFetch(() => jsonResponse(body));
    await assert.rejects(runEditResponses({ config: fixtureConfig(), responseModel: 'gpt-6-astra', prompt: PROMPT, images: [targetPath], out, fetchImpl }));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${BASE_URL}/responses`);
    assert.deepEqual((await readdir(directory)).sort(), ['style.png', 'target.png']);
  }
});

test('edit-responses HTTP and transport failures redact key and data URLs without retry', async (t) => {
  for (const failure of [
    () => jsonResponse({ error: { message: `Denied ${FIXTURE_KEY} data:image/png;base64,${PNG_BASE64}` } }, 429),
    () => { throw new Error(`Socket failed ${FIXTURE_KEY} data:image/png;base64,${PNG_BASE64}`); },
  ]) {
    const { out, targetPath, directory } = await editFixture(t);
    const { calls, fetchImpl } = mockFetch(failure);
    await assert.rejects(runEditResponses({ config: fixtureConfig(), responseModel: 'gpt-6-astra', prompt: PROMPT, images: [targetPath], out, fetchImpl }), (error) => {
      assert.ok(!String(error).includes(FIXTURE_KEY));
      assert.ok(!String(error).includes(PNG_BASE64));
      assert.match(String(error), /REDACTED/);
      return true;
    });
    assert.equal(calls.length, 1);
    assert.deepEqual((await readdir(directory)).sort(), ['style.png', 'target.png']);
  }
});

test('edit-responses deadline aborts exactly one possibly billable request', async (t) => {
  const { out, targetPath, directory } = await editFixture(t);
  const { calls, fetchImpl } = mockFetch((call) => new Promise((resolve, reject) => {
    call.init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }));
  await assert.rejects(runEditResponses({ config: fixtureConfig(), responseModel: 'gpt-6-astra', prompt: PROMPT, images: [targetPath], out, timeoutMs: 10, fetchImpl }), /timed out/);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.signal.aborted, true);
  assert.deepEqual((await readdir(directory)).sort(), ['style.png', 'target.png']);
});

test('main edit-responses dry-run preserves exact prompt and uses its distinct transport', async (t) => {
  const { directory, out, targetPath, stylePath } = await editFixture(t);
  const promptPath = path.join(directory, 'prompt.txt');
  await writeFile(promptPath, `  ${PROMPT}\n`);
  let stdoutText = '';
  let stderrText = '';
  const { calls, fetchImpl } = mockFetch(() => { throw new Error('dry-run must not fetch'); });
  const code = await main(['edit-responses', '--response-model', 'gpt-6-astra', '--prompt-file', promptPath, '--image', targetPath, '--image', stylePath, '--out', out, '--dry-run'], {
    env: { IMAGEGEN_ROUTER_CONFIG: path.join(directory, 'missing-router.json'), IMAGEGEN_ROUTER_BASE_URL: BASE_URL },
    stdout: { write: (value) => { stdoutText += value; } }, stderr: { write: (value) => { stderrText += value; } }, fetchImpl,
  });
  assert.equal(code, 0);
  assert.equal(stderrText, '');
  const result = JSON.parse(stdoutText);
  assert.equal(result.request.input[0].content[0].text, `  ${PROMPT}\n`);
  assert.equal(result.endpoint, `${BASE_URL}/responses`);
  assert.equal(result.responseModel, 'gpt-6-astra');
  assert.deepEqual(result.inputImages.map((input) => input.path), [targetPath, stylePath]);
  assert.ok(!stdoutText.includes(PNG_BASE64));
  assert.equal(calls.length, 0);
});

test('Responses minimal mode explicitly omits optional tool fields while preserving models and image inputs', async (t) => {
  const { out, targetPath, stylePath } = await editFixture(t);
  const { calls, fetchImpl } = mockFetch(() => jsonResponse(responseEditBody()));
  const result = await runEditResponses({ config: fixtureConfig(), responseModel: 'gpt-6-astra', responsesToolMode: 'minimal', prompt: PROMPT, images: [targetPath, stylePath], size: '1232x1232', quality: 'high', out, fetchImpl });
  assert.equal(calls.length, 1);
  const request = JSON.parse(calls[0].init.body);
  assert.equal(calls[0].url, `${BASE_URL}/responses`);
  assert.equal(request.model, 'gpt-6-astra');
  assert.deepEqual(request.tools, [{ type: 'image_generation', model: 'gpt-image-2' }]);
  assert.deepEqual(request.tool_choice, { type: 'image_generation' });
  assert.equal(request.input[0].content.length, 3);
  assert.equal(request.input[0].content[0].text, PROMPT);
  assert.equal(request.input[0].content[1].image_url, `data:image/png;base64,${PNG_BASE64}`);
  assert.equal(request.stream, false);
  assert.equal(result.responsesToolMode, 'minimal');
  assert.deepEqual(result.imageOptions.omitted, ['size', 'quality', 'output_format', 'action']);
  assert.deepEqual(result.imageOptions.transmitted, {});
  assert.deepEqual(result.imageOptions.intended, { size: '1232x1232', quality: 'high', output_format: 'png', action: 'edit' });
  assert.equal(result.files[0].sizeMatchesRequest, null);
  assert.equal(result.files[0].sizeMatchesIntent, false);
  assert.match(result.warnings[0], /intentionally omitted/);
  const metadata = JSON.parse(await readFile(result.files[0].metadataPath, 'utf8'));
  assert.deepEqual(metadata.requestParameters.tools, request.tools);
  assert.deepEqual(metadata.imageOptions.transmitted, {});
  assert.equal(metadata.verification.sizeMatchesRequest, null);
  assert.equal(metadata.verification.sizeMatchesIntent, false);
  assert.equal(metadata.registrationVerified, false);
  const { out: dryOut, targetPath: dryInput } = await editFixture(t);
  const dryResult = await runEditResponses({ config: fixtureConfig({ apiKey: undefined }), responseModel: 'gpt-6-astra', responsesToolMode: 'minimal', prompt: PROMPT, images: [dryInput], out: dryOut, dryRun: true, fetchImpl: async () => { throw new Error('dryrun must stay offline'); } });
  assert.deepEqual(dryResult.request.tools, [{ type: 'image_generation', model: 'gpt-image-2' }]);
  assert.ok(!JSON.stringify(dryResult).includes(PNG_BASE64));
});

test('completed Responses may omit image-call status only when a valid result is present and provenance records the limitation', async (t) => {
  const { out, targetPath } = await editFixture(t);
  const { calls, fetchImpl } = mockFetch(() => jsonResponse(responseEditBody({ output: [{ type: 'image_generation_call', result: PNG_BASE64 }] })));
  const result = await runEditResponses({ config: fixtureConfig(), responseModel: 'gpt-6-astra', responsesToolMode: 'minimal', prompt: PROMPT, images: [targetPath], out, fetchImpl });
  assert.equal(calls.length, 1);
  const metadata = JSON.parse(await readFile(result.files[0].metadataPath, 'utf8'));
  assert.deepEqual(metadata.image.callCompletion, { responseStatus: 'completed', imageCallStatus: null, verifiedBy: 'completed-response-and-valid-result' });
  const { out: failedOut, targetPath: failedInput, directory } = await editFixture(t);
  const failureTransport = mockFetch(() => jsonResponse(responseEditBody({ output: [{ type: 'image_generation_call', status: 'failed', result: PNG_BASE64 }] })));
  await assert.rejects(runEditResponses({ config: fixtureConfig(), responseModel: 'gpt-6-astra', responsesToolMode: 'minimal', prompt: PROMPT, images: [failedInput], out: failedOut, fetchImpl: failureTransport.fetchImpl }));
  assert.equal(failureTransport.calls.length, 1);
  assert.deepEqual((await readdir(directory)).sort(), ['style.png', 'target.png']);
});
