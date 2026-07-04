import sharp from 'sharp';
import { copyFile, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/assets/world');

const sizes = {
  'courtyard-bg.webp': 960,
  'star-icon.webp': 128,
};

const SKIP_CUTOUT = new Set(['courtyard-bg.webp']);

/** Pure flat backdrop — avoids eating cream/white fur or wall highlights */
function isBackdrop(r, g, b) {
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const sat = max - min;
  return min >= 248 && sat <= 18;
}

/** Rich pixels that must never be cut (fur shading, windows, metal, etc.) */
function isProtected(r, g, b) {
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const sat = max - min;
  return sat > 38 || min < 188;
}

function removeEdgeBackdrop(data, width, height) {
  const total = width * height;
  const bg = new Uint8Array(total);
  const protectedPx = new Uint8Array(total);
  const queue = [];

  for (let idx = 0; idx < total; idx++) {
    const i = idx * 4;
    if (isProtected(data[i], data[i + 1], data[i + 2])) {
      protectedPx[idx] = 1;
    }
  }

  const tryBg = (idx) => {
    if (bg[idx] || protectedPx[idx]) return;
    const i = idx * 4;
    if (!isBackdrop(data[i], data[i + 1], data[i + 2])) return;
    bg[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    tryBg(x);
    tryBg((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    tryBg(y * width);
    tryBg(y * width + width - 1);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx / width) | 0;
    if (x > 0) tryBg(idx - 1);
    if (x < width - 1) tryBg(idx + 1);
    if (y > 0) tryBg(idx - width);
    if (y < height - 1) tryBg(idx + width);
  }

  for (let idx = 0; idx < total; idx++) {
    if (!bg[idx]) continue;
    data[idx * 4 + 3] = 0;
  }
}

/** Fix accidental transparent speckles inside the subject (head, body, etc.) */
function fillSubjectHoles(data, width, height) {
  const total = width * height;

  for (let pass = 0; pass < 4; pass++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const i = idx * 4;
        if (data[i + 3] >= 240) continue;

        const neighbors = [idx - 1, idx + 1, idx - width, idx + width];
        let opaque = 0;
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;

        for (const n of neighbors) {
          const ni = n * 4;
          if (data[ni + 3] >= 240) {
            opaque++;
            rSum += data[ni];
            gSum += data[ni + 1];
            bSum += data[ni + 2];
          }
        }

        if (opaque >= 3) {
          data[i] = Math.round(rSum / opaque);
          data[i + 1] = Math.round(gSum / opaque);
          data[i + 2] = Math.round(bSum / opaque);
          data[i + 3] = 255;
        }
      }
    }
  }

  for (let idx = 0; idx < total; idx++) {
    const i = idx * 4;
    if (data[i + 3] > 0 && data[i + 3] < 255 && !isBackdrop(data[i], data[i + 1], data[i + 2])) {
      data[i + 3] = 255;
    }
  }
}

async function writeViaTemp(targetPath, buffer) {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'world-asset-'));
  const tempFile = path.join(tempDir, path.basename(targetPath));
  try {
    await writeFile(tempFile, buffer);
    await copyFile(tempFile, targetPath);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function processFile(file) {
  const input = path.join(dir, file);
  const maxWidth = sizes[file] ?? 360;
  const before = (await stat(input)).size;

  if (SKIP_CUTOUT.has(file)) {
    const buffer = await sharp(await readFile(input))
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 86, effort: 6 })
      .toBuffer();
    await writeViaTemp(input, buffer);
  } else {
    const resized = sharp(await readFile(input))
      .resize({ width: maxWidth, withoutEnlargement: true })
      .ensureAlpha();
    const { data, info } = await resized.raw().toBuffer({ resolveWithObject: true });
    removeEdgeBackdrop(data, info.width, info.height);
    fillSubjectHoles(data, info.width, info.height);
    const buffer = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .trim({ threshold: 10 })
      .webp({ quality: 92, alphaQuality: 100, effort: 6 })
      .toBuffer();
    await writeViaTemp(input, buffer);
  }

  const after = (await stat(input)).size;
  const tag = SKIP_CUTOUT.has(file) ? 'scene' : 'object';
  console.log(`${file} [${tag}]: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`);
}

async function optimize() {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.webp'));
  for (const file of files) {
    try {
      await processFile(file);
    } catch (err) {
      console.warn(`${file}: skipped (${err instanceof Error ? err.message : err})`);
    }
  }
}

optimize().catch(console.error);
