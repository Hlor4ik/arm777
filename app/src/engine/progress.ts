import type { FolderMeta, FolderStatus, UserProgress, Word, WordProgress } from '../data/types';
import { isLearned, isStudied, isWeakWord } from './sm2';

export function getFolderStatus(
  folder: FolderMeta,
  progress: UserProgress
): FolderStatus {
  if (folder.isAlphabet) {
    if (progress.alphabetPassed) return 'passed';
    return 'available';
  }
  if (progress.passedExams.includes(folder.id)) return 'passed';
  if (progress.openedFolders.includes(folder.id)) return 'opened';
  if (progress.availableFolders.includes(folder.id)) return 'available';
  return 'locked';
}

export function getReadiness(
  _folderId: string,
  words: Word[],
  wordProgress: Record<string, WordProgress>
): number {
  if (words.length === 0) return 0;
  const studied = words.filter((w) => isStudied(wordProgress[w.id])).length;
  return Math.round((studied / words.length) * 100);
}

export function getFolderStats(
  words: Word[],
  wordProgress: Record<string, WordProgress>
) {
  let learned = 0;
  let inProgress = 0;
  let weak = 0;
  for (const w of words) {
    const p = wordProgress[w.id];
    if (isLearned(p)) learned++;
    else if (isStudied(p)) inProgress++;
    if (isWeakWord(p)) weak++;
  }
  return { learned, inProgress, weak, total: words.length };
}

export function canTakeExam(readiness: number, passed: boolean): boolean {
  return !passed && readiness >= 70;
}
