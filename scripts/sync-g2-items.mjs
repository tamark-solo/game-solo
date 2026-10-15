import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sharp } from "./actor-sprite-tools.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "client/public/assets/g2-items");

/**
 * Find the non-transparent bounding box of an image buffer.
 */
async function getAlphaBounds(inputBuffer, threshold = 16) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const a = data[(y * info.width + x) * 4 + 3];
      if (a >= threshold) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) {
    return { left: 0, top: 0, width: info.width, height: info.height, fullWidth: info.width, fullHeight: info.height };
  }
  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    fullWidth: info.width,
    fullHeight: info.height,
  };
}

/**
 * Create a 96x96 Xianxia medallion backdrop SVG.
 */
function medallionBackdropSvg({
  bgInner = "#16383e",
  bgOuter = "#081317",
  ringColor = "#c8ad77",
  glowColor = "#58d6c9",
  emblemSvg = "",
}) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <radialGradient id="bg" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stop-color="${bgInner}" />
          <stop offset="72%" stop-color="${bgOuter}" />
          <stop offset="100%" stop-color="#04090c" />
        </radialGradient>
        <radialGradient id="aura" cx="50%" cy="48%" r="44%">
          <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.42" />
          <stop offset="65%" stop-color="${glowColor}" stop-opacity="0.12" />
          <stop offset="100%" stop-color="${glowColor}" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f2dfa8" />
          <stop offset="50%" stop-color="${ringColor}" />
          <stop offset="100%" stop-color="#6e562f" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="92" height="92" rx="16" fill="url(#bg)" stroke="url(#rim)" stroke-width="2.5" />
      <rect x="6" y="6" width="84" height="84" rx="12" fill="none" stroke="${ringColor}" stroke-opacity="0.28" stroke-width="1" />
      <circle cx="48" cy="48" r="36" fill="url(#aura)" />
      <circle cx="48" cy="48" r="34" fill="none" stroke="${glowColor}" stroke-opacity="0.22" stroke-width="1" stroke-dasharray="4 3" />
      <path d="M10 18 L18 10 M78 10 L86 18 M10 78 L18 86 M78 86 L86 78" stroke="${ringColor}" stroke-opacity="0.55" stroke-width="1.5" stroke-linecap="round" />
      ${emblemSvg}
    </svg>`
  );
}

/**
 * Crop upper-body bust from a character sprite and scale with nearest-neighbor to fit 96x96 medallion.
 */
async function renderPortraitIcon(sourceBuffer, options = {}) {
  const {
    cropRegion = null,
    bustRatio = 0.62,
    targetSize = 76,
    bgInner = "#16383e",
    bgOuter = "#071216",
    ringColor = "#c8ad77",
    glowColor = "#58d6c9",
    emblemSvg = "",
  } = options;

  let working = sourceBuffer;
  if (cropRegion) {
    working = await sharp(sourceBuffer).extract(cropRegion).png().toBuffer();
  }
  const bounds = await getAlphaBounds(working, 20);
  const bustHeight = Math.max(16, Math.round(bounds.height * bustRatio));
  const extractWidth = bounds.width;
  const extractHeight = Math.min(bounds.fullHeight - bounds.top, bustHeight);

  const cropped = await sharp(working)
    .extract({
      left: bounds.left,
      top: bounds.top,
      width: extractWidth,
      height: extractHeight,
    })
    .png()
    .toBuffer();

  const scale = Math.min(targetSize / extractWidth, targetSize / extractHeight);
  const w = Math.max(1, Math.round(extractWidth * scale));
  const h = Math.max(1, Math.round(extractHeight * scale));

  const resized = await sharp(cropped)
    .resize(w, h, { kernel: "nearest" })
    .png()
    .toBuffer();

  const backdrop = medallionBackdropSvg({ bgInner, bgOuter, ringColor, glowColor, emblemSvg });
  const left = Math.round((96 - w) / 2);
  const top = Math.min(92 - h, Math.max(6, Math.round((96 - h) / 2) + 4));

  return sharp(backdrop)
    .composite([
      { input: resized, left, top },
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
            <rect x="2" y="2" width="92" height="92" rx="16" fill="none" stroke="${ringColor}" stroke-width="2.5" stroke-opacity="0.85"/>
          </svg>`
        ),
        left: 0,
        top: 0,
      },
    ])
    .png()
    .toBuffer();
}

