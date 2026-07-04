import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFoldersMeta, loadAllWordsForFolders, loadWords } from '../../data/loaders';
import type { StudyModeId, Word } from '../../data/types';
import { useProgressStore } from '../../store/progressStore';
import { useT } from '../../i18n/useT';
import {
  buildChoiceQuestion,
  buildFillBlankQuestion,
  buildMatchingRound,
  checkAnswer,
  getModeTitle,
} from '../../engine/questions';
import { getTranslation, getTranscription, shuffle, splitSyllables } from '../../engine/utils';
import { isWeakWord } from '../../engine/sm2';
import { haptic } from '../../hooks/useTelegramBackButton';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { Button } from '../../components/Button/Button';
import { FlashcardView } from './FlashcardView';
import { AnswerOptions } from './AnswerOptions';
import styles from './StudyPage.module.css';

export function StudyPage() {
  const { modeId, folderId } = useParams<{ modeId: StudyModeId; folderId: string }>();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const settings = useProgressStore((s) => s.settings);
  const opened = useProgressStore((s) => s.openedFolders);
  const wordProgress = useProgressStore((s) => s.wordProgress);
  const markKnown = useProgressStore((s) => s.markKnown);
  const markAgain = useProgressStore((s) => s.markAgain);

  const [words, setWords] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [input, setInput] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState('');
  const [speedScore, setSpeedScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [builder, setBuilder] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (!modeId || !folderId) return;
      if (folderId === 'pick') return;
      let list: Word[] = [];
      if (folderId === 'all' || modeId === 'weak') {
        list = await loadAllWordsForFolders(opened);
        if (modeId === 'weak') {
          list = list.filter((w) => isWeakWord(wordProgress[w.id]));
        }
      } else {
        list = await loadWords(folderId);
      }
      setWords(shuffle(list));
    })();
  }, [modeId, folderId, opened, wordProgress]);

  useEffect(() => {
    if (modeId !== 'speed' || done) return;
    if (timeLeft <= 0) {
      setDone(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [modeId, timeLeft, done]);

  const current = words[index];
  const pool = words;

  const choiceQ = useMemo(() => {
    if (!current || !modeId) return null;
    if (modeId === 'choice') return buildChoiceQuestion(current, pool, settings.baseLang, settings.dialect, false);
    if (modeId === 'reverse-choice') return buildChoiceQuestion(current, pool, settings.baseLang, settings.dialect, true);
    return null;
  }, [current, modeId, pool, settings]);

  const fillQ = useMemo(() => {
    if (!current || modeId !== 'fill-blank') return null;
    return buildFillBlankQuestion(current, settings.baseLang, settings.dialect);
  }, [current, modeId, settings]);

  const matchRound = useMemo(() => {
    if (!current || modeId !== 'matching') return null;
    return buildMatchingRound(pool.slice(index, index + 4).length >= 4 ? pool.slice(index, index + 4) : pool.slice(0, 4), settings.baseLang, settings.dialect);
  }, [current, modeId, pool, index, settings]);

  const syllables = useMemo(() => {
    if (!current || modeId !== 'word-builder') return [];
    return shuffle(splitSyllables(getTranscription(current, settings.dialect)));
  }, [current, modeId, settings.dialect]);

  const advance = () => {
    setRevealed(false);
    setSelected('');
    setInput('');
    setBuilder([]);
    if (index + 1 >= words.length) setDone(true);
    else setIndex((i) => i + 1);
  };

  const handleCorrect = () => {
    haptic('success');
    if (current && modeId !== 'speed') markKnown(current.id);
    if (modeId === 'speed') setSpeedScore((s) => s + 1);
    advance();
  };

  const handleWrong = () => {
    haptic('error');
    if (current) markAgain(current.id);
    if (modeId === 'speed') advance();
    else {
      setRevealed(true);
      setTimeout(advance, 800);
    }
  };

  if (folderId === 'pick') {
    return <FolderPicker modeId={modeId!} opened={opened} />;
  }

  if (done) {
    return (
      <div className={`screen ${styles.center}`}>
        <h2>{t('study.done')}</h2>
        {modeId === 'speed' && <p className={styles.score}>{t('speed.score')}: {speedScore}</p>}
        <Button onClick={() => navigate('/modes')}>{t('study.backToModes')}</Button>
      </div>
    );
  }

  if (!current || !modeId) return null;

  const folderName = folderId ?? '';

  return (
    <div className={`screen ${styles.study}`}>
      <header className={styles.header}>
        <span>{getModeTitle(modeId, lang)} · {folderName}</span>
        <span>{index + 1}/{words.length}</span>
      </header>
      <ProgressBar value={index + 1} max={words.length} />
      {modeId === 'speed' && <p className={styles.timer}>{t('speed.timeLeft')}: {timeLeft}s · {speedScore}</p>}

      {modeId === 'flashcards' && (
        <FlashcardView
          front={getTranslation(current, settings.baseLang)}
          back={getTranscription(current, settings.dialect)}
          onKnow={() => { markKnown(current.id); advance(); haptic('success'); }}
          onAgain={() => { markAgain(current.id); advance(); haptic('light'); }}
          tapHint={t('study.tapFlip')}
          swipeHintLeft={t('study.swipeLeft')}
          swipeHintRight={t('study.swipeRight')}
        />
      )}

      {(modeId === 'choice' || modeId === 'reverse-choice' || modeId === 'speed') && choiceQ && (
        <>
          <p className={styles.prompt}>{choiceQ.prompt}</p>
          <AnswerOptions
            options={choiceQ.options}
            selected={selected}
            correct={choiceQ.correct}
            revealed={revealed}
            onSelect={(opt) => {
              setSelected(opt);
              setRevealed(true);
              if (opt === choiceQ.correct) setTimeout(handleCorrect, 800);
              else setTimeout(handleWrong, 800);
            }}
          />
        </>
      )}

      {(modeId === 'dictation' || modeId === 'reverse-dictation') && (
        <>
          <p className={styles.prompt}>
            {modeId === 'dictation'
              ? getTranslation(current, settings.baseLang)
              : getTranscription(current, settings.dialect)}
          </p>
          <input
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !revealed && submitDictation()}
          />
          {!revealed && (
            <Button fullWidth onClick={submitDictation}>{t('study.check')}</Button>
          )}
          {revealed && (
            <p className={selected === 'ok' ? styles.ok : styles.bad}>
              {selected === 'ok' ? t('study.correct') : `${t('study.wrong')}: ${
                modeId === 'dictation'
                  ? getTranscription(current, settings.dialect)
                  : getTranslation(current, settings.baseLang)
              }`}
            </p>
          )}
        </>
      )}

      {modeId === 'fill-blank' && fillQ && (
        <>
          <p className={styles.prompt}>{fillQ.prefix}___​{fillQ.suffix}</p>
          <AnswerOptions
            options={shuffle([fillQ.correct, ...pool.filter((w) => w.id !== current.id).slice(0, 3).map((w) => getTranscription(w, settings.dialect))])}
            selected={selected}
            correct={fillQ.correct}
            revealed={revealed}
            onSelect={(opt) => {
              setSelected(opt);
              setRevealed(true);
              if (opt === fillQ.correct) setTimeout(handleCorrect, 800);
              else setTimeout(handleWrong, 800);
            }}
          />
        </>
      )}

      {modeId === 'word-builder' && (
        <>
          <p className={styles.prompt}>{getTranslation(current, settings.baseLang)}</p>
          <div className={styles.builderResult}>{builder.join('') || '...'}</div>
          <div className={styles.syllables}>
            {syllables.map((s, i) => (
              <button
                key={`${s}-${i}`}
                type="button"
                className={styles.syllable}
                disabled={builder.includes(s) && builder.filter((x) => x === s).length >= syllables.filter((y) => y === s).length}
                onClick={() => setBuilder((b) => [...b, s])}
              >
                {s}
              </button>
            ))}
          </div>
          <Button
            fullWidth
            onClick={() => {
              const target = getTranscription(current, settings.dialect);
              if (checkAnswer(builder.join(''), target)) handleCorrect();
              else handleWrong();
            }}
          >
            {t('study.check')}
          </Button>
        </>
      )}

      {modeId === 'matching' && matchRound && (
        <MatchingView
          left={matchRound.left}
          right={matchRound.right}
          words={matchRound.words}
          settings={settings}
          onComplete={handleCorrect}
        />
      )}

      {modeId === 'marathon' && (
        <MarathonRound word={current} pool={pool} settings={settings} index={index} onDone={(ok) => (ok ? handleCorrect() : handleWrong())} />
      )}
    </div>
  );

  function submitDictation() {
    const target =
      modeId === 'dictation'
        ? getTranscription(current, settings.dialect)
        : getTranslation(current, settings.baseLang);
    const ok = checkAnswer(input, target);
    setRevealed(true);
    setSelected(ok ? 'ok' : 'bad');
    setTimeout(() => (ok ? handleCorrect() : handleWrong()), 800);
  }
}

function FolderPicker({ modeId, opened }: { modeId: StudyModeId; opened: string[] }) {
  const navigate = useNavigate();
  const { t } = useT();
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    getFoldersMeta().then((meta) => {
      const map: Record<string, string> = {};
      meta.forEach((f) => { map[f.id] = f.nameRu; });
      setNames(map);
    });
  }, []);

  return (
    <div className="screen">
      <h1 className="screenTitle">{t('modes.pickFolder')}</h1>
      {opened.map((id) => (
        <button
          key={id}
          type="button"
          className={styles.folderPick}
          onClick={() => navigate(`/study/${modeId}/${id}`)}
        >
          {names[id] ?? id}
        </button>
      ))}
    </div>
  );
}

