export type UpgradeTrack = 'home' | 'pet' | 'car';

export interface GameProfile {
  stars: number;
  coins: number;
  upgrades: Record<UpgradeTrack, number>;
}

export interface UpgradeLevel {
  cost: number;
  nameRu: string;
  nameEn: string;
}

export const UPGRADE_CONFIG: Record<
  UpgradeTrack,
  { titleRu: string; titleEn: string; levels: UpgradeLevel[] }
> = {
  home: {
    titleRu: 'Дом',
    titleEn: 'Home',
    levels: [
      { cost: 40, nameRu: 'Шалаш', nameEn: 'Shed' },
      { cost: 90, nameRu: 'Комната', nameEn: 'Room' },
      { cost: 160, nameRu: 'Двор', nameEn: 'Yard' },
      { cost: 280, nameRu: 'Таунхаус', nameEn: 'Townhouse' },
      { cost: 450, nameRu: 'Особняк', nameEn: 'Villa' },
    ],
  },
  pet: {
    titleRu: 'Питомец',
    titleEn: 'Pet',
    levels: [
      { cost: 30, nameRu: 'Ягнёнок', nameEn: 'Lamb' },
      { cost: 75, nameRu: 'Котёнок', nameEn: 'Kitten' },
      { cost: 140, nameRu: 'Щенок', nameEn: 'Puppy' },
      { cost: 240, nameRu: 'Орёл', nameEn: 'Eagle' },
      { cost: 400, nameRu: 'Лев', nameEn: 'Guardian' },
    ],
  },
  car: {
    titleRu: 'Машина',
    titleEn: 'Car',
    levels: [
      { cost: 50, nameRu: 'Велосипед', nameEn: 'Bike' },
      { cost: 100, nameRu: 'Мопед', nameEn: 'Scooter' },
      { cost: 180, nameRu: 'Седан', nameEn: 'Sedan' },
      { cost: 300, nameRu: 'Джип', nameEn: 'SUV' },
      { cost: 500, nameRu: 'Спорткар', nameEn: 'Sport' },
    ],
  },
};

export const STAR_REWARDS = {
  correct: 2,
  sessionComplete: 15,
  examPass: 50,
  streakDaily: 10,
} as const;

export const INITIAL_GAME: GameProfile = {
  stars: 0,
  coins: 0,
  upgrades: { home: 0, pet: 0, car: 0 },
};

export function getUpgradeCost(track: UpgradeTrack, currentLevel: number): number | null {
  const levels = UPGRADE_CONFIG[track].levels;
  if (currentLevel >= levels.length) return null;
  return levels[currentLevel].cost;
}

export function getUpgradeDisplay(
  track: UpgradeTrack,
  level: number,
  lang: 'ru' | 'en'
): string {
  if (level <= 0) return lang === 'ru' ? 'Не куплено' : 'Not owned';
  const item = UPGRADE_CONFIG[track].levels[level - 1];
  return lang === 'ru' ? item.nameRu : item.nameEn;
}
