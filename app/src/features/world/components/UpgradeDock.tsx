import type { UpgradeTrack } from '../../../engine/gamification';
import { getUpgradeCost } from '../../../engine/gamification';
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
  home: { ru: 'Дом', en: 'Home' },
  pet: { ru: 'Питомец', en: 'Pet' },
  car: { ru: 'Транспорт', en: 'Vehicle' },
} as const;

function TrackIcon({ track, active }: { track: UpgradeTrack; active: boolean }) {
  const c = active ? '#d4a853' : '#8a8580';
  const sw = 1.5;

  if (track === 'home') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      </svg>
    );
  }

  if (track === 'pet') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <ellipse cx="8" cy="10" rx="2" ry="2.5" fill={c} />
        <ellipse cx="16" cy="10" rx="2" ry="2.5" fill={c} />
        <ellipse cx="5" cy="14" rx="1.8" ry="2.2" fill={c} />
        <ellipse cx="19" cy="14" rx="1.8" ry="2.2" fill={c} />
        <ellipse cx="12" cy="15" rx="4" ry="3.5" fill={c} />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 17h14l-1-7H6l-1 7Z" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M7 10l1-3h8l1 3M6 17v2M18 17v2" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      <circle cx="7" cy="19" r="1.5" fill={c} />
      <circle cx="17" cy="19" r="1.5" fill={c} />
    </svg>
  );
}

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
  const yardCurrent = maxed ? 1000 : Math.min(999, stars);
  const yardTarget = maxed ? 1000 : cost! + stars;
  const yardProgress = maxed ? 100 : Math.min(100, Math.round((yardCurrent / yardTarget) * 100));

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
              <TrackIcon track={track} active={isActive} />
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
