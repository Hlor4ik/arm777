import type { UpgradeTrack } from '../../../engine/gamification';

export type IllustrationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface IllustrationProps {
  level: number;
  highlight?: boolean;
}

export const TRACK_POSITIONS: Record<UpgradeTrack, { x: number; y: number; scale: number }> = {
  home: { x: 58, y: 168, scale: 1 },
  pet: { x: 198, y: 198, scale: 0.72 },
  car: { x: 318, y: 206, scale: 0.78 },
};
