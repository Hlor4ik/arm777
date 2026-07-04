import type { ComponentType } from 'react';
import type { UpgradeTrack } from '../../../engine/gamification';
import { HouseIllustration } from './HouseIllustration';
import { PetIllustration } from './PetIllustration';
import { VehicleIllustration } from './VehicleIllustration';
import type { IllustrationProps } from './types';

export { SceneBackdrop } from './SceneBackdrop';
export { HouseIllustration } from './HouseIllustration';
export { PetIllustration } from './PetIllustration';
export { VehicleIllustration } from './VehicleIllustration';
export { StarSvg } from './StarSvg';
export { TRACK_POSITIONS } from './types';

const MAP: Record<UpgradeTrack, ComponentType<IllustrationProps>> = {
  home: HouseIllustration,
  pet: PetIllustration,
  car: VehicleIllustration,
};

export function TrackIllustration({
  track,
  level,
  highlight,
}: {
  track: UpgradeTrack;
  level: number;
  highlight?: boolean;
}) {
  const Component = MAP[track];
  return <Component level={level} highlight={highlight} />;
}

export function IllustrationPreview({
  track,
  level,
  size = 72,
}: {
  track: UpgradeTrack;
  level: number;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="-55 -45 110 90" aria-hidden className="illustrationPreview">
      <rect x="-55" y="-45" width="110" height="90" rx="10" fill="rgba(0,51,160,0.2)" />
      <TrackIllustration track={track} level={level} />
    </svg>
  );
}
