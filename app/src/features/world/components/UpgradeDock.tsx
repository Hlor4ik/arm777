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
  const canAfford = cost !== null && stars >= cost;
  const trackTitle = lang === 'ru' ? cfg.titleRu : cfg.titleEn;
  const currentName = getUpgradeDisplay(activeTrack, level, lang);
  const nextName = next ? (lang === 'ru' ? next.nameRu : next.nameEn) : null;

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

      <div className={styles.actionRow}>
        <div className={styles.trackInfo}>
          <span className={styles.trackTitle}>{trackTitle}</span>
          <span className={styles.trackMeta}>
            {maxed ? (
              labels.maxLevel
            ) : (
              <>
                {currentName}
                {nextName && (
                  <>
                    <span className={styles.arrow}> → </span>
                    <span className={styles.nextName}>{nextName}</span>
                  </>
                )}
              </>
            )}
          </span>
        </div>

        {maxed ? (
          <span className={styles.maxedBadge}>✓</span>
        ) : (
          <Button
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