/**
 * Crop full object/item sprite and composite over medallion backdrop.
 */
async function renderObjectIcon(sourceBuffer, options = {}) {
  const {
    targetSize = 68,
    kernel = "nearest",
    bgInner = "#16383e",
    bgOuter = "#071216",
    ringColor = "#c8ad77",
    glowColor = "#58d6c9",
    emblemSvg = "",
    overlaySvg = "",
    tint = null,
  } = options;

  const bounds = await getAlphaBounds(sourceBuffer, 16);
  let cropped = sharp(sourceBuffer).extract({
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
  });
  if (tint) {
    cropped = cropped.tint(tint);
  }
  const croppedBuf = await cropped.png().toBuffer();

  const scale = Math.min(targetSize / bounds.width, targetSize / bounds.height);
  const w = Math.max(1, Math.round(bounds.width * scale));
  const h = Math.max(1, Math.round(bounds.height * scale));

  const resized = await sharp(croppedBuf)
    .resize(w, h, { kernel })
    .png()
    .toBuffer();

  const backdrop = medallionBackdropSvg({ bgInner, bgOuter, ringColor, glowColor, emblemSvg });
  const layers = [
    {
      input: resized,
      left: Math.round((96 - w) / 2),
      top: Math.round((96 - h) / 2),
    },
  ];
  if (overlaySvg) {
    layers.push({ input: Buffer.from(overlaySvg), left: 0, top: 0 });
  }
  return sharp(backdrop).composite(layers).png().toBuffer();
}

/**
 * Crop a rectangular region from a concept board, mask it inside a rounded medallion with vignette, and composite a rim.
 */
async function renderFramedCropIcon(sourceBuffer, cropRegion, options = {}) {
  const {
    ringColor = "#c8ad77",
    glowColor = "#58d6c9",
  } = options;

  const extracted = await sharp(sourceBuffer)
    .extract(cropRegion)
    .resize(88, 88, { kernel: "lanczos3" })
    .png()
    .toBuffer();

  const maskSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88">
      <rect x="0" y="0" width="88" height="88" rx="14" fill="#ffffff"/>
    </svg>`
  );

  const masked = await sharp(extracted)
    .composite([{ input: maskSvg, blend: "dest-in" }])
    .png()
    .toBuffer();

  const frameSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <radialGradient id="vignette" cx="50%" cy="50%" r="52%">
          <stop offset="58%" stop-color="#000000" stop-opacity="0" />
          <stop offset="100%" stop-color="#050b0e" stop-opacity="0.72" />
        </radialGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f5e3b0" />
          <stop offset="50%" stop-color="${ringColor}" />
          <stop offset="100%" stop-color="#5e4724" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="88" height="88" rx="14" fill="url(#vignette)" />
      <rect x="2" y="2" width="92" height="92" rx="16" fill="none" stroke="url(#rim)" stroke-width="2.5" />
      <rect x="6" y="6" width="84" height="84" rx="12" fill="none" stroke="${glowColor}" stroke-opacity="0.38" stroke-width="1" />
      <path d="M10 18 L18 10 M78 10 L86 18 M10 78 L18 86 M78 86 L86 78" stroke="${ringColor}" stroke-opacity="0.65" stroke-width="1.5" stroke-linecap="round" />
    </svg>`
  );

  return sharp({
    create: {
      width: 96,
      height: 96,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: masked, left: 4, top: 4 },
      { input: frameSvg, left: 0, top: 0 },
    ])
    .png()
    .toBuffer();
}

await mkdir(outDir, { recursive: true });

// 1. Four Iconic Artifacts (Thiên Nghịch Châu, Kiếm Linh, Hồn Phiên, Xạ Thần Xa)
const v5SourcesDir = resolve(root, "docs/design/characters/wang-lin-concept-direction-v5/sources");

