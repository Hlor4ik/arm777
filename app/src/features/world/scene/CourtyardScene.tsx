import type { UpgradeTrack } from '../../../engine/gamification';
import {
  HouseIllustration,
  PetIllustration,
  SceneBackdrop,
  TRACK_POSITIONS,
  VehicleIllustration,
} from '../illustrations';
import styles from './CourtyardScene.module.css';

interface CourtyardSceneProps {
  upgrades: Record<UpgradeTrack, number>;
  highlight?: UpgradeTrack | null;
  celebrate?: UpgradeTrack | null;
}

export function CourtyardScene({ upgrades, highlight, celebrate }: CourtyardSceneProps) {
  const renderSlot = (track: UpgradeTrack, Illustration: typeof HouseIllustration) => {
    const pos = TRACK_POSITIONS[track];
    const level = upgrades[track];
    const isHighlight = highlight === track;
    const isCelebrate = celebrate === track;

    return (
      <g
        transform={`translate(${pos.x}, ${pos.y}) scale(${pos.scale})`}
        className={`${styles.entity} ${isHighlight ? styles.entityHighlight : ''} ${isCelebrate ? styles.entityCelebrate : ''}`}
      >
        <Illustration level={level} highlight={isHighlight} />
      </g>
    );
  };

  return (
    <div className={styles.scene}>
      <svg
        viewBox="0 0 400 300"
        className={styles.svg}
        preserveAspectRatio="xMidYMid slice"
        aria-label="Courtyard"
      >
        <SceneBackdrop />
        {renderSlot('home', HouseIllustration)}
        {renderSlot('pet', PetIllustration)}
        {renderSlot('car', VehicleIllustration)}
        {celebrate && (
          <g className={styles.sparkBurst}>
            <circle cx="200" cy="160" r="80" fill="rgba(255,215,0,0.25)" />
            <circle cx="160" cy="140" r="40" fill="rgba(255,255,255,0.2)" />
            <circle cx="240" cy="150" r="50" fill="rgba(255,180,50,0.2)" />
          </g>
        )}
      </svg>
      <div className={styles.frame} aria-hidden />
    </div>
  );
}
