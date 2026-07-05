import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoldersMeta, loadWords } from '../../data/loaders';
import { ALL_STUDY_FOLDER_IDS } from '../../data/folders';
import type { StudyModeId } from '../../data/types';
import { getReadiness } from '../../engine/progress';
import { getModeTitle } from '../../engine/questions';
import { useProgressStore } from '../../store/progressStore';
import { useT } from '../../i18n/useT';
import { OrnateFrame } from '../../components/ui/OrnateFrame';
import styles from './HomePage.module.css';

const TOPIC_DESC: Record<string, { ru: string; en: string }> = {
  greetings: {
    ru: 'Научитесь уверенно приветствовать и знакомиться на армянском',
    en: 'Learn to confidently greet and introduce yourself in Armenian',
  },
};

export function HomePage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const progress = useProgressStore();
  const [readiness, setReadiness] = useState(0);
  const [topicName, setTopicName] = useState('');
  const [topicId, setTopicId] = useState('');
  const [lessonNum, setLessonNum] = useState(1);

  useEffect(() => {
    (async () => {
      const meta = await getFoldersMeta();
      const folders = meta.filter((f) => !f.isAlphabet).sort((a, b) => a.order - b.order);

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

      const avg = count > 0 ? Math.round(totalPct / count) : 0;
      setReadiness(avg);
      if (current) {
        setTopicId(current.id);
        setTopicName(lang === 'ru' ? current.nameRu : current.nameEn);
        setLessonNum(Math.max(1, Math.round((avg / 100) * 8)));
      }
    })();
  }, [progress.openedFolders, progress.wordProgress, lang]);

  const continueMode = (progress.lastModeId || 'flashcards') as StudyModeId;
  const dailyMinutes = Math.min(30, Math.round(Object.keys(progress.wordProgress).length / 3));
  const dailyGoal = 30;
  const dailyRemain = Math.max(0, dailyGoal - dailyMinutes);

  const topicDesc =
    TOPIC_DESC[topicId]?.[lang] ??
    (lang === 'ru'
      ? `Изучайте тему «${topicName}» и закрепляйте слова в режимах`
      : `Study "${topicName}" and reinforce words in practice modes`);

  const continueSubtitle =
    lang === 'ru'
      ? `Урок ${lessonNum} • ${getModeTitle(continueMode, lang)}`
      : `Lesson ${lessonNum} • ${getModeTitle(continueMode, lang)}`;

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
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden />
        <header className={styles.header}>
          <div>
            <h1 className={styles.welcome}>{t('home.greeting')}</h1>
            <p className={styles.subtitle}>
              {t('home.subtitle')}
              <span className={styles.dot} aria-hidden> ·</span>
            </p>
          </div>
          <div className={styles.flameBadge} aria-hidden>
            <span>🔥</span>
          </div>
        </header>
      </section>

      <OrnateFrame className={styles.topicFrame}>
        <div className={styles.topicRow}>
          <div className={styles.ringWrap}>
            <svg className={styles.ring} viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" className={styles.ringTrack} />
              <circle
                cx="48"
                cy="48"
                r="40"
                className={styles.ringFill}
                style={{
                  strokeDasharray: `${2 * Math.PI * 40}`,
                  strokeDashoffset: `${2 * Math.PI * 40 * (1 - readiness / 100)}`,
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
              <span className={styles.diamond}>✦</span>
              {t('home.continueTopic')}
              <span className={styles.diamond}>✦</span>
            </p>
            <h2 className={styles.topicName}>{topicName || '—'}</h2>
            <p className={styles.topicDesc}>{topicDesc}</p>
          </div>
        </div>
      </OrnateFrame>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🔥</span>
          <div className={styles.statBody}>
            <div className={styles.statLine}>
              <span className={styles.statNum}>{progress.streak.current}</span>
              <span className={styles.statUnit}>{lang === 'ru' ? 'дней' : 'days'}</span>
            </div>
            <div className={styles.statHint}>{t('home.streakHint')}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statBody}>
            <div className={styles.statLine}>
              <span className={styles.statNum}>{progress.game.stars.toLocaleString()}</span>
              <span className={styles.statStar}>★</span>
            </div>
            <div className={styles.statHint}>{t('home.starsHint')}</div>
          </div>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button type="button" className={styles.continueCard} onClick={handleContinue}>
          <div className={styles.continueTop}>
            <span className={styles.bookIcon}>📖</span>
          </div>
          <div className={styles.continueText}>
            <div className={styles.continueTitle}>{t('home.continueShort')}</div>
            <div className={styles.continueMeta}>{continueSubtitle}</div>
          </div>
          <span className={styles.continueArrow}>→</span>
          <div className={styles.khachkar} aria-hidden />
        </button>

        <div className={styles.goalCard}>
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
            ⏱ {dailyRemain} {t('home.minLeft')}
          </div>
        </div>
      </div>
    </div>
  );
}
