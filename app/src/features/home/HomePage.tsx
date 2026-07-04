import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoldersMeta, loadWords } from '../../data/loaders';
import { ALL_STUDY_FOLDER_IDS } from '../../data/folders';
import type { StudyModeId } from '../../data/types';
import { getReadiness } from '../../engine/progress';
import { getModeTitle } from '../../engine/questions';
import { useProgressStore } from '../../store/progressStore';
import { useT } from '../../i18n/useT';
import styles from './HomePage.module.css';

export function HomePage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const progress = useProgressStore();
  const [readiness, setReadiness] = useState(0);
  const [topicName, setTopicName] = useState('');
  const [topicDesc, setTopicDesc] = useState('');

  useEffect(() => {
    (async () => {
      const meta = await getFoldersMeta();
      const folders = meta
        .filter((f) => !f.isAlphabet)
        .sort((a, b) => a.order - b.order);

      let totalPct = 0;
      let count = 0;
      let current: (typeof folders)[0] | undefined;
      let lowestPct = 101;

      for (const f of folders) {
        const isOpen =
          progress.openedFolders.includes(f.id) ||
          ALL_STUDY_FOLDER_IDS.includes(f.id as (typeof ALL_STUDY_FOLDER_IDS)[number]);
        if (!isOpen) continue;
        const words = await loadWords(f.id);
        const pct = getReadiness(f.id, words, progress.wordProgress);
        totalPct += pct;
        count += 1;
        if (pct < lowestPct) {
          lowestPct = pct;
          current = f;
        }
      }

      setReadiness(count > 0 ? Math.round(totalPct / count) : 0);
      if (current) {
        setTopicName(lang === 'ru' ? current.nameRu : current.nameEn);
        setTopicDesc(
          lang === 'ru'
            ? `Изучайте тему «${current.nameRu}» и закрепляйте слова в режимах`
            : `Study "${current.nameEn}" and reinforce words in practice modes`
        );
      }
    })();
  }, [progress.openedFolders, progress.wordProgress, lang]);

  const continueMode = (progress.lastModeId || 'flashcards') as StudyModeId;
  const dailyMinutes = Math.min(30, Math.round(Object.keys(progress.wordProgress).length / 3));
  const dailyGoal = 30;

  const handleContinue = () => {
    if (continueMode === 'alphabet') {
      navigate('/alphabet/letters');
      return;
    }
    if (continueMode === 'weak' || continueMode === 'marathon' || continueMode === 'speed') {
      navigate(`/study/${continueMode}/all`);
      return;
    }
    navigate(`/study/${continueMode}/pick`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.welcome}>{t('home.greeting')}</h1>
          <p className={styles.subtitle}>{t('home.subtitle')}</p>
        </div>
        <div className={styles.streakBadge} aria-hidden>
          <span className={styles.streakBadgeIcon}>🔥</span>
        </div>
      </div>

      <div className={`ornateFrame ${styles.topicFrame}`}>
        <div className={styles.topicInner}>
          <div className={styles.ringWrap}>
            <svg className={styles.ring} viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="36" className={styles.ringTrack} />
              <circle
                cx="44"
                cy="44"
                r="36"
                className={styles.ringFill}
                style={{
                  strokeDasharray: `${2 * Math.PI * 36}`,
                  strokeDashoffset: `${2 * Math.PI * 36 * (1 - readiness / 100)}`,
                }}
              />
            </svg>
            <div className={styles.ringCenter}>
              <span className={styles.ringPct}>{readiness}%</span>
              <span className={styles.ringCaption}>{t('home.completed')}</span>
            </div>
          </div>

          <div className={styles.topicInfo}>
            <p className={styles.topicLabel}>
              <span>✦</span> {t('home.continueTopic')} <span>✦</span>
            </p>
            <h2 className={styles.topicName}>{topicName || '—'}</h2>
            <p className={styles.topicDesc}>{topicDesc}</p>
          </div>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={`panelCard ${styles.statCard}`}>
          <span className={styles.statIcon}>🔥</span>
          <div>
            <div className={styles.statValue}>{progress.streak.current}</div>
            <div className={styles.statUnit}>{lang === 'ru' ? 'дней' : 'days'}</div>
            <div className={styles.statLabel}>{t('home.streakHint')}</div>
          </div>
        </div>
        <div className={`panelCard ${styles.statCard}`}>
          <span className={styles.statIcon}>★</span>
          <div>
            <div className={styles.statValue}>{progress.game.stars.toLocaleString()}</div>
            <div className={styles.statUnit}>{t('progress.stars')}</div>
            <div className={styles.statLabel}>{t('home.starsHint')}</div>
          </div>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button type="button" className={styles.continueCard} onClick={handleContinue}>
          <div className={styles.continueLeft}>
            <span className={styles.continueIcon}>📖</span>
            <div>
              <div className={styles.continueTitle}>{t('home.continueShort')}</div>
              <div className={styles.continueMeta}>
                {getModeTitle(continueMode, lang)}
                {topicName ? ` • ${topicName}` : ''}
              </div>
            </div>
          </div>
          <span className={styles.continueArrow}>→</span>
          <div className={styles.khachkar} aria-hidden />
        </button>

        <div className={`panelCard ${styles.goalCard}`}>
          <div className={styles.goalTitle}>{t('home.dailyGoal')}</div>
          <div className={styles.goalMeta}>
            {dailyMinutes} / {dailyGoal} {lang === 'ru' ? 'мин' : 'min'}
          </div>
          <div className={styles.goalTrack}>
            <div
              className={styles.goalFill}
              style={{ width: `${Math.min(100, (dailyMinutes / dailyGoal) * 100)}%` }}
            />
          </div>
          <div className={styles.goalRemain}>
            ⏱ {Math.max(0, dailyGoal - dailyMinutes)} {t('home.minLeft')}
          </div>
        </div>
      </div>
    </div>
  );
}
