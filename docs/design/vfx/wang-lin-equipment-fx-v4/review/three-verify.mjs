import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const reviewRoot = dirname(fileURLToPath(import.meta.url));
const packRoot = resolve(reviewRoot, '..');
const workspace = resolve(packRoot, '../../../..');
const partial = process.argv.includes('--partial');
const origin = 'http://127.0.0.1:5173';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const fsURL = path => '/@fs/' + path.replaceAll('\\', '/');
const manifestBytes = await readFile(resolve(packRoot, 'manifest.json'));
const manifest = JSON.parse(manifestBytes);
const manifestSha256 = createHash('sha256').update(manifestBytes).digest('hex');
const expectedFrames = partial ? manifest.coverage.canonicalFrames : 72;
assert.deepEqual(manifest.frameSize, [384, 320]);
assert.deepEqual(manifest.pivot, [176, 288]);
if (!partial) {
  assert.deepEqual(manifest.pending, []);
  assert.equal(Object.keys(manifest.clips).length, 12);
  assert.equal(manifest.coverage.canonicalFrames, expectedFrames);
}

let browser;
try {
  browser = await chromium.launch({ executablePath: chrome, headless: true,
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 512, height: 448 }, deviceScaleFactor: 1 });
  const pageErrors = [], consoleErrors = [], failedRequests = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  await page.route('**/equipment-fx-three-probe.html', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><html><body style="margin:0"></body></html>'
  }));
  await page.goto(origin + '/equipment-fx-three-probe.html');
  const result = await page.evaluate(async ({ manifest, packURL, threeURL }) => {
    const THREE = await import(threeURL);
    const { atlasSprite, setSpriteFrame } = await import('/src/render/sprite-frame.ts');
    const width = 512, height = 448;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-176, width - 176, 288, 288 - height, 0.1, 10);
    camera.position.set(0, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    document.body.append(renderer.domElement);
    const material = new THREE.SpriteMaterial({ transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
    const sprite = atlasSprite(material);
    scene.add(sprite);
    const reference = document.createElement('canvas'), gpu = document.createElement('canvas');
    reference.width = gpu.width = width;
    reference.height = gpu.height = height;
    const referenceContext = reference.getContext('2d', { willReadFrequently: true });
    const gpuContext = gpu.getContext('2d', { willReadFrequently: true });
    referenceContext.imageSmoothingEnabled = gpuContext.imageSmoothingEnabled = false;
    const loadImage = async url => {
      const image = new Image(); image.src = url;
      await image.decode(); return image;
    };
    const loadTexture = async clip => {
      const image = await loadImage(packURL + clip.atlas);
      const texture = new THREE.Texture(image);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = texture.minFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
      return texture;
    };
    const compare = (expected, actual) => {
      let union = 0, alphaError = 0, alphaMax = 0, core = 0, coreMatched = 0;
      let opaque = 0, colorError = 0, soft = 0, softError = 0, unexpectedAlpha = 0;
      let expectedAlphaSum = 0, actualAlphaSum = 0, expectedX = 0, expectedY = 0, actualX = 0, actualY = 0;
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4, ea = expected[offset + 3], aa = actual[offset + 3];
        const error = Math.abs(ea - aa);
        if (ea > 2 || aa > 2) { union++; alphaError += error; alphaMax = Math.max(alphaMax, error); }
        if (ea >= 64) { core++; if (error <= 3) coreMatched++; }
        if (ea >= 250) { opaque++; for (let channel = 0; channel < 3; channel++) colorError += Math.abs(expected[offset + channel] - actual[offset + channel]) / 3; }
        if (ea >= 4 && ea < 250) { soft++; softError += error; }
        if (ea === 0 && aa > 2) unexpectedAlpha++;
        expectedAlphaSum += ea; actualAlphaSum += aa;
        expectedX += x * ea; expectedY += y * ea; actualX += x * aa; actualY += y * aa;
      }
      return { unionPixels: union, alphaMean: union ? alphaError / union : null, alphaMax,
        corePixels: core, coreMatch: core ? coreMatched / core : null,
        opaquePixels: opaque, opaqueColorMean: opaque ? colorError / opaque : null,
        softAlphaPixels: soft, softAlphaMean: soft ? softError / soft : null, unexpectedAlphaPixels: unexpectedAlpha,
        alphaCentroidError: expectedAlphaSum && actualAlphaSum
          ? Math.hypot(expectedX / expectedAlphaSum - actualX / actualAlphaSum, expectedY / expectedAlphaSum - actualY / actualAlphaSum) : null };
    };
    const checks = [], textureSwaps = [];
    let previousTexture = null, previousClip = null, previousDecodedBytes = 0;
    let maxResidentTextures = 0, maxResidentDecodedBytes = 0, textureDisposals = 0;
    let geometryDisposed = false, materialDisposed = false;
    sprite.geometry.addEventListener('dispose', () => { geometryDisposed = true; });
    material.addEventListener('dispose', () => { materialDisposed = true; });
    for (const clip of Object.values(manifest.clips)) {
      const texture = await loadTexture(clip);
      texture.addEventListener('dispose', () => textureDisposals++);
      material.map = texture; material.needsUpdate = true;
      const swap = { from: previousClip, to: clip.id, sameSprite: true, sameMaterial: true };
      for (let index = 0; index < clip.frames.length; index++) {
        const frame = clip.frames[index], canonical = await loadImage(packURL + frame.file);
        for (const placement of [[0, 0], [31, -25]]) {
          sprite.position.set(placement[0], placement[1], 0);
          setSpriteFrame(sprite, frame.rect, clip.atlasSize, clip.frameSize, clip.pivot);
          renderer.render(scene, camera);
          maxResidentTextures = Math.max(maxResidentTextures, renderer.info.memory.textures);
          maxResidentDecodedBytes = Math.max(maxResidentDecodedBytes, clip.decodedBytes + previousDecodedBytes);
          if (previousTexture) { previousTexture.dispose(); previousTexture = null; previousDecodedBytes = 0; }
          gpuContext.clearRect(0, 0, width, height);
          gpuContext.drawImage(renderer.domElement, 0, 0);
          referenceContext.clearRect(0, 0, width, height);
          // World origin is screen(176,288), exactly the declared world-foot pivot.
          referenceContext.drawImage(canonical, placement[0], -placement[1]);
          const metrics = compare(referenceContext.getImageData(0, 0, width, height).data,
            gpuContext.getImageData(0, 0, width, height).data);
          checks.push({ clip: clip.id, frame: index + 1, canonical: frame.file, placement, pivot: clip.pivot,
            uvRect: frame.rect, ...metrics });
        }
      }
      swap.pixelChecks = clip.frames.length * 2;
      textureSwaps.push(swap);
      previousTexture = texture; previousClip = clip.id; previousDecodedBytes = clip.decodedBytes;
    }
    const gl = renderer.getContext(), debug = gl.getExtension('WEBGL_debug_renderer_info');
    const gpuName = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : null;
    const memoryBeforeTeardown = { ...renderer.info.memory };
    scene.remove(sprite);
    material.map = null;
    previousTexture?.dispose(); previousTexture = null;
    sprite.geometry.dispose(); material.dispose();
    renderer.render(scene, camera);
    const memoryAfterTeardown = { ...renderer.info.memory };
    const blank = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, blank);
    let blankAlphaPixels = 0;
    for (let offset = 3; offset < blank.length; offset += 4) if (blank[offset]) blankAlphaPixels++;
    renderer.dispose(); renderer.forceContextLoss();
    await new Promise(resolve => setTimeout(resolve, 50));
    const teardown = { sceneChildren: scene.children.length, textureDisposals, geometryDisposed, materialDisposed,
      memoryBeforeTeardown, memoryAfterTeardown, blankAlphaPixels, contextLost: gl.isContextLost() };
    renderer.domElement.remove();
    return { threeRevision: THREE.REVISION, gpuName, frameRenders: checks.length, checks, textureSwaps,
      maxResidentTextures, maxResidentDecodedBytes,
      teardown };
  }, { manifest, packURL: fsURL(packRoot) + '/', threeURL: fsURL(resolve(workspace, 'node_modules/three/build/three.module.js')) });

  assert.deepEqual(pageErrors, []); assert.deepEqual(consoleErrors, []); assert.deepEqual(failedRequests, []);
  assert.equal(result.frameRenders, expectedFrames * 2);
  for (const check of result.checks) {
    assert.ok(check.corePixels > 0, JSON.stringify(check));
    assert.ok(check.alphaMean <= 1, JSON.stringify(check));
    assert.ok(check.alphaMax <= 3, JSON.stringify(check));
    assert.ok(check.coreMatch >= 0.999, JSON.stringify(check));
    assert.equal(check.unexpectedAlphaPixels, 0, JSON.stringify(check));
    assert.ok(check.alphaCentroidError <= 0.03, JSON.stringify(check));
    if (check.softAlphaMean !== null) assert.ok(check.softAlphaMean <= 1, JSON.stringify(check));
    if (check.opaqueColorMean !== null) assert.ok(check.opaqueColorMean <= 2, JSON.stringify(check));
  }
  assert.equal(result.textureSwaps.length, Object.keys(manifest.clips).length);
  const crossAtlasTextureSwaps = result.textureSwaps.filter(swap => swap.from !== null).length;
  assert.equal(crossAtlasTextureSwaps, Object.keys(manifest.clips).length - 1);
  assert.ok(result.maxResidentTextures <= 2);
  assert.ok(result.maxResidentDecodedBytes <= manifest.decodedCacheBudgetBytes);
  assert.equal(result.teardown.textureDisposals, Object.keys(manifest.clips).length);
  assert.equal(result.teardown.geometryDisposed, true); assert.equal(result.teardown.materialDisposed, true);
  assert.equal(result.teardown.memoryAfterTeardown.textures, 0);
  assert.equal(result.teardown.memoryAfterTeardown.geometries, 0);
  assert.equal(result.teardown.sceneChildren, 0); assert.equal(result.teardown.blankAlphaPixels, 0);
  assert.equal(result.teardown.contextLost, true);
  const report = { date: '2026-10-13', status: partial ? 'partial' : 'passed', passed: !partial,
    browser: chrome, origin, manifestSha256,
    coverage: { sequences: Object.keys(manifest.clips).length, canonicalFrames: expectedFrames, nativeRenders: result.frameRenders,
      placements: [[0, 0], [31, -25]], pending: manifest.pending },
    thresholds: { alphaMeanMax: 1, alphaMax: 3, coreAlphaMinimum: 64, coreMatchMinimum: 0.999,
      opaqueAlphaMinimum: 250, opaqueColorMeanMax: 2, softAlphaRange: [4, 249], softAlphaMeanMax: 1,
      transparentUnexpectedAlphaAbove: 2, transparentUnexpectedAlphaPixels: 0, alphaCentroidErrorMaxPixels: 0.03 },
    observed: { alphaMeanMax: Math.max(...result.checks.map(check => check.alphaMean)),
      alphaMax: Math.max(...result.checks.map(check => check.alphaMax)),
      coreMatchMinimum: Math.min(...result.checks.map(check => check.coreMatch)),
      opaqueColorMeanMax: Math.max(0, ...result.checks.map(check => check.opaqueColorMean ?? 0)),
      softAlphaMeanMax: Math.max(0, ...result.checks.map(check => check.softAlphaMean ?? 0)),
      alphaCentroidErrorMaxPixels: Math.max(...result.checks.map(check => check.alphaCentroidError)) },
    errors: { pageErrors, consoleErrors, failedRequests }, ...result, crossAtlasTextureSwaps,
    scope: 'Actual installed Three.js and project atlasSprite/setSpriteFrame render every canonical FX frame from its atlas at native 1x in headless Chrome SwiftShader. PNG alpha/color parity, fixed world-foot pivot, UV rectangles, translated position, cross-atlas texture swaps and resource teardown are tested. This fixture does not test game integration, body anatomy, animation appeal, scene occlusion, mobile/device performance or MMO load.',
    ownerApproved: false, artApproved: false, runtimeIntegrated: false };
  await writeFile(resolve(reviewRoot, 'three-verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, coverage: report.coverage, observed: report.observed,
    maxResidentTextures: report.maxResidentTextures, teardown: report.teardown, gpuName: report.gpuName }));
} finally {
  await browser?.close();
}
