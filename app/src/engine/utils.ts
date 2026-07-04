import type { BaseLang, Dialect, Word } from '../data/types';

export function getTranslation(word: Word, baseLang: BaseLang): string {
  return baseLang === 'ru' ? word.ru : word.en;
}

export function getTranscription(word: Word, dialect: Dialect): string {
  return dialect === 'eastern' ? word.transcription_eastern : word.transcription_lori;
}

export function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
    }
  }
  return matrix[b.length][a.length];
}

export function checkAnswer(input: string, correct: string, soft = true): boolean {
  const a = normalizeText(input);
  const b = normalizeText(correct);
  if (a === b) return true;
  if (soft && levenshtein(a, b) <= 1) return true;
  return false;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandom<T>(arr: T[], count: number, exclude?: T): T[] {
  const pool = exclude ? arr.filter((x) => x !== exclude) : [...arr];
  return shuffle(pool).slice(0, count);
}

export function generateDistractors(
  correct: string,
  pool: string[],
  count = 3
): string[] {
  const unique = [...new Set(pool.filter((p) => p !== correct))];
  return pickRandom(unique, count).concat(
    Array(Math.max(0, count - unique.length)).fill('???')
  ).slice(0, count);
}

export function splitSyllables(transcription: string): string[] {
  const parts = transcription.match(/[bcdfghjklmnpqrstvwxyz']+|[^bcdfghjklmnpqrstvwxyz'\s]+/gi);
  if (parts && parts.length > 1) return parts;
  const mid = Math.ceil(transcription.length / 2);
  return [transcription.slice(0, mid), transcription.slice(mid)];
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
