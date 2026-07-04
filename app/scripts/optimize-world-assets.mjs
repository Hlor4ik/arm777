import sharp from 'sharp';
import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/assets/world');

const sizes = {
  'courtyard-bg.webp': 960,
  'star-icon.webp': 128,
};

const SKIP_WHITE_REMOVAL = new Set(['courtyard-bg.webp']);

function removeNearWhite(data, width, height, threshold = 232) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const min = Math.min(r, g, b);
      const max = Math.max(r, g, b);

      if (min >= threshold && max - min < 28) {
        const fade = Math.min(1, (min - threshold + 8) / (255 - threshold + 8));
        data[i + 3] = Math.round(data[i + 3] * (1 - fade));
        continue;
      }

      if (min >= threshold - 18 && max - min < 35) {
        const fade = Math.min(0.85, (min - (threshold - 18)) / 40);
        data[i + 3] = Math.round(data[i + 3] * (1 - fade));
      }
    }
  }
}

async function processFile(file) {
  const input = path.join(dir, file);
  const maxWidth = sizes[file] ?? 320;
  const before = (await stat(input)).size;

  let pipeline = sharp(input).resize({ width: maxWidth, withoutEnlargement: true }).ensureAlpha();

  if (!SKIP_WHITE_REMOVAL.has(file)) {
    const { data, info } = await pipeline.clone().raw().toBuffer({ resolveWithObject: true });
    removeNearWhite(data, info.width, info.height);
    pipeline = sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 },
    });
  }

  const buffer = await pipeline.webp({ quality: 86, alphaQuality: 100, effort: 6 }).toBuffer();
  await writeFile(input, buffer);

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
