import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/useT';
import { useProgressStore } from '../../store/progressStore';
import type { StudyModeId } from '../../data/types';
import { getModeTitle } from '../../engine/questions';
import { Card } from '../../components/Card/Card';
import styles from './ModesPage.module.css';

const MODES: { id: StudyModeId; descRu: string; descEn: string; alphabet?: boolean }[] = [
  { id: 'alphabet', descRu: 'Буквы и слоги', descEn: 'Letters and syllables', alphabet: true },
  { id: 'flashcards', descRu: 'Свайп и карточки', descEn: 'Swipe flashcards' },
  { id: 'choice', descRu: 'RU/EN → транскрипция', descEn: 'Pick transcription' },
  { id: 'reverse-choice', descRu: 'Транскрипция → RU/EN', descEn: 'Pick translation' },
  { id: 'matching', descRu: 'Пары слов', descEn: 'Match pairs' },
  { id: 'dictation', descRu: 'Напиши транскрипцию', descEn: 'Type transcription' },
  { id: 'reverse-dictation', descRu: 'Напиши перевод', descEn: 'Type translation' },
  { id: 'word-builder', descRu: 'Собери слово', descEn: 'Build the word' },
  { id: 'fill-blank', descRu: 'Пропуск в фразе', descEn: 'Fill the blank' },
  { id: 'weak', descRu: 'Сложные слова', descEn: 'Difficult words' },
  { id: 'marathon', descRu: '15–20 заданий', descEn: '15–20 questions' },
  { id: 'speed', descRu: '60 секунд', descEn: '60 seconds' },
];

export function ModesPage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const opened = useProgressStore((s) => s.openedFolders);
  const alphabetPassed = useProgressStore((s) => s.alphabetPassed);
  const setLastMode = useProgressStore((s) => s.setLastMode);

  const handleMode = (mode: (typeof MODES)[0]) => {
    if (mode.alphabet) {
      setLastMode(mode.id);
      navigate('/alphabet/letters');
      return;
    }
    if (opened.length === 0) return;
    setLastMode(mode.id);
    if (mode.id === 'weak') {
      navigate(`/study/${mode.id}/all`);
      return;
    }
    if (opened.length === 1) {
      navigate(`/study/${mode.id}/${opened[0]}`);
      return;
    }
    navigate(`/study/${mode.id}/pick`);
  };

  return (
    <div className="screen">
      <div className="flagStripe" />
      <h1 className="screenTitle">{t('modes.title')}</h1>
      <div className={styles.grid}>
        {MODES.map((mode) => {
          const disabled = !mode.alphabet && opened.length === 0;
          return (
            <Card
              key={mode.id}
              flagStripe={mode.alphabet}
              disabled={disabled}
              onClick={() => handleMode(mode)}
              className={styles.modeCard}
            >
              <div className={styles.iconWrap}>◆</div>
              <h3 className={styles.modeTitle}>{getModeTitle(mode.id, lang)}</h3>
              <p className={styles.desc}>{lang === 'ru' ? mode.descRu : mode.descEn}</p>
              {disabled && <span className={styles.hint}>{t('modes.disabled')}</span>}
        {mode.alphabet && (
          <>
            {!alphabetPassed && <span className={styles.badge}>Start</span>}
            {alphabetPassed === false && (
              <button
                type="button"
                className={styles.examLink}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/exam/alphabet');
                }}
              >
                📝
              </button>
            )}
          </>
        )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
