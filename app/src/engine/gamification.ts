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
  emoji: string;
}

export const UPGRADE_CONFIG: Record<
  UpgradeTrack,
  { titleRu: string; titleEn: string; icon: string; levels: UpgradeLevel[] }
> = {
  home: {
    titleRu: 'Дом',
    titleEn: 'Home',
    icon: '🏠',
    levels: [
      { cost: 40, nameRu: 'Шалаш', nameEn: 'Shed', emoji: '🛖' },
      { cost: 90, nameRu: 'Комната', nameEn: 'Room', emoji: '🏚️' },
      { cost: 160, nameRu: 'Двор', nameEn: 'Yard', emoji: '🏡' },
      { cost: 280, nameRu: 'Таунхаус', nameEn: 'Townhouse', emoji: '🏘️' },
      { cost: 450, nameRu: 'Особняк', nameEn: 'Villa', emoji: '🏛️' },
    ],
  },
  pet: {
    titleRu: 'Питомец',
    titleEn: 'Pet',
    icon: '🐑',
    levels: [
      { cost: 30, nameRu: 'Ягнёнок', nameEn: 'Lamb', emoji: '🐑' },
      { cost: 75, nameRu: 'Котёнок', nameEn: 'Kitten', emoji: '🐱' },
      { cost: 140, nameRu: 'Щенок', nameEn: 'Puppy', emoji: '🐕' },
      { cost: 240, nameRu: 'Орёл', nameEn: 'Eagle', emoji: '🦅' },
      { cost: 400, nameRu: 'Лев', nameEn: 'Guardian', emoji: '🦁' },
    ],
  },
  car: {
    titleRu: 'Машина',
    titleEn: 'Car',
    icon: '🚗',
    levels: [
      { cost: 50, nameRu: 'Велосипед', nameEn: 'Bike', emoji: '🚲' },
      { cost: 100, nameRu: 'Мoped', nameEn: 'Scooter', emoji: '🛵' },
      { cost: 180, nameRu: 'Седан', nameEn: 'Sedan', emoji: '🚗' },
      { cost: 300, nameRu: 'Джип', nameEn: 'SUV', emoji: '🚙' },
      { cost: 500, nameRu: 'Спорткар', nameEn: 'Sport', emoji: '🏎️' },
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
