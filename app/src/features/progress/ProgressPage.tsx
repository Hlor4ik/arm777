import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoldersMeta, loadWords } from '../../data/loaders';
import { WORLD_ASSETS } from '../../assets/world';
import { ALL_STUDY_FOLDER_IDS } from '../../data/folders';
import { getFolderStats, getReadiness } from '../../engine/progress';
import { useProgressStore } from '../../store/progressStore';
import { useT } from '../../i18n/useT';
import { OrnateFrame } from '../../components/ui/OrnateFrame';
import styles from './ProgressPage.module.css';

const BAR_COLORS = ['#8fb88f', '#d4a853', '#9aab6e', '#c98a4a', '#b85c5c'];

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
      const ready: { id: string; name: string; pct: number }[] = [];

      for (const f of wordFolders) {
        const words = await loadWords(f.id);
        const stats = getFolderStats(words, progress.wordProgress);
        learned += stats.learned;
        inProgress += stats.inProgress;
        weak += stats.weak;
        ready.push({
          id: f.id,
          name: lang === 'ru' ? f.nameRu : f.nameEn,
          pct: getReadiness(f.id, words, progress.wordProgress),
        });
      }

      setTotals({ learned, inProgress, weak, total: learned + inProgress + weak });
      setReadinessList(ready.sort((a, b) => b.pct - a.pct));
    })();
  }, [progress.openedFolders, progress.wordProgress, lang]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('progress.title')}</h1>
        <div className={styles.headerIcon} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4a853" strokeWidth="1.6">
            <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
          </svg>
        </div>
      </header>

      <OrnateFrame className={styles.streakCard}>
        <div className={styles.streakInner}>
          <div>
            <div className={styles.streakLine}>
              <span className={styles.streakNum}>{progress.streak.current}</span>
              <span className={styles.streakDays}>{t('progress.streakDays')}</span>
            </div>
            <p className={styles.streakEncourage}>{t('progress.streakEncourage')}</p>
          </div>
          <div className={styles.streakFlame} aria-hidden>🔥</div>
        </div>
      </OrnateFrame>

      <button type="button" className={styles.worldCard} onClick={() => navigate('/world')}>
        <div
          className={styles.worldPreview}
          style={{ backgroundImage: `url(${WORLD_ASSETS.courtyardBg})` }}
        />
        <div className={styles.worldInfo}>
          <span className={styles.worldTitle}>{t('game.toWorld')}</span>
          <div className={styles.worldStars}>
            <span className={styles.worldStarIcon}>★</span>
            {progress.game.stars.toLocaleString()}
          </div>
          <span className={styles.worldCta}>{t('game.openWorld')} →</span>
        </div>
      </button>

      <div className={styles.stats}>
        <Stat icon="📖" label={t('progress.learned')} value={totals.learned} tone="green" />
        <Stat icon="⏱" label={t('progress.inProgress')} value={totals.inProgress} tone="brown" />
        <Stat icon="🎯" label={t('progress.weak')} value={totals.weak} tone="red" />
      </div>

      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{t('progress.byTopics')}</h2>
        <span className={styles.sectionLink}>{t('progress.moreDetails')} →</span>
      </div>

      <div className={styles.list}>
        {readinessList.map((item, i) => (
          <div key={item.id} className={styles.item}>
            <span className={styles.itemIcon}>{topicIcon(item.id)}</span>
            <div className={styles.itemBody}>
              <div className={styles.itemTop}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemPct}>{item.pct}%</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${item.pct}%`,
                    background: BAR_COLORS[i % BAR_COLORS.length],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: number;
  tone: 'green' | 'brown' | 'red';
}) {
  return (
    <div className={`${styles.stat} ${styles[`stat_${tone}`]}`}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}

function topicIcon(id: string) {
  const icons: Record<string, string> = {
    greetings: '🏛',
    food: '🍇',
    travel: '🏔',
    family: '👥',
    grammar: '✍',
  };
  return icons[id] ?? '📚';
}