const beadProgBuf = await readFile(resolve(v5SourcesDir, "bead-progression.png"));
const swordProgBuf = await readFile(resolve(v5SourcesDir, "sword-progression.png"));
const bannerProgBuf = await readFile(resolve(v5SourcesDir, "banner-progression.png"));
const chariotProgBuf = await readFile(resolve(v5SourcesDir, "chariot-progression.png"));

await writeFile(
  resolve(outDir, "bead.png"),
  await renderFramedCropIcon(
    beadProgBuf,
    { left: 850, top: 755, width: 176, height: 176 },
    { ringColor: "#9ee8e4", glowColor: "#6bf2eb" }
  )
);

await writeFile(
  resolve(outDir, "sword.png"),
  await renderFramedCropIcon(
    swordProgBuf,
    { left: 462, top: 730, width: 245, height: 245 },
    { ringColor: "#e2c88c", glowColor: "#6be8d4" }
  )
);

await writeFile(
  resolve(outDir, "banner.png"),
  await renderFramedCropIcon(
    bannerProgBuf,
    { left: 442, top: 718, width: 252, height: 252 },
    { ringColor: "#d49cf0", glowColor: "#c468ff" }
  )
);

await writeFile(
  resolve(outDir, "chariot.png"),
  await renderFramedCropIcon(
    chariotProgBuf,
    { left: 666, top: 702, width: 295, height: 280 },
    { ringColor: "#ebb86a", glowColor: "#ff9d42" }
  )
);

// 2. Cultivation & Progression Items
const charUiDir = resolve(root, "client/public/assets/character-ui-v2");
const gameplayDir = resolve(root, "client/public/assets/van-ngoc-gameplay-v1");

await writeFile(
  resolve(outDir, "tu-vi-orb.png"),
  await renderObjectIcon(await readFile(resolve(charUiDir, "cloud-pearl.webp")), {
    targetSize: 64,
    kernel: "lanczos3",
    bgInner: "#144246",
    bgOuter: "#071619",
    ringColor: "#84e8d8",
    glowColor: "#4ce6cd",
    emblemSvg: `<circle cx="48" cy="48" r="30" fill="none" stroke="#7af5e1" stroke-opacity="0.4" stroke-width="1.5"/>`,
  })
);

await writeFile(
  resolve(outDir, "soul-orb.png"),
  await renderObjectIcon(await readFile(resolve(charUiDir, "cloud-pearl.webp")), {
    targetSize: 62,
    kernel: "lanczos3",
    tint: { r: 196, g: 120, b: 255 },
    bgInner: "#321642",
    bgOuter: "#0e0617",
    ringColor: "#c88ef0",
    glowColor: "#ba68ff",
    emblemSvg: `<path d="M48 14 C64 28 68 58 48 82 C28 58 32 28 48 14 Z" fill="none" stroke="#df9eff" stroke-opacity="0.45" stroke-width="1.5"/>`,
  })
);

await writeFile(
  resolve(outDir, "truc-co-dai.png"),
  await renderObjectIcon(await readFile(resolve(gameplayDir, "vh-stable-jade-64.png")), {
    targetSize: 64,
    bgInner: "#173c3a",
    bgOuter: "#081718",
    ringColor: "#dfc282",
    glowColor: "#5ee2c8",
    emblemSvg: `<polygon points="48,12 74,24 84,48 74,72 48,84 22,72 12,48 22,24" fill="none" stroke="#f0d38c" stroke-opacity="0.48" stroke-width="1.8"/>`,
  })
);

await writeFile(
  resolve(outDir, "kim-dan.png"),
  await renderObjectIcon(await readFile(resolve(charUiDir, "lotus-pill.webp")), {
    targetSize: 66,
    kernel: "lanczos3",
    bgInner: "#4a2e10",
    bgOuter: "#170d04",
    ringColor: "#ffd470",
    glowColor: "#ffb838",
    emblemSvg: `<circle cx="48" cy="48" r="31" fill="none" stroke="#ffe082" stroke-opacity="0.55" stroke-width="2"/>
      <path d="M48 10 L52 22 L48 18 L44 22 Z M48 86 L52 74 L48 78 L44 74 Z M10 48 L22 52 L18 48 L22 44 Z M86 48 L74 52 L78 48 L74 44 Z" fill="#ffd978" fill-opacity="0.65"/>`,
  })
);

