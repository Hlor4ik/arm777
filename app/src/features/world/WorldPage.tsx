import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/useT';
import { useProgressStore } from '../../store/progressStore';
import {
  getUpgradeCost,
  getUpgradeDisplay,
  UPGRADE_CONFIG,
  type UpgradeTrack,
} from '../../engine/gamification';
import { Button } from '../../components/Button/Button';
import { haptic } from '../../hooks/useTelegramBackButton';
import styles from './WorldPage.module.css';

const TRACKS: UpgradeTrack[] = ['home', 'pet', 'car'];

export function WorldPage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const game = useProgressStore((s) => s.game);
  const buyUpgrade = useProgressStore((s) => s.buyUpgrade);

  const handleBuy = (track: UpgradeTrack) => {
    const ok = buyUpgrade(track);
    haptic(ok ? 'success' : 'error');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.flagStripe} />
        <h1 className={styles.title}>{t('game.worldTitle')}</h1>
        <p className={styles.subtitle}>{t('game.worldSubtitle')}</p>
      </header>

      <div className={styles.starsBar}>
        <span className={styles.starsIcon}>⭐</span>
        <span className={styles.starsCount}>{game.stars}</span>
        <span className={styles.starsLabel}>{t('game.stars')}</span>
      </div>

      <div className={styles.scene}>
        <div className={styles.sceneItem}>
          {UPGRADE_CONFIG.home.levels[Math.max(0, game.upgrades.home - 1)]?.emoji ?? '🌄'}
        </div>
        <div className={styles.sceneRow}>
          <span>{UPGRADE_CONFIG.pet.levels[Math.max(0, game.upgrades.pet - 1)]?.emoji ?? '❓'}</span>
          <span>{UPGRADE_CONFIG.car.levels[Math.max(0, game.upgrades.car - 1)]?.emoji ?? '❓'}</span>
        </div>
      </div>

      <div className={styles.tracks}>
        {TRACKS.map((track) => {
          const cfg = UPGRADE_CONFIG[track];
          const level = game.upgrades[track];
          const cost = getUpgradeCost(track, level);
          const maxed = cost === null;
          const next = cfg.levels[level];

          return (
            <div key={track} className={styles.trackCard}>
              <div className={styles.trackHead}>
                <span className={styles.trackIcon}>{cfg.icon}</span>
                <div>
                  <h3>{lang === 'ru' ? cfg.titleRu : cfg.titleEn}</h3>
                  <p className={styles.levelName}>
                    {getUpgradeDisplay(track, level, lang)}
                    {next && !maxed && ` → ${lang === 'ru' ? next.nameRu : next.nameEn}`}
                  </p>
                </div>
              </div>
              {!maxed && next && (
                <Button fullWidth onClick={() => handleBuy(track)}>
                  {t('game.upgrade')} · ⭐ {cost}
                </Button>
              )}
              {maxed && <p className={styles.maxed}>{t('game.maxLevel')}</p>}
            </div>
          );
        })}
      </div>

      <Button variant="ghost" fullWidth onClick={() => navigate('/progress')}>
        {t('game.backProgress')}
      </Button>
    </div>
  );
}
