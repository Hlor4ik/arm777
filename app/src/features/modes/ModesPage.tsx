import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/useT';
import { useProgressStore } from '../../store/progressStore';
import type { StudyModeId } from '../../data/types';
import { getModeTitle } from '../../engine/questions';
import { ALL_STUDY_FOLDER_IDS } from '../../data/folders';
import styles from './ModesPage.module.css';

const MODES: {
  id: StudyModeId;
  descRu: string;
  descEn: string;
  icon: string;
  accent: 'blue' | 'orange' | 'red';
  alphabet?: boolean;
}[] = [
  { id: 'alphabet', descRu: 'Буквы и слоги', descEn: 'Letters and syllables', icon: 'Ա', accent: 'orange', alphabet: true },
  { id: 'flashcards', descRu: 'Свайп и карточки', descEn: 'Swipe flashcards', icon: '⧉', accent: 'blue' },
  { id: 'choice', descRu: 'RU/EN → транскрипция', descEn: 'Pick transcription', icon: '◎', accent: 'blue' },
  { id: 'reverse-choice', descRu: 'Транскрипция → RU/EN', descEn: 'Pick translation', icon: '↺', accent: 'blue' },
  { id: 'matching', descRu: 'Пары слов', descEn: 'Match pairs', icon: '⇄', accent: 'orange' },
  { id: 'dictation', descRu: 'Напиши транскрипцию', descEn: 'Type transcription', icon: '⌨', accent: 'blue' },
  { id: 'reverse-dictation', descRu: 'Напиши перевод', descEn: 'Type translation', icon: '✎', accent: 'blue' },
  { id: 'word-builder', descRu: 'Собери слово', descEn: 'Build the word', icon: '▦', accent: 'orange' },
  { id: 'fill-blank', descRu: 'Пропуск в фразе', descEn: 'Fill the blank', icon: '…', accent: 'blue' },
  { id: 'weak', descRu: 'Сложные слова', descEn: 'Difficult words', icon: '⚡', accent: 'red' },
  { id: 'marathon', descRu: '15–20 заданий', descEn: '15–20 questions', icon: '∞', accent: 'orange' },
  { id: 'speed', descRu: '60 секунд', descEn: '60 seconds', icon: '⏱', accent: 'red' },
];

export function ModesPage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const setLastMode = useProgressStore((s) => s.setLastMode);

  const handleMode = (mode: (typeof MODES)[0]) => {
    if (mode.alphabet) {
      setLastMode(mode.id);
      navigate('/alphabet/letters');
      return;
    }
    setLastMode(mode.id);
    if (mode.id === 'weak' || mode.id === 'marathon' || mode.id === 'speed') {
      navigate(`/study/${mode.id}/all`);
      return;
    }
    navigate(`/study/${mode.id}/pick`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className="ornateDivider" />
        <h1 className={styles.title}>{t('modes.title')}</h1>
        <p className={styles.subtitle}>
          {lang === 'ru'
            ? `${MODES.length} режимов · ${ALL_STUDY_FOLDER_IDS.length} тем`
            : `${MODES.length} modes · ${ALL_STUDY_FOLDER_IDS.length} topics`}
        </p>
      </header>

      <div className={styles.grid}>
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={[
              styles.modeCard,
              mode.alphabet ? styles.alphabet : '',
              mode.id === 'flashcards' ? styles.featured : '',
              styles[`accent_${mode.accent}`],
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => handleMode(mode)}
          >
            <span className={styles.iconWrap}>{mode.icon}</span>
            {mode.id === 'flashcards' ? (
              <div className={styles.featuredBody}>
                <h3 className={styles.modeTitle}>{getModeTitle(mode.id, lang)}</h3>
                <p className={styles.desc}>{lang === 'ru' ? mode.descRu : mode.descEn}</p>
              </div>
            ) : (
              <>
                <h3 className={styles.modeTitle}>{getModeTitle(mode.id, lang)}</h3>
                <p className={styles.desc}>{lang === 'ru' ? mode.descRu : mode.descEn}</p>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
