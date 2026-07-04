import type { AlphabetLetter, AlphabetSyllable, FolderMeta, Word } from './types';

const metaCache: FolderMeta[] | null = null;

export async function loadFoldersMeta(): Promise<FolderMeta[]> {
  const res = await fetch('/data/folders-meta.json');
  if (!res.ok) throw new Error('Failed to load folders meta');
  return res.json();
}

export async function loadWords(folderId: string): Promise<Word[]> {
  if (folderId === 'alphabet') return [];
  const res = await fetch(`/data/words/${folderId}.json`);
  if (!res.ok) throw new Error(`Failed to load words for ${folderId}`);
  return res.json();
}

export async function loadAlphabet(): Promise<{
  letters: AlphabetLetter[];
  syllables: AlphabetSyllable[];
}> {
  const res = await fetch('/data/alphabet.json');
  if (!res.ok) throw new Error('Failed to load alphabet');
  return res.json();
}

export async function loadAllWordsForFolders(folderIds: string[]): Promise<Word[]> {
  const results = await Promise.all(folderIds.map((id) => loadWords(id)));
  return results.flat();
}

let metaPromise: Promise<FolderMeta[]> | null = null;

export function getFoldersMeta(): Promise<FolderMeta[]> {
  if (!metaPromise) metaPromise = loadFoldersMeta();
  return metaPromise;
}

export { metaCache };
