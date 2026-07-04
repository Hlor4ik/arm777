import type { BaseLang, Dialect, ExamQuestion, StudyModeId, Word } from '../data/types';
import {
  checkAnswer,
  generateDistractors,
  getTranscription,
  getTranslation,
  shuffle,
  splitSyllables,
} from './utils';

export interface ChoiceQuestion {
  word: Word;
  prompt: string;
  options: string[];
  correct: string;
}

export function buildChoiceQuestion(
  word: Word,
  pool: Word[],
  baseLang: BaseLang,
  dialect: Dialect,
  reverse = false
): ChoiceQuestion {
  const translation = getTranslation(word, baseLang);
  const transcription = getTranscription(word, dialect);
  const poolValues = reverse
    ? pool.map((w) => getTranslation(w, baseLang))
    : pool.map((w) => getTranscription(w, dialect));

  if (reverse) {
    return {
      word,
      prompt: transcription,
      correct: translation,
      options: shuffle([translation, ...generateDistractors(translation, poolValues)]),
    };
  }

  return {
    word,
    prompt: translation,
    correct: transcription,
    options: shuffle([transcription, ...generateDistractors(transcription, poolValues)]),
  };
}

export function buildMatchingRound(words: Word[], baseLang: BaseLang, dialect: Dialect) {
  const selected = shuffle(words).slice(0, 4);
  const left = shuffle(selected.map((w) => getTranslation(w, baseLang)));
  const right = shuffle(selected.map((w) => getTranscription(w, dialect)));
  return { words: selected, left, right };
}

export function buildFillBlankQuestion(word: Word, baseLang: BaseLang, dialect: Dialect) {
  const transcription = getTranscription(word, dialect);
  const example =
    baseLang === 'ru'
      ? word.example_ru ?? `${word.ru} ___`
      : word.example_en ?? `${word.en} ___`;
  const parts = example.split('___');
  return {
    word,
    prefix: parts[0] ?? '',
    suffix: parts[1] ?? '',
    correct: transcription,
  };
}

export function buildExamQuestions(
  words: Word[],
  baseLang: BaseLang,
  dialect: Dialect
): ExamQuestion[] {
  const pool = shuffle(words);
  const questions: ExamQuestion[] = [];

  pool.slice(0, 10).forEach((word, i) => {
    const q = buildChoiceQuestion(word, words, baseLang, dialect, false);
    questions.push({
      id: `exam-a-${i}`,
      type: 'choice',
      wordId: word.id,
      prompt: q.prompt,
      correctAnswer: q.correct,
      options: q.options,
    });
  });

  pool.slice(10, 15).forEach((word, i) => {
    questions.push({
      id: `exam-b-${i}`,
      type: 'dictation',
      wordId: word.id,
      prompt: getTranslation(word, baseLang),
      correctAnswer: getTranscription(word, dialect),
    });
  });

  const matchWords = pool.slice(15, 19);
  if (matchWords.length >= 4) {
    questions.push({
      id: 'exam-c-0',
      type: 'matching',
      prompt: 'match',
      correctAnswer: 'done',
      pairs: matchWords.map((w) => ({
        left: getTranslation(w, baseLang),
        right: getTranscription(w, dialect),
      })),
    });
  }

  pool.slice(19, 25).forEach((word, i) => {
    const q = buildChoiceQuestion(word, words, baseLang, dialect, true);
    questions.push({
      id: `exam-d-${i}`,
      type: 'reverse-choice',
      wordId: word.id,
      prompt: q.prompt,
      correctAnswer: q.correct,
      options: q.options,
    });
  });

  return questions.slice(0, 25);
}

export function getModeTitle(modeId: StudyModeId, lang: BaseLang): string {
  const titles: Record<StudyModeId, { ru: string; en: string }> = {
    alphabet: { ru: 'Алфавит', en: 'Alphabet' },
    flashcards: { ru: 'Карточки', en: 'Flashcards' },
    choice: { ru: 'Выбор перевода', en: 'Translation choice' },
    'reverse-choice': { ru: 'Обратный выбор', en: 'Reverse choice' },
    matching: { ru: 'Сопоставление', en: 'Matching' },
    dictation: { ru: 'Диктант', en: 'Dictation' },
    'reverse-dictation': { ru: 'Обратный диктант', en: 'Reverse dictation' },
    'word-builder': { ru: 'Сборка слова', en: 'Word builder' },
    'fill-blank': { ru: 'Заполнить пропуск', en: 'Fill the blank' },
    weak: { ru: 'Слабые места', en: 'Weak words' },
    marathon: { ru: 'Марафон', en: 'Marathon' },
    speed: { ru: 'Скорость', en: 'Speed' },
  };
  return titles[modeId][lang];
}

export { checkAnswer, splitSyllables };
