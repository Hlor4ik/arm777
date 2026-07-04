import type { UpgradeTrack } from '../../../engine/gamification';
import {
  getUpgradeCost,
} from '../../../engine/gamification';
import { Button } from '../../../components/Button/Button';
import { ProgressBar } from '../../../components/ProgressBar/ProgressBar';
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

const TRACK_LABELS = {
  home: { ru: 'Дом', en: 'Home', icon: '🏠' },
  pet: { ru: 'Питомец', en: 'Pet', icon: '🐑' },
  car: { ru: 'Транспорт', en: 'Vehicle', icon: '🚗' },
} as const;

export function UpgradeDock({
  lang,
  stars,
  upgrades,
  activeTrack,
  onSelectTrack,
  onUpgrade,
  labels,
}: UpgradeDockProps) {
  const level = upgrades[activeTrack];
  const cost = getUpgradeCost(activeTrack, level);
  const maxed = cost === null;
  const canAfford = cost !== null && stars >= cost;
  const yardLevel = upgrades.home + upgrades.pet + upgrades.car + 1;
  const yardProgress = maxed ? 100 : Math.min(100, Math.round((stars / (cost! + stars)) * 100));
  const yardCurrent = maxed ? 1000 : Math.min(999, stars);
  const yardTarget = maxed ? 1000 : cost! + stars;

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        {TRACKS.map((track) => {
          const isActive = track === activeTrack;
          const meta = TRACK_LABELS[track];
          return (
            <button
              key={track}
              type="button"
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              onClick={() => onSelectTrack(track)}
            >
              <span className={styles.tabIcon}>{meta.icon}</span>
              <span className={styles.tabName}>{lang === 'ru' ? meta.ru : meta.en}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.levelBlock}>
          <div className={styles.levelCircle}>{yardLevel}</div>
          <div className={styles.levelInfo}>
            <span className={styles.levelTitle}>
              {lang === 'ru' ? 'Уровень двора' : 'Courtyard level'}
            </span>
            <ProgressBar value={yardProgress} className={styles.levelBar} />
            <span className={styles.levelMeta}>
              {maxed ? labels.maxLevel : `${yardCurrent} / ${yardTarget}`}
            </span>
          </div>
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
