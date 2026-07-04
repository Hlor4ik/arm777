import type { UpgradeTrack } from '../../../engine/gamification';
import {
  getUpgradeCost,
  getUpgradeDisplay,
  UPGRADE_CONFIG,
} from '../../../engine/gamification';
import { getNextTrackAsset, getTrackAsset } from '../../../assets/world';
import { Button } from '../../../components/Button/Button';
import styles from './UpgradeDock.module.css';

interface UpgradeDockProps {
  lang: 'ru' | 'en';
  stars: number;
  upgrades: Record<UpgradeTrack, number>;
  activeTrack: UpgradeTrack;
  onSelectTrack: (track: UpgradeTrack) => void;
  onUpgrade: (track: UpgradeTrack) => void;
  labels: {
    upgrade: string;
    maxLevel: string;
    notOwned: string;
  };
}

const TRACKS: UpgradeTrack[] = ['home', 'pet', 'car'];

export function UpgradeDock({
  lang,
  stars,
  upgrades,
  activeTrack,
  onSelectTrack,
  onUpgrade,
  labels,
}: UpgradeDockProps) {
  const cfg = UPGRADE_CONFIG[activeTrack];
  const level = upgrades[activeTrack];
  const cost = getUpgradeCost(activeTrack, level);
  const maxed = cost === null;
  const next = cfg.levels[level];
  const currentImg = getTrackAsset(activeTrack, level);
  const nextImg = getNextTrackAsset(activeTrack, level);
  const canAfford = cost !== null && stars >= cost;

  return (
    <div className={styles.dock}>
      <div className={styles.tabs}>
        {TRACKS.map((track) => {
          const trackCfg = UPGRADE_CONFIG[track];
          const thumb = getTrackAsset(track, upgrades[track]) ?? getNextTrackAsset(track, upgrades[track]);
          const isActive = track === activeTrack;
          const trackMaxed = getUpgradeCost(track, upgrades[track]) === null;

          return (
            <button
              key={track}
              type="button"
              className={`${styles.tab} ${isActive ? styles.tabActive : ''} ${trackMaxed ? styles.tabMaxed : ''}`}
              onClick={() => onSelectTrack(track)}
            >
              {thumb ? (
                <img src={thumb} alt="" className={styles.tabImg} draggable={false} />
              ) : (
                <span className={styles.tabPlaceholder}>+</span>
              )}
              <span className={styles.tabName}>{lang === 'ru' ? trackCfg.titleRu : trackCfg.titleEn}</span>
              <span className={styles.tabLevel}>{upgrades[track]}/{trackCfg.levels.length}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.panel}>
        <div className={styles.previewRow}>
          <div className={styles.previewBox}>
            {currentImg ? (
              <img src={currentImg} alt="" className={styles.previewImg} draggable={false} />
            ) : (
              <span className={styles.previewEmpty}>?</span>
            )}
            <span className={styles.previewCaption}>
              {getUpgradeDisplay(activeTrack, level, lang)}
            </span>
          </div>

          {!maxed && nextImg && (
            <>
              <span className={styles.arrow}>→</span>
              <div className={`${styles.previewBox} ${styles.previewNext}`}>
                <img src={nextImg} alt="" className={styles.previewImg} draggable={false} />
                <span className={styles.previewCaption}>
                  {lang === 'ru' ? next!.nameRu : next!.nameEn}
                </span>
              </div>
            </>
          )}
        </div>

        {maxed ? (
          <p className={styles.maxed}>{labels.maxLevel}</p>
        ) : (
          <Button
            fullWidth
            disabled={!canAfford}
            onClick={() => onUpgrade(activeTrack)}
            className={styles.upgradeBtn}
          >
            {labels.upgrade} · {cost} ★
          </Button>
        )}
      </div>
    </div>
  );
}
