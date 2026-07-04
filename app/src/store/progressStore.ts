import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BaseLang,
  Dialect,
  UserProgress,
  WordProgress,
} from '../data/types';
import { getUpgradeCost, INITIAL_GAME, STAR_REWARDS } from '../engine/gamification';
import type { UpgradeTrack } from '../engine/gamification';
import { createWordProgress, reviewAgain, reviewKnown } from '../engine/sm2';
import { todayISO } from '../engine/utils';
import { getFoldersMeta } from '../data/loaders';
import { ALL_STUDY_FOLDER_IDS } from '../data/folders';

const STORAGE_KEY = 'armenian-learn-v1';
const PROGRESS_VERSION = 3;

export const INITIAL_PROGRESS: UserProgress = {
  version: PROGRESS_VERSION,
  updatedAt: new Date().toISOString(),
  availableFolders: [],
  openedFolders: [...ALL_STUDY_FOLDER_IDS],
  passedExams: [],
  alphabetPassed: true,
  wordProgress: {},
  settings: { baseLang: 'ru', dialect: 'eastern' },
  streak: { current: 0, lastDate: null },
  lastModeId: null,
  game: { ...INITIAL_GAME },
};

function unlockAllSections(state: UserProgress): UserProgress {
  return {
    ...state,
    version: PROGRESS_VERSION,
    availableFolders: [],
    openedFolders: [...ALL_STUDY_FOLDER_IDS],
    alphabetPassed: true,
    updatedAt: new Date().toISOString(),
  };
}

function migrateProgress(state: UserProgress): UserProgress {
  let next = { ...state };
  if (state.version < 2) {
    next = unlockAllSections(next);
  }
  if (state.version < 3 || !state.game) {
    next.game = state.game ?? { ...INITIAL_GAME };
  }
  next.version = PROGRESS_VERSION;
  next.updatedAt = new Date().toISOString();
  return next;
}

interface ProgressState extends UserProgress {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setBaseLang: (lang: BaseLang) => void;
  setDialect: (dialect: Dialect) => void;
  touchStreak: () => void;
  openFolder: (folderId: string) => void;
  passExam: (folderId: string, isAlphabet?: boolean) => Promise<void>;
  getWordProgress: (wordId: string) => WordProgress;
  markKnown: (wordId: string) => void;
  markAgain: (wordId: string) => void;
  resetProgress: () => void;
  setLastMode: (modeId: string) => void;
  addStars: (amount: number) => void;
  buyUpgrade: (track: 'home' | 'pet' | 'car') => boolean;
}

async function unlockNextFolder(passedId: string) {
  const meta = await getFoldersMeta();
  const sorted = [...meta].filter((f) => !f.isAlphabet).sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((f) => f.id === passedId);
  if (idx >= 0 && idx < sorted.length - 1) {
    return sorted[idx + 1].id;
  }
  return null;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...INITIAL_PROGRESS,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      setBaseLang: (baseLang) =>
        set({ settings: { ...get().settings, baseLang }, updatedAt: new Date().toISOString() }),

      setDialect: (dialect) =>
        set({ settings: { ...get().settings, dialect }, updatedAt: new Date().toISOString() }),

      touchStreak: () => {
        const today = todayISO();
        const { streak } = get();
        if (streak.lastDate === today) return;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const y = yesterday.toISOString().slice(0, 10);
        const current = streak.lastDate === y ? streak.current + 1 : 1;
        set({ streak: { current, lastDate: today }, updatedAt: new Date().toISOString() });
        get().addStars(STAR_REWARDS.streakDaily);
      },

      openFolder: (folderId) => {
        const { availableFolders, openedFolders } = get();
        if (!availableFolders.includes(folderId)) return;
        set({
          openedFolders: [...new Set([...openedFolders, folderId])],
          availableFolders: availableFolders.filter((id) => id !== folderId),
          updatedAt: new Date().toISOString(),
        });
      },

      passExam: async (folderId, isAlphabet = false) => {
        if (isAlphabet) {
          set((s) => ({
            alphabetPassed: true,
            passedExams: [...new Set([...s.passedExams, 'alphabet'])],
            availableFolders: [...new Set([...s.availableFolders, 'greetings'])],
            updatedAt: new Date().toISOString(),
          }));
          return;
        }

        const nextId = await unlockNextFolder(folderId);
        set((s) => ({
          passedExams: [...new Set([...s.passedExams, folderId])],
          availableFolders: nextId
            ? [...new Set([...s.availableFolders, nextId])]
            : s.availableFolders,
          updatedAt: new Date().toISOString(),
        }));
      },

      getWordProgress: (wordId) => {
        return get().wordProgress[wordId] ?? createWordProgress();
      },

      markKnown: (wordId) => {
        const current = get().getWordProgress(wordId);
        set((s) => ({
          wordProgress: { ...s.wordProgress, [wordId]: reviewKnown(current) },
          updatedAt: new Date().toISOString(),
        }));
        get().touchStreak();
      },

      markAgain: (wordId) => {
        const current = get().getWordProgress(wordId);
        set((s) => ({
          wordProgress: { ...s.wordProgress, [wordId]: reviewAgain(current) },
          updatedAt: new Date().toISOString(),
        }));
        get().touchStreak();
      },

      resetProgress: () => set({ ...INITIAL_PROGRESS, hydrated: true }),

      setLastMode: (modeId) => set({ lastModeId: modeId }),

      addStars: (amount) => {
        if (amount <= 0) return;
        set((s) => ({
          game: { ...s.game, stars: s.game.stars + amount },
          updatedAt: new Date().toISOString(),
        }));
      },

      buyUpgrade: (track: UpgradeTrack) => {
        const { game } = get();
        const cost = getUpgradeCost(track, game.upgrades[track]);
        if (cost === null || game.stars < cost) return false;
        set((s) => ({
          game: {
            ...s.game,
            stars: s.game.stars - cost,
            upgrades: { ...s.game.upgrades, [track]: s.game.upgrades[track] + 1 },
          },
          updatedAt: new Date().toISOString(),
        }));
        return true;
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (state && state.version < PROGRESS_VERSION) {
          Object.assign(state, migrateProgress(state));
        }
        state?.setHydrated(true);
      },
    }
  )
);

export async function syncToCloudStorage(): Promise<void> {
  try {
    const tg = window.Telegram?.WebApp;
    const cs = tg?.CloudStorage;
    if (!cs) return;
    const data = JSON.stringify(useProgressStore.getState());
    await new Promise<void>((resolve, reject) => {
      cs.setItem(STORAGE_KEY, data, (err) => (err ? reject(err) : resolve()));
    });
  } catch {
    /* ignore */
  }
}

export async function loadFromCloudStorage(): Promise<void> {
  try {
    const tg = window.Telegram?.WebApp;
    const cs = tg?.CloudStorage;
    if (!cs) return;
    const data = await new Promise<string | null>((resolve) => {
      cs.getItem(STORAGE_KEY, (err, val) => {
        if (err || !val) resolve(null);
        else resolve(val);
      });
    });
    if (!data) return;
    const parsed = JSON.parse(data) as UserProgress;
    if (parsed.updatedAt > useProgressStore.getState().updatedAt) {
      useProgressStore.setState({ ...parsed, hydrated: true });
    }
  } catch {
    /* ignore */
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
        CloudStorage?: {
          setItem: (key: string, value: string, cb: (err: Error | null) => void) => void;
          getItem: (key: string, cb: (err: Error | null, val: string | null) => void) => void;
          removeItem: (key: string, cb: (err: Error | null) => void) => void;
        };
      };
    };
  }
}
