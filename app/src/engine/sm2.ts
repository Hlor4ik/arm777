import type { WordProgress } from '../data/types';
import { todayISO } from './utils';

export function createWordProgress(): WordProgress {
  return {
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: todayISO(),
    lapses: 0,
    views: 0,
  };
}

export function reviewKnown(progress: WordProgress): WordProgress {
  const repetitions = progress.repetitions + 1;
  let interval = progress.interval;
  if (repetitions === 1) interval = 1;
  else if (repetitions === 2) interval = 3;
  else interval = Math.round(progress.interval * progress.ease);

  const next = new Date();
  next.setDate(next.getDate() + interval);

  return {
    ...progress,
    repetitions,
    interval,
    ease: Math.min(progress.ease + 0.1, 3),
    nextReview: next.toISOString().slice(0, 10),
    views: progress.views + 1,
  };
}

export function reviewAgain(progress: WordProgress): WordProgress {
  return {
    ...progress,
    repetitions: 0,
    interval: 0,
    lapses: progress.lapses + 1,
    ease: Math.max(1.3, progress.ease - 0.2),
    nextReview: todayISO(),
    views: progress.views + 1,
  };
}

export function incrementView(progress: WordProgress): WordProgress {
  return { ...progress, views: progress.views + 1 };
}

export function isWeakWord(progress: WordProgress | undefined): boolean {
  if (!progress) return false;
  return progress.lapses > 0 || (progress.views >= 2 && progress.repetitions === 0);
}

export function isLearned(progress: WordProgress | undefined): boolean {
  return (progress?.repetitions ?? 0) >= 2;
}

export function isStudied(progress: WordProgress | undefined): boolean {
  return (progress?.repetitions ?? 0) >= 1;
}