await writeFile(
  resolve(outDir, "ngung-khi-quyet.png"),
  await renderObjectIcon(await readFile(resolve(charUiDir, "manual.webp")), {
    targetSize: 66,
    kernel: "lanczos3",
    bgInner: "#163547",
    bgOuter: "#07121a",
    ringColor: "#9ad6f5",
    glowColor: "#5bc0f8",
  })
);

await writeFile(
  resolve(outDir, "hai-do-tu-ma.png"),
  await renderObjectIcon(await readFile(resolve(gameplayDir, "vh-flow-compass-64.png")), {
    targetSize: 66,
    bgInner: "#1b3348",
    bgOuter: "#07111a",
    ringColor: "#e3c588",
    glowColor: "#63d2ff",
    emblemSvg: `<circle cx="48" cy="48" r="32" fill="none" stroke="#e8ca8a" stroke-opacity="0.4" stroke-width="1.2" stroke-dasharray="2 3"/>`,
  })
);

// 3. Three Stances (Kiếm Sát, Ngự Hồn, Trấn Nhạc)
await writeFile(
  resolve(outDir, "stance-kiem-sat.png"),
  await renderObjectIcon(await readFile(resolve(charUiDir, "jade-sword.webp")), {
    targetSize: 68,
    kernel: "lanczos3",
    bgInner: "#3b1722",
    bgOuter: "#12060a",
    ringColor: "#f08a78",
    glowColor: "#ff5c6c",
    emblemSvg: `<path d="M18 78 L78 18 M24 18 L78 72" stroke="#ff7a88" stroke-opacity="0.42" stroke-width="2"/>`,
  })
);

await writeFile(
  resolve(outDir, "stance-ngu-hon.png"),
  await renderObjectIcon(await readFile(resolve(charUiDir, "jade-charm.webp")), {
    targetSize: 66,
    kernel: "lanczos3",
    tint: { r: 205, g: 145, b: 255 },
    bgInner: "#2c1742",
    bgOuter: "#0c0514",
    ringColor: "#c894f5",
    glowColor: "#b56bff",
    emblemSvg: `<circle cx="48" cy="48" r="29" fill="none" stroke="#d49eff" stroke-opacity="0.45" stroke-width="1.8" stroke-dasharray="5 3"/>`,
  })
);

await writeFile(
  resolve(outDir, "stance-tran-nhac.png"),
  await renderObjectIcon(await readFile(resolve(charUiDir, "sect-seal.webp")), {
    targetSize: 66,
    kernel: "lanczos3",
    bgInner: "#382c14",
    bgOuter: "#140f05",
    ringColor: "#ebd086",
    glowColor: "#f5c24c",
    emblemSvg: `<polygon points="48,14 78,30 78,66 48,82 18,66 18,30" fill="none" stroke="#f5d478" stroke-opacity="0.48" stroke-width="1.8"/>`,
  })
);

// 4. NPC Portraits
const npcCalibDir = resolve(root, "docs/design/characters/van-hai-npc-motion-v1/calibration");
const npcWaveADir = resolve(root, "docs/design/characters/van-hai-npc-wave-a-concepts-v1/sprites");

await writeFile(
  resolve(outDir, "npc-tran-duy.png"),
  await renderPortraitIcon(await readFile(resolve(npcCalibDir, "tran-duy-southeast.png")), {
    bustRatio: 0.62,
    bgInner: "#184045",
    ringColor: "#d6be86",
    glowColor: "#6be6d3",
  })
);

await writeFile(
  resolve(outDir, "npc-diep-tinh.png"),
  await renderPortraitIcon(await readFile(resolve(npcCalibDir, "diep-tinh-southeast.png")), {
    bustRatio: 0.62,
    bgInner: "#173c4a",
    ringColor: "#9adcf0",
    glowColor: "#68d8ff",
  })
);

