import type { StudyModeId, Word, WordProgress } from '../data/types';
import { isWeakWord } from './sm2';
import { shuffle } from './utils';

export const DEFAULT_SESSION_SIZE = 20;
export const MARATHON_SIZE = 18;
export const MATCHING_ROUNDS = 5;
export const SPEED_POOL_SIZE = 40;

export interface SessionMeta {
  words: Word[];
  totalSteps: number;
  emptyReason?: 'no_weak_words';
}

export function prepareStudySession(
  modeId: StudyModeId,
  sourceWords: Word[],
  wordProgress: Record<string, WordProgress>
): SessionMeta {
  if (modeId === 'weak') {
    const weak = sourceWords.filter((w) => isWeakWord(wordProgress[w.id]));
    if (weak.length === 0) {
      return { words: [], totalSteps: 0, emptyReason: 'no_weak_words' };
    }
    const words = shuffle(weak).slice(0, DEFAULT_SESSION_SIZE);
    return { words, totalSteps: words.length };
  }

  if (modeId === 'matching') {
    const words = shuffle(sourceWords);
    return { words, totalSteps: MATCHING_ROUNDS };
  }

  if (modeId === 'marathon') {
    const words = shuffle(sourceWords).slice(0, MARATHON_SIZE);
    return { words, totalSteps: words.length };
  }

  if (modeId === 'speed') {
    const words = shuffle(sourceWords).slice(0, SPEED_POOL_SIZE);
    return { words, totalSteps: Number.POSITIVE_INFINITY };
  }

  const words = shuffle(sourceWords).slice(0, DEFAULT_SESSION_SIZE);
  return { words, totalSteps: words.length };
}

export function getSpeedWord(words: Word[], tick: number): Word {
  return words[tick % words.length];
}
