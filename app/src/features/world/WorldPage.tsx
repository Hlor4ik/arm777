import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/useT';
import { useProgressStore } from '../../store/progressStore';
import type { UpgradeTrack } from '../../engine/gamification';
import { haptic } from '../../hooks/useTelegramBackButton';
import { StarHud } from './components/StarHud';
import { UpgradeDock } from './components/UpgradeDock';
import { CourtyardScene } from './scene/CourtyardScene';
import styles from './WorldPage.module.css';

export function WorldPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const game = useProgressStore((s) => s.game);
  const buyUpgrade = useProgressStore((s) => s.buyUpgrade);
  const lang = useProgressStore((s) => s.settings.baseLang);

  const [activeTrack, setActiveTrack] = useState<UpgradeTrack>('home');
  const [celebrate, setCelebrate] = useState<UpgradeTrack | null>(null);

  useEffect(() => {
    if (!celebrate) return;
    const id = window.setTimeout(() => setCelebrate(null), 900);
    return () => window.clearTimeout(id);
  }, [celebrate]);

  const handleUpgrade = useCallback(
    (track: UpgradeTrack) => {
      const ok = buyUpgrade(track);
      haptic(ok ? 'success' : 'error');
      if (ok) {
        setActiveTrack(track);
        setCelebrate(track);
      }
    },
    [buyUpgrade]
  );

  return (
    <div className={styles.page}>
      <div className={styles.sceneStage}>
        <CourtyardScene
          upgrades={game.upgrades}
          highlight={activeTrack}
          celebrate={celebrate}
        />
        <div className={styles.topOverlay}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate('/progress')}
            aria-label={t('game.backProgress')}
          >
            ‹
          </button>
          <StarHud stars={game.stars} label={t('game.stars')} />
        </div>
      </div>

      <div className={styles.bottomHud}>
        <UpgradeDock
          lang={lang}
          stars={game.stars}
          upgrades={game.upgrades}
          activeTrack={activeTrack}
          onSelectTrack={setActiveTrack}
          onUpgrade={handleUpgrade}
          labels={{
            upgrade: t('game.upgrade'),
            maxLevel: t('game.maxLevel'),
            notOwned: lang === 'ru' ? 'Не куплено' : 'Not owned',
          }}
        />
      </div>
    </div>
  );
}