await writeFile(
  resolve(outDir, "npc-ta-kiem-son.png"),
  await renderPortraitIcon(await readFile(resolve(npcCalibDir, "ta-kiem-son-southeast.png")), {
    bustRatio: 0.62,
    bgInner: "#243648",
    ringColor: "#e0c282",
    glowColor: "#78c8ff",
  })
);

await writeFile(
  resolve(outDir, "npc-to-nhuoc.png"),
  await renderPortraitIcon(await readFile(resolve(npcCalibDir, "to-nhuoc-southeast.png")), {
    bustRatio: 0.62,
    bgInner: "#1b3f36",
    ringColor: "#c9dfa0",
    glowColor: "#74e8b0",
  })
);

await writeFile(
  resolve(outDir, "npc-bach-chi.png"),
  await renderPortraitIcon(await readFile(resolve(npcWaveADir, "bach-chi.png")), {
    bustRatio: 0.62,
    bgInner: "#1a4236",
    ringColor: "#b8e6a8",
    glowColor: "#66e8a6",
  })
);

await writeFile(
  resolve(outDir, "npc-situ-nan.png"),
  await renderPortraitIcon(await readFile(resolve(root, "client/public/assets/CHR-SITU-NAN/atlas.png")), {
    cropRegion: { left: 0, top: 0, width: 64, height: 96 },
    bustRatio: 0.65,
    bgInner: "#252046",
    bgOuter: "#0b0818",
    ringColor: "#a8b8ff",
    glowColor: "#7e96ff",
  })
);

await writeFile(
  resolve(outDir, "npc-li-muwan.png"),
  await renderPortraitIcon(await readFile(resolve(root, "client/public/assets/CHR-LI-MUWAN/atlas.png")), {
    cropRegion: { left: 0, top: 0, width: 64, height: 96 },
    bustRatio: 0.65,
    bgInner: "#1c4042",
    bgOuter: "#081618",
    ringColor: "#a8f0dc",
    glowColor: "#6bf2d0",
  })
);

// 5. Boss Portraits
await writeFile(
  resolve(outDir, "boss-wolf.png"),
  await renderPortraitIcon(
    await readFile(resolve(root, "docs/design/characters/van-hai-boss-concepts-v1/sprites/cloud-wolf-king.png")),
    {
      bustRatio: 0.85,
      targetSize: 78,
      bgInner: "#3b1824",
      bgOuter: "#12060a",
      ringColor: "#e68a7c",
      glowColor: "#ff5c6a",
    }
  )
);

await writeFile(
  resolve(outDir, "boss-puppet.png"),
  await renderPortraitIcon(
    await readFile(resolve(root, "docs/design/characters/van-hai-boss-concepts-v2/sprites/three-seal-puppet.png")),
    {
      bustRatio: 0.72,
      targetSize: 78,
      bgInner: "#3d2414",
      bgOuter: "#140a05",
      ringColor: "#e8b068",
      glowColor: "#ff9442",
    }
  )
);

await writeFile(
  resolve(outDir, "boss-officer.png"),
  await renderPortraitIcon(
    await readFile(resolve(root, "docs/design/characters/van-hai-dark-seal-officer-v3/sprites/officer.png")),
    {
      bustRatio: 0.64,
      targetSize: 76,
      bgInner: "#381422",
      bgOuter: "#110509",
      ringColor: "#e67888",
      glowColor: "#ff4d68",
    }
  )
);

// Hứa Lập Quốc (Ma Linh / Kiếm Linh hung sát): close-up from sword-progression.png
await writeFile(
  resolve(outDir, "boss-xu-liguo.png"),
  await renderFramedCropIcon(
    swordProgBuf,
    { left: 660, top: 730, width: 225, height: 225 },
    { ringColor: "#f08498", glowColor: "#ff4870" }
  )
);

console.log("Synced 24 g2-items icons to client/public/assets/g2-items/");
