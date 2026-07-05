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

function FlameIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 28" fill="none" aria-hidden>
      <path
        d="M12 2c0 6-6 8-6 14a6 6 0 1 0 12 0c0-4-4-6-4-10 0 2 2 3 2 5 0-3-2-5-4-9Z"
        fill="url(#homeFlameGrad)"
      />
      <defs>
        <linearGradient id="homeFlameGrad" x1="12" y1="2" x2="12" y2="26">
          <stop stopColor="#ffd080" />
          <stop offset="0.5" stopColor="#e8943a" />
          <stop offset="1" stopColor="#c86020" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 4h9a3 3 0 0 1 3 3v14l-3-2-3 2-3-2-3 2V7a3 3 0 0 1 3-3Z"
        stroke="#3a2408"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 4v14" stroke="#3a2408" strokeWidth="1.4" />
    </svg>
  );
}

function KhachkarIcon() {
  return (
    <svg className={styles.khachkarSvg} viewBox="0 0 60 100" fill="none" aria-hidden>
      <rect x="24" y="0" width="12" height="100" fill="#2a1808" opacity="0.9" />
      <rect x="8" y="10" width="44" height="7" fill="#2a1808" opacity="0.85" />
      <rect x="4" y="26" width="52" height="5" fill="#2a1808" opacity="0.8" />
      <rect x="10" y="40" width="40" height="4" fill="#2a1808" opacity="0.75" />
      <circle cx="30" cy="58" r="9" stroke="#2a1808" strokeWidth="2" opacity="0.8" />
      <path d="M30 22v14M22 36h16" stroke="#2a1808" strokeWidth="1.5" opacity="0.7" />
      <rect x="12" y="72" width="36" height="4" fill="#2a1808" opacity="0.7" />
    </svg>
  );
}

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

  const ringR = 44;
  const ringLen = 2 * Math.PI * ringR;

  return (
    <div className={styles.page}>
      <section className={styles.blockHero}>
        <div className={styles.araratSilhouette} aria-hidden />
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.welcome}>{t('home.greeting')}</h1>
            <p className={styles.subtitle}>
              {t('home.subtitle')}
              <span className={styles.dot} aria-hidden> ·</span>
            </p>
          </div>
          <div className={styles.flameBadge}>
            <FlameIcon size={22} />
          </div>
        </header>
      </section>

      <OrnateFrame className={styles.blockTopic}>
        <div className={styles.topicRow}>
          <div className={styles.ringWrap}>
            <svg className={styles.ring} viewBox="0 0 108 108">
              <circle cx="54" cy="54" r={ringR} className={styles.ringTrack} />
              <circle
                cx="54"
                cy="54"
                r={ringR}
                className={styles.ringFill}
                style={{
                  strokeDasharray: ringLen,
                  strokeDashoffset: ringLen * (1 - readiness / 100),
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
              <span className={styles.diamond}>◆</span>
              {t('home.continueTopic')}
              <span className={styles.diamond}>◆</span>
            </p>
            <h2 className={styles.topicName}>{topicName || '—'}</h2>
            <p className={styles.topicDesc}>{topicDesc}</p>
          </div>
        </div>
      </OrnateFrame>

      <section className={styles.blockStats}>
        <div className={`${styles.statCard} ${styles.statCardStreak}`}>
          <FlameIcon size={24} />
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
      </section>

      <section className={styles.blockActions}>
        <button type="button" className={styles.continueCard} onClick={handleContinue}>
          <span className={styles.bookCircle}>
            <BookIcon />
          </span>
          <KhachkarIcon />
          <div className={styles.continueText}>
            <div className={styles.continueTitle}>{t('home.continueShort')}</div>
            <div className={styles.continueMeta}>{continueSubtitle}</div>
          </div>
          <span className={styles.arrowCircle} aria-hidden>→</span>
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
            <span className={styles.clockIcon} aria-hidden>🕒</span>
            {dailyRemain} {t('home.minLeft')}
          </div>
        </div>
      </section>
    </div>
  );
}
