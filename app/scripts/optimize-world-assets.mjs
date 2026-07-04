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

const SKIP_WHITE_REMOVAL = new Set(['courtyard-bg.webp']);

function removeWhiteBackground(data, width, height) {
  const hard = 225;
  const soft = 28;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const sat = max - min;

      if (lum >= hard && sat <= 42) {
        const fade = Math.min(1, (lum - hard + 6) / soft);
        data[i + 3] = Math.round(data[i + 3] * (1 - fade));
        continue;
      }

      if (lum >= hard - soft && sat <= 55) {
        const fade = Math.min(0.9, (lum - (hard - soft)) / (soft * 1.6));
        data[i + 3] = Math.round(data[i + 3] * (1 - fade));
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

  let pipeline = sharp(await readFile(input))
    .resize({ width: maxWidth, withoutEnlargement: true })
    .ensureAlpha();

  if (!SKIP_WHITE_REMOVAL.has(file)) {
    const { data, info } = await pipeline.clone().raw().toBuffer({ resolveWithObject: true });
    removeWhiteBackground(data, info.width, info.height);
    pipeline = sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 },
    }).trim({ threshold: 8 });
  }

  const buffer = await pipeline.webp({ quality: 88, alphaQuality: 100, effort: 6 }).toBuffer();
  await writeViaTemp(input, buffer);

  const after = (await stat(input)).size;
  const tag = SKIP_WHITE_REMOVAL.has(file) ? 'bg' : 'cutout';
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
