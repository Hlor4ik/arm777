import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/assets/world');

const sizes = {
  'courtyard-bg.png': 960,
  'star-icon.png': 128,
};

async function optimize() {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.png'));
  for (const file of files) {
    const input = path.join(dir, file);
    const output = input.replace(/\.png$/, '.webp');
    const maxWidth = sizes[file] ?? 320;
    const before = (await stat(input)).size;
    await sharp(input)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(output);
    const after = (await stat(output)).size;
    console.log(`${file}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB webp`);
  }
}

optimize().catch(console.error);
