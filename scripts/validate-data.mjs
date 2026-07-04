#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const WORDS_DIR = join(DATA_DIR, 'words');

const REQUIRED_WORD_FIELDS = [
  'id',
  'folderId',
  'ru',
  'en',
  'transcription_eastern',
  'transcription_lori',
];

const MIN_TOTAL_WORDS = 2500;

/** @param {unknown} value */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

async function main() {
  const errors = [];
  const ids = new Set();
  let totalWords = 0;

  const wordFiles = (await readdir(WORDS_DIR)).filter((f) => f.endsWith('.json'));
  if (wordFiles.length === 0) {
    errors.push('No word files found in data/words/');
  }

  for (const file of wordFiles.sort()) {
    const folderId = file.replace(/\.json$/, '');
    const raw = await readFile(join(WORDS_DIR, file), 'utf8');
    /** @type {unknown} */
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      errors.push(`${file}: expected JSON array`);
      continue;
    }

    totalWords += data.length;

    for (const [index, item] of data.entries()) {
      if (!item || typeof item !== 'object') {
        errors.push(`${file}[${index}]: expected object`);
        continue;
      }
      const word = /** @type {Record<string, unknown>} */ (item);

      for (const field of REQUIRED_WORD_FIELDS) {
        if (!isNonEmptyString(word[field])) {
          errors.push(`${file}[${index}]: missing or empty "${field}"`);
        }
      }

      if (word.folderId !== folderId) {
        errors.push(`${file}[${index}]: folderId "${word.folderId}" does not match file "${folderId}"`);
      }

      if (isNonEmptyString(word.id)) {
        if (ids.has(word.id)) {
          errors.push(`Duplicate id: ${word.id}`);
        } else {
          ids.add(word.id);
        }
      }
    }
  }

  if (totalWords < MIN_TOTAL_WORDS) {
    errors.push(`Total word count ${totalWords} is below minimum ${MIN_TOTAL_WORDS}`);
  }

  const alphabetPath = join(DATA_DIR, 'alphabet.json');
  try {
    const alphabetRaw = await readFile(alphabetPath, 'utf8');
    const alphabet = JSON.parse(alphabetRaw);
    if (!Array.isArray(alphabet.letters) || alphabet.letters.length !== 38) {
      errors.push(`alphabet.json: expected 38 letters, got ${alphabet.letters?.length ?? 0}`);
    }
    if (!Array.isArray(alphabet.syllables) || alphabet.syllables.length < 20) {
      errors.push(`alphabet.json: expected at least 20 syllables, got ${alphabet.syllables?.length ?? 0}`);
    }
  } catch {
    errors.push('alphabet.json: missing or invalid');
  }

  if (errors.length > 0) {
    console.error('Validation failed:');
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  console.log('Validation passed.');
  console.log(`  Unique ids: ${ids.size}`);
  console.log(`  Total words: ${totalWords}`);
  console.log(`  Word files: ${wordFiles.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
