export const ALL_STUDY_FOLDER_IDS = [
  'greetings',
  'numbers',
  'family',
  'food',
  'home',
  'clothes',
  'body',
  'city',
  'work',
  'nature',
  'emotions',
  'verbs',
  'adjectives',
  'phrases',
] as const;

export type StudyFolderId = (typeof ALL_STUDY_FOLDER_IDS)[number];
