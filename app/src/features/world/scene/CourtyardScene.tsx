import type { UpgradeTrack } from '../../../engine/gamification';
import { WORLD_ASSETS, getTrackAsset } from '../../../assets/world';
import styles from './CourtyardScene.module.css';

interface CourtyardSceneProps {
  upgrades: Record<UpgradeTrack, number>;
  highlight?: UpgradeTrack | null;
  celebrate?: UpgradeTrack | null;
}

export function CourtyardScene({ upgrades, highlight, celebrate }: CourtyardSceneProps) {
  const homeSrc = getTrackAsset('home', upgrades.home);
  const petSrc = getTrackAsset('pet', upgrades.pet);
  const carSrc = getTrackAsset('car', upgrades.car);

  return (
    <div className={styles.scene} style={{ backgroundImage: `url(${WORLD_ASSETS.courtyardBg})` }}>
      <div className={styles.skyGlow} />
      <div className={styles.clouds}>
        <span className={styles.cloud} style={{ top: '8%', left: '-10%', animationDelay: '0s' }} />
        <span className={styles.cloud} style={{ top: '14%', left: '40%', animationDelay: '-8s', opacity: 0.7 }} />
        <span className={styles.cloud} style={{ top: '6%', left: '70%', animationDelay: '-14s', opacity: 0.85 }} />
      </div>

      <div className={styles.groundShadow} />

      <div
        className={`${styles.slot} ${styles.homeSlot} ${highlight === 'home' ? styles.highlight : ''} ${celebrate === 'home' ? styles.celebrate : ''}`}
      >
        {homeSrc ? (
          <img src={homeSrc} alt="" className={styles.homeImg} draggable={false} />
        ) : (
          <div className={styles.emptyPlot}>
            <span className={styles.plotMarker} />
            <span className={styles.plotLabel}>+</span>
          </div>
        )}
      </div>

      <div
        className={`${styles.slot} ${styles.petSlot} ${highlight === 'pet' ? styles.highlight : ''} ${celebrate === 'pet' ? styles.celebrate : ''}`}
      >
        {petSrc ? (
          <img src={petSrc} alt="" className={styles.petImg} draggable={false} />
        ) : (
          <div className={styles.emptyPet}>
            <span className={styles.petShadow} />
          </div>
        )}
      </div>

      <div
        className={`${styles.slot} ${styles.carSlot} ${highlight === 'car' ? styles.highlight : ''} ${celebrate === 'car' ? styles.celebrate : ''}`}
      >
        {carSrc ? (
          <img src={carSrc} alt="" className={styles.carImg} draggable={false} />
        ) : (
          <div className={styles.emptyDriveway}>
            <span className={styles.driveLine} />
          </div>
        )}
      </div>

      {celebrate && <div className={styles.sparkBurst} aria-hidden />}
      <div className={styles.vignette} />
    </div>
  );
}
