import type { UpgradeTrack } from '../../../engine/gamification';
import {
  getUpgradeCost,
  getUpgradeDisplay,
  UPGRADE_CONFIG,
} from '../../../engine/gamification';
import { IllustrationPreview } from '../illustrations';
import { Button } from '../../../components/Button/Button';
import { StarSvg } from '../illustrations/StarSvg';
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
  const previewCurrent = Math.max(level, 0);
  const previewNext = Math.min(level + 1, cfg.levels.length);

  return (
    <div className={styles.dock}>
      <div className={styles.tabs}>
        {TRACKS.map((track) => {
          const trackCfg = UPGRADE_CONFIG[track];
          const isActive = track === activeTrack;
          const trackMaxed = getUpgradeCost(track, upgrades[track]) === null;
          const thumbLevel = upgrades[track] || 1;

          return (
            <button
              key={track}
              type="button"
              className={`${styles.tab} ${isActive ? styles.tabActive : ''} ${trackMaxed ? styles.tabMaxed : ''}`}
              onClick={() => onSelectTrack(track)}
            >
              <IllustrationPreview track={track} level={thumbLevel} size={52} />
              <span className={styles.tabName}>{lang === 'ru' ? trackCfg.titleRu : trackCfg.titleEn}</span>
              <span className={styles.tabLevel}>{upgrades[track]}/{trackCfg.levels.length}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.panel}>
        <div className={styles.previewRow}>
          <div className={styles.previewBox}>
            <IllustrationPreview track={activeTrack} level={previewCurrent} size={80} />
            <span className={styles.previewCaption}>
              {getUpgradeDisplay(activeTrack, level, lang)}
            </span>
          </div>

          {!maxed && (
            <>
              <span className={styles.arrow}>→</span>
              <div className={`${styles.previewBox} ${styles.previewNext}`}>
                <IllustrationPreview track={activeTrack} level={previewNext} size={80} />
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
          <Button fullWidth disabled={!canAfford} onClick={() => onUpgrade(activeTrack)} className={styles.upgradeBtn}>
            <span className={styles.upgradeLabel}>
              {labels.upgrade}
              <span className={styles.upgradeCost}>
                <StarSvg size={18} />
                {cost}
              </span>
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
