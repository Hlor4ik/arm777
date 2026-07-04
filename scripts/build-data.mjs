#!/usr/bin/env node
import { cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'data');
const DEST = join(ROOT, 'app', 'public', 'data');

async function main() {
  await mkdir(DEST, { recursive: true });
  await cp(SRC, DEST, { recursive: true, force: true });
  console.log(`Copied ${SRC} -> ${DEST}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
