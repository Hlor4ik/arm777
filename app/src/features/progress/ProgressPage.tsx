import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoldersMeta, loadWords } from '../../data/loaders';
import { ALL_STUDY_FOLDER_IDS } from '../../data/folders';
import { getFolderStats, getReadiness } from '../../engine/progress';
import { useProgressStore } from '../../store/progressStore';
import { useT } from '../../i18n/useT';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import styles from './ProgressPage.module.css';

export function ProgressPage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const progress = useProgressStore();
  const [totals, setTotals] = useState({ learned: 0, inProgress: 0, weak: 0, total: 0 });
  const [readinessList, setReadinessList] = useState<{ id: string; name: string; pct: number }[]>([]);

  useEffect(() => {
    (async () => {
      const meta = await getFoldersMeta();
      const wordFolders = meta.filter(
        (f) => !f.isAlphabet && (progress.openedFolders.includes(f.id) || ALL_STUDY_FOLDER_IDS.includes(f.id as (typeof ALL_STUDY_FOLDER_IDS)[number]))
      );

      let learned = 0;
      let inProgress = 0;
      let weak = 0;
      let total = 0;
      const ready: { id: string; name: string; pct: number }[] = [];

      for (const f of wordFolders) {
        const words = await loadWords(f.id);
        const stats = getFolderStats(words, progress.wordProgress);
        learned += stats.learned;
        inProgress += stats.inProgress;
        weak += stats.weak;
        total += stats.total;
        ready.push({
          id: f.id,
          name: lang === 'ru' ? f.nameRu : f.nameEn,
          pct: getReadiness(f.id, words, progress.wordProgress),
        });
      }

      setTotals({ learned, inProgress, weak, total });
      setReadinessList(ready);
    })();
  }, [progress.openedFolders, progress.wordProgress, lang]);

  return (
    <div className="screen">
      <div className="flagStripe" />
      <h1 className="screenTitle">{t('progress.title')}</h1>

      <div className={styles.streak}>
        <span className={styles.streakIcon}>🔥</span>
        <div>
          <div className={styles.streakNum}>{progress.streak.current}</div>
          <div className={styles.streakLabel}>{t('progress.streak')}</div>
        </div>
      </div>

      <button type="button" className={styles.worldCard} onClick={() => navigate('/world')}>
        <div className={styles.worldLeft}>
          <span className={styles.worldIcon}>⭐</span>
          <div>
            <div className={styles.worldStars}>{progress.game.stars}</div>
            <div className={styles.worldLabel}>{t('progress.stars')}</div>
          </div>
        </div>
        <span className={styles.worldCta}>{t('game.openWorld')} →</span>
      </button>

      <div className={styles.stats}>
        <Stat label={t('progress.learned')} value={totals.learned} />
        <Stat label={t('progress.inProgress')} value={totals.inProgress} />
        <Stat label={t('progress.weak')} value={totals.weak} />
      </div>

      <h2 className={styles.sectionTitle}>{t('progress.readiness')}</h2>
      <div className={styles.list}>
        {readinessList.map((item) => (
          <div key={item.id} className={styles.item}>
            <span>{item.name}</span>
            <div className={styles.barWrap}>
              <ProgressBar value={item.pct} />
              <span>{item.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
