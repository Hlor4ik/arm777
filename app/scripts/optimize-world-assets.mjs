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

/** Full scene background — only resize, never strip pixels */
const SKIP_CUTOUT = new Set(['courtyard-bg.webp']);

function isBackgroundColor(r, g, b) {
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const sat = max - min;
  // Only treat flat bright areas as removable backdrop (not subject highlights)
  return min >= 218 && sat <= 36;
}

/**
 * Remove ONLY backdrop connected to image edges.
 * Keeps white fur, walls, windows inside the subject intact.
 */
function removeEdgeBackground(data, width, height) {
  const total = width * height;
  const bg = new Uint8Array(total);
  const queue = [];

  const pushIfBg = (idx) => {
    if (bg[idx]) return;
    const i = idx * 4;
    if (!isBackgroundColor(data[i], data[i + 1], data[i + 2])) return;
    bg[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    pushIfBg(x);
    pushIfBg((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    pushIfBg(y * width);
    pushIfBg(y * width + width - 1);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx / width) | 0;

    if (x > 0) pushIfBg(idx - 1);
    if (x < width - 1) pushIfBg(idx + 1);
    if (y > 0) pushIfBg(idx - width);
    if (y < height - 1) pushIfBg(idx + width);
  }

  for (let idx = 0; idx < total; idx++) {
    if (!bg[idx]) continue;
    const i = idx * 4;
    data[i + 3] = 0;
  }

  // Soft 1px fringe on cutout edge for smoother blend on grass
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (bg[idx]) continue;
      const i = idx * 4;
      if (data[i + 3] === 0) continue;

      let touchesBg = false;
      for (const n of [idx - 1, idx + 1, idx - width, idx + width]) {
        if (bg[n]) touchesBg = true;
      }
      if (touchesBg && isBackgroundColor(data[i], data[i + 1], data[i + 2])) {
        data[i + 3] = Math.round(data[i + 3] * 0.35);
      }
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

  let pipeline = sharp(await readFile(input)).resize({
    width: maxWidth,
    withoutEnlargement: true,
  });

  if (SKIP_CUTOUT.has(file)) {
    const buffer = await pipeline.webp({ quality: 86, effort: 6 }).toBuffer();
    await writeViaTemp(input, buffer);
  } else {
    pipeline = pipeline.ensureAlpha();
    const { data, info } = await pipeline.clone().raw().toBuffer({ resolveWithObject: true });
    removeEdgeBackground(data, info.width, info.height);
    const buffer = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .trim({ threshold: 10 })
      .webp({ quality: 90, alphaQuality: 100, effort: 6 })
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