function MatchingView({
  left,
  right,
  words,
  settings,
  onComplete,
}: {
  left: string[];
  right: string[];
  words: Word[];
  settings: { baseLang: 'ru' | 'en'; dialect: 'eastern' | 'lori' };
  onComplete: () => void;
}) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<string | null>(null);
  const { t } = useT();

  const tryPair = (l: string, r: string) => {
    const word = words.find(
      (w) => getTranslation(w, settings.baseLang) === l && getTranscription(w, settings.dialect) === r
    );
    if (word) {
      const next = { ...picked, [l]: r };
      setPicked(next);
      setSel(null);
      if (Object.keys(next).length === left.length) onComplete();
    } else {
      haptic('error');
      setSel(null);
    }
  };

  return (
    <div className={styles.matching}>
      <p className={styles.hint}>{t('exam.matchHint')}</p>
      <div className={styles.matchCols}>
        <div>
          {left.map((l) => (
            <button
              key={l}
              type="button"
              className={`${styles.matchItem} ${picked[l] ? styles.matched : ''} ${sel === l ? styles.selected : ''}`}
              disabled={!!picked[l]}
              onClick={() => setSel(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div>
          {right.map((r) => (
            <button
              key={r}
              type="button"
              className={styles.matchItem}
              disabled={Object.values(picked).includes(r)}
              onClick={() => sel && tryPair(sel, r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarathonRound({
  word,
  pool,
  settings,
  index,
  onDone,
}: {
  word: Word;
  pool: Word[];
  settings: { baseLang: 'ru' | 'en'; dialect: 'eastern' | 'lori' };
  index: number;
  onDone: (ok: boolean) => void;
}) {
  const types = ['choice', 'reverse', 'dictation'] as const;
  const type = types[index % types.length];
  const [input, setInput] = useState('');
  const { t } = useT();

  if (type === 'choice') {
    const q = buildChoiceQuestion(word, pool, settings.baseLang, settings.dialect, false);
    return (
      <>
        <p className={styles.prompt}>{q.prompt}</p>
        <AnswerOptions options={q.options} onSelect={(opt) => onDone(opt === q.correct)} />
      </>
    );
  }

  if (type === 'reverse') {
    const q = buildChoiceQuestion(word, pool, settings.baseLang, settings.dialect, true);
    return (
      <>
        <p className={styles.prompt}>{q.prompt}</p>
        <AnswerOptions options={q.options} onSelect={(opt) => onDone(opt === q.correct)} />
      </>
    );
  }

  return (
    <>
      <p className={styles.prompt}>{getTranslation(word, settings.baseLang)}</p>
      <input className={styles.input} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button fullWidth onClick={() => onDone(checkAnswer(input, getTranscription(word, settings.dialect)))}>
        {t('study.check')}
      </Button>
    </>
  );
}
