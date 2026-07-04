export type BaseLang = 'ru' | 'en';
export type Dialect = 'eastern' | 'lori';

export interface Word {
  id: string;
  folderId: string;
  ru: string;
  en: string;
  transcription_eastern: string;
  transcription_lori: string;
  tags?: string[];
  example_ru?: string;
  example_en?: string;
  example_transcription_eastern?: string;
  example_transcription_lori?: string;
}

export interface AlphabetLetter {
  id: string;
  letter: string;
  name: string;
  transcription: string;
  order: number;
}

export interface AlphabetSyllable {
  id: string;
  syllable: string;
  transcription: string;
  order: number;
}

export interface FolderMeta {
  id: string;
  order: number;
  nameRu: string;
  nameEn: string;
  requiresExam: string | null;
  isAlphabet?: boolean;
}

export interface WordProgress {
  ease: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lapses: number;
  views: number;
}

export interface UserSettings {
  baseLang: BaseLang;
  dialect: Dialect;
}

export interface StreakData {
  current: number;
  lastDate: string | null;
}

export interface UserProgress {
  version: number;
  updatedAt: string;
  availableFolders: string[];
  openedFolders: string[];
  passedExams: string[];
  alphabetPassed: boolean;
  wordProgress: Record<string, WordProgress>;
  settings: UserSettings;
  streak: StreakData;
  lastModeId: string | null;
}

export type StudyModeId =
  | 'alphabet'
  | 'flashcards'
  | 'choice'
  | 'reverse-choice'
  | 'matching'
  | 'dictation'
  | 'reverse-dictation'
  | 'word-builder'
  | 'fill-blank'
  | 'weak'
  | 'marathon'
  | 'speed';

export type AlphabetSubmode =
  | 'letters'
  | 'sound-to-letter'
  | 'letter-to-sound'
  | 'syllables'
  | 'mini-words';

export type FolderStatus =
  | 'locked'
  | 'available'
  | 'opened'
  | 'passed';

export interface ExamQuestion {
  id: string;
  type: 'choice' | 'reverse-choice' | 'dictation' | 'matching';
  wordId?: string;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  pairs?: { left: string; right: string }[];
}
