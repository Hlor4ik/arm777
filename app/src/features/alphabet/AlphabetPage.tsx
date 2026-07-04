import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadAlphabet } from '../../data/loaders';
import type { AlphabetLetter, AlphabetSubmode } from '../../data/types';
import { shuffle } from '../../engine/utils';
import { useT } from '../../i18n/useT';
import { haptic } from '../../hooks/useTelegramBackButton';
import { FlashcardView } from '../study/FlashcardView';
import { AnswerOptions } from '../study/AnswerOptions';
import { Button } from '../../components/Button/Button';
import styles from './AlphabetPage.module.css';

const SUBMODES: AlphabetSubmode[] = [
  'letters',
  'sound-to-letter',
  'letter-to-sound',
  'syllables',
  'mini-words',
];

export function AlphabetPage() {
  const { submode } = useParams<{ submode: AlphabetSubmode }>();
  const navigate = useNavigate();
  const { t } = useT();
  const [letters, setLetters] = useState<AlphabetLetter[]>([]);
  const [syllables, setSyllables] = useState<{ syllable: string; transcription: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    loadAlphabet().then((data) => {
      setLetters(data.letters.sort((a, b) => a.order - b.order));
      setSyllables(data.syllables);
    });
  }, []);

  const mode = submode ?? 'letters';
  const current = letters[index];

  const submodeLabel = (s: AlphabetSubmode) => {
    const map = {
      letters: t('alphabet.letters'),
      'sound-to-letter': t('alphabet.soundToLetter'),
      'letter-to-sound': t('alphabet.letterToSound'),
      syllables: t('alphabet.syllables'),
      'mini-words': t('alphabet.miniWords'),
    };
    return map[s];
  };

  const advance = () => {
    setRevealed(false);
    setSelected('');
    if (index + 1 >= letters.length) {
      navigate('/exam/alphabet');
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (!current && mode !== 'syllables' && mode !== 'mini-words') return null;

  return (
    <div className={`screen ${styles.page}`}>
      <div className={styles.tabs}>
        {SUBMODES.map((s) => (
          <button
            key={s}
            type="button"
            className={s === mode ? `${styles.tab} ${styles.active}` : styles.tab}
            onClick={() => {
              setIndex(0);
              navigate(`/alphabet/${s}`);
            }}
          >
            {submodeLabel(s)}
          </button>
        ))}
      </div>

      {mode === 'letters' && current && (
        <FlashcardView
          front={current.letter}
          back={`${current.name} · ${current.transcription}`}
          onKnow={() => { haptic('success'); advance(); }}
          onAgain={() => { haptic('light'); advance(); }}
          tapHint={t('study.tapFlip')}
          swipeHintLeft={t('study.swipeLeft')}
          swipeHintRight={t('study.swipeRight')}
        />
      )}

      {mode === 'sound-to-letter' && current && (
        <>
          <p className={styles.prompt}>{current.transcription}</p>
          <AnswerOptions
            options={shuffle([
              current.letter,
              ...shuffle(letters.filter((l) => l.id !== current.id))
                .slice(0, 3)
                .map((l) => l.letter),
            ])}
            selected={selected}
            correct={current.letter}
            revealed={revealed}
            onSelect={(opt) => {
              setSelected(opt);
              setRevealed(true);
              setTimeout(advance, 800);
            }}
          />
        </>
      )}

      {mode === 'letter-to-sound' && current && (
        <>
          <p className={styles.prompt}>{current.letter}</p>
          <AnswerOptions
            options={shuffle([
              current.transcription,
              ...shuffle(letters.filter((l) => l.id !== current.id))
                .slice(0, 3)
                .map((l) => l.transcription),
            ])}
            selected={selected}
            correct={current.transcription}
            revealed={revealed}
            onSelect={(opt) => {
              setSelected(opt);
              setRevealed(true);
              setTimeout(advance, 800);
            }}
          />
        </>
      )}

      {(mode === 'syllables' || mode === 'mini-words') && (
        <SyllableDrill
          items={syllables.filter((s) =>
            mode === 'mini-words' ? s.transcription.length > 2 : s.transcription.length <= 3
          )}
          onComplete={() => navigate('/exam/alphabet')}
        />
      )}

      <p className={styles.counter}>
        {index + 1} / {mode === 'syllables' || mode === 'mini-words' ? syllables.length : letters.length}
      </p>
    </div>
  );
}

function SyllableDrill({
  items,
  onComplete,
}: {
  items: { syllable: string; transcription: string }[];
  onComplete: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState('');
  const item = items[idx];
  const { t } = useT();

  if (!item) {
    return <Button onClick={onComplete}>{t('exam.title')}</Button>;
  }

  return (
    <>
      <p className={styles.prompt}>{item.transcription}</p>
      <AnswerOptions
        options={shuffle([
          item.syllable,
          ...shuffle(items.filter((x) => x !== item))
            .slice(0, 3)
            .map((x) => x.syllable),
        ])}
        selected={selected}
        correct={item.syllable}
        revealed={revealed}
        onSelect={(opt) => {
          setSelected(opt);
          setRevealed(true);
          setTimeout(() => {
            if (idx + 1 >= items.length) onComplete();
            else {
              setIdx((i) => i + 1);
              setRevealed(false);
              setSelected('');
            }
          }, 800);
        }}
      />
    </>
  );
}
