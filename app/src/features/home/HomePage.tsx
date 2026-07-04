import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoldersMeta, loadWords } from '../../data/loaders';
import { ALL_STUDY_FOLDER_IDS } from '../../data/folders';
import type { StudyModeId } from '../../data/types';
import { getReadiness } from '../../engine/progress';
import { getModeTitle } from '../../engine/questions';
import { useProgressStore } from '../../store/progressStore';
import { useT } from '../../i18n/useT';
import { Button } from '../../components/Button/Button';
import styles from './HomePage.module.css';

export function HomePage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const progress = useProgressStore();
  const [readiness, setReadiness] = useState(0);
  const [topicName, setTopicName] = useState('');

  useEffect(() => {
    (async () => {
      const meta = await getFoldersMeta();
      const folders = meta
        .filter((f) => !f.isAlphabet)
        .sort((a, b) => a.order - b.order);

      let totalPct = 0;
      let count = 0;
      let lowestOpen = folders.find(
        (f) =>
          progress.openedFolders.includes(f.id) ||
          ALL_STUDY_FOLDER_IDS.includes(f.id as (typeof ALL_STUDY_FOLDER_IDS)[number])
      );

      for (const f of folders) {
        const isOpen =
          progress.openedFolders.includes(f.id) ||
          ALL_STUDY_FOLDER_IDS.includes(f.id as (typeof ALL_STUDY_FOLDER_IDS)[number]);
        if (!isOpen) continue;
        const words = await loadWords(f.id);
        const pct = getReadiness(f.id, words, progress.wordProgress);
        totalPct += pct;
        count += 1;
        if (lowestOpen && f.id === lowestOpen.id && pct < 100) {
          lowestOpen = f;
        }
      }

      setReadiness(count > 0 ? Math.round(totalPct / count) : 0);
      if (lowestOpen) {
        setTopicName(lang === 'ru' ? lowestOpen.nameRu : lowestOpen.nameEn);
      }
    })();
  }, [progress.openedFolders, progress.wordProgress, lang]);

  const continueMode = (progress.lastModeId || 'flashcards') as StudyModeId;

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
      <div className={styles.ornamentDivider} />
      <p className={styles.greeting}>{t('home.greeting')}</p>
      <h1 className={styles.title}>{t('home.title')}</h1>

      <div className={styles.heroCard}>
        <div className={styles.ringWrap}>
          <svg className={styles.ring} viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" className={styles.ringTrack} />
            <circle
              cx="40"
              cy="40"
              r="34"
              className={styles.ringFill}
              style={{
                strokeDasharray: `${2 * Math.PI * 34}`,
                strokeDashoffset: `${2 * Math.PI * 34 * (1 - readiness / 100)}`,
              }}
            />
          </svg>
          <span className={styles.ringValue}>{readiness}%</span>
        </div>
        <div className={styles.heroInfo}>
          <span className={styles.heroLabel}>{t('home.continueTopic')}</span>
          <span className={styles.heroTopic}>{topicName || '—'}</span>
          <span className={styles.heroMode}>{getModeTitle(continueMode, lang)}</span>
          <Button fullWidth onClick={handleContinue} className={styles.continueBtn}>
            {t('home.continue')}
          </Button>
        </div>
      </div>

      <div className={styles.chips}>
        <div className={styles.chip}>
          <span className={styles.chipIcon}>🔥</span>
          <div>
            <div className={styles.chipValue}>{progress.streak.current}</div>
            <div className={styles.chipLabel}>{t('progress.streak')}</div>
          </div>
        </div>
        <div className={styles.chip}>
          <span className={styles.chipIcon}>★</span>
          <div>
            <div className={styles.chipValue}>{progress.game.stars.toLocaleString()}</div>
            <div className={styles.chipLabel}>{t('progress.stars')}</div>
          </div>
        </div>
      </div>

      <div className={styles.quickRow}>
        <button type="button" className={styles.quickCard} onClick={() => navigate('/modes')}>
          <span className={styles.quickTitle}>{t('home.allModes')}</span>
          <span className={styles.quickHint}>{t('home.allModesHint')}</span>
        </button>
        <button type="button" className={styles.quickCard} onClick={() => navigate('/world')}>
          <span className={styles.quickTitle}>{t('game.toWorld')}</span>
          <span className={styles.quickHint}>{t('home.worldHint')}</span>
        </button>
      </div>
    </div>
  );
}
