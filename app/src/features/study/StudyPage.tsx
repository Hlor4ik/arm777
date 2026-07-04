import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFoldersMeta, loadAllWordsForFolders, loadWords } from '../../data/loaders';
import { ALL_STUDY_FOLDER_IDS } from '../../data/folders';
import type { StudyModeId, Word } from '../../data/types';
import { STAR_REWARDS } from '../../engine/gamification';
import {
  getSpeedWord,
  MATCHING_ROUNDS,
  prepareStudySession,
} from '../../engine/session';
import { useProgressStore } from '../../store/progressStore';
import { useT } from '../../i18n/useT';
import {
  buildChoiceQuestion,
  buildFillBlankQuestion,
  buildMatchingRound,
  checkAnswer,
  getModeTitle,
} from '../../engine/questions';
import { getTranslation, getTranscription, shuffle } from '../../engine/utils';
import { StarSvg } from '../world/illustrations/StarSvg';
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
  const studyFolders = opened.length > 0 ? opened : [...ALL_STUDY_FOLDER_IDS];
  const wordProgress = useProgressStore((s) => s.wordProgress);
  const markKnown = useProgressStore((s) => s.markKnown);
  const markAgain = useProgressStore((s) => s.markAgain);
  const addStars = useProgressStore((s) => s.addStars);

  const [words, setWords] = useState<Word[]>([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [emptyReason, setEmptyReason] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [input, setInput] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState('');
  const [speedScore, setSpeedScore] = useState(0);
  const [speedTick, setSpeedTick] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [builder, setBuilder] = useState<string[]>([]);
  const [earnedStars, setEarnedStars] = useState(0);

  useEffect(() => {
    (async () => {
      if (!modeId || !folderId || folderId === 'pick') return;
      setLoading(true);
      let source: Word[] = [];
      if (folderId === 'all') {
        source = await loadAllWordsForFolders(studyFolders);
      } else {
        source = await loadWords(folderId);
      }
      const session = prepareStudySession(modeId, source, wordProgress);
      setWords(session.words);
      setTotalSteps(session.totalSteps);
      setEmptyReason(session.emptyReason);
      setIndex(0);
      setDone(false);
      setLoading(false);
    })();
  }, [modeId, folderId, studyFolders, wordProgress]);

  useEffect(() => {
    if (modeId !== 'speed' || done || loading) return;
    if (timeLeft <= 0) {
      addStars(STAR_REWARDS.sessionComplete);
      setEarnedStars((s) => s + STAR_REWARDS.sessionComplete);
      setDone(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [modeId, timeLeft, done, loading]);

  const isMatching = modeId === 'matching';
  const isSpeed = modeId === 'speed';
  const progressMax = isSpeed ? 60 : isMatching ? MATCHING_ROUNDS : totalSteps;
  const progressValue = isSpeed ? 60 - timeLeft : index + 1;

  const current = isSpeed
    ? words.length > 0
      ? getSpeedWord(words, speedTick)
      : undefined
    : isMatching
      ? words[0]
      : words[index];

  const pool = words;

  const choiceQ = useMemo(() => {
    if (!current || !modeId) return null;
    if (modeId === 'choice' || modeId === 'speed') {
      return buildChoiceQuestion(current, pool, settings.baseLang, settings.dialect, false);
    }
    if (modeId === 'reverse-choice') {
      return buildChoiceQuestion(current, pool, settings.baseLang, settings.dialect, true);
    }
    return null;
  }, [current, modeId, pool, settings]);

  const fillQ = useMemo(() => {
    if (!current || modeId !== 'fill-blank') return null;
    return buildFillBlankQuestion(current, settings.baseLang, settings.dialect);
  }, [current, modeId, settings]);

  const fillOptions = useMemo(() => {
    if (!fillQ || !current) return [];
    const distractors = pool
      .filter((w) => w.id !== current.id)
      .map((w) => getTranscription(w, settings.dialect));
    return shuffle([fillQ.correct, ...shuffle(distractors).slice(0, 3)]);
  }, [fillQ, current, pool, settings.dialect]);

  const matchRound = useMemo(() => {
    if (modeId !== 'matching' || pool.length < 4) return null;
    return buildMatchingRound(pool, settings.baseLang, settings.dialect);
  }, [modeId, pool, settings, index]);

  const syllables = useMemo(() => {
    if (!current || modeId !== 'word-builder') return [];
    const tr = getTranscription(current, settings.dialect);
    if (tr.length <= 2) return shuffle([tr[0] ?? tr, tr.slice(1) || tr]);
    const mid = Math.ceil(tr.length / 2);
    return shuffle([tr.slice(0, mid), tr.slice(mid)]);
  }, [current, modeId, settings.dialect]);

  const finishSession = () => {
    addStars(STAR_REWARDS.sessionComplete);
    setEarnedStars((s) => s + STAR_REWARDS.sessionComplete);
    setDone(true);
  };

  const advance = () => {
    setRevealed(false);
    setSelected('');
    setInput('');
    setBuilder([]);
    const max = isMatching ? MATCHING_ROUNDS : totalSteps;
    if (index + 1 >= max) {
      finishSession();
    } else {
      setIndex((i) => i + 1);
    }
  };

  const rewardCorrect = () => {
    addStars(STAR_REWARDS.correct);
    setEarnedStars((s) => s + STAR_REWARDS.correct);
  };

  const handleCorrect = () => {
    haptic('success');
    rewardCorrect();
    if (current && !isSpeed) markKnown(current.id);
    if (isSpeed) {
      setSpeedScore((s) => s + 1);
      setSpeedTick((t) => t + 1);
      setRevealed(false);
      setSelected('');
      return;
    }
    advance();
  };

  const handleWrong = () => {
    haptic('error');
    if (current && !isSpeed) markAgain(current.id);
    if (isSpeed) {
      setSpeedTick((t) => t + 1);
      setRevealed(false);
      setSelected('');
      return;
    }
    setRevealed(true);
    setTimeout(advance, 800);
  };

  if (folderId === 'pick') {
    return <FolderPicker modeId={modeId!} folders={studyFolders} />;
  }

  if (loading) {
    return (
      <div className={`screen ${styles.center}`}>
        <p className={styles.loading}>...</p>
      </div>
    );
  }

  if (emptyReason === 'no_weak_words') {
    return (
      <div className={`screen ${styles.center}`}>
        <h2>{t('study.noWeak')}</h2>
        <Button onClick={() => navigate('/modes')}>{t('study.backToModes')}</Button>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className={`screen ${styles.center}`}>
        <h2>{t('study.noWords')}</h2>
        <Button onClick={() => navigate('/modes')}>{t('study.backToModes')}</Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className={`screen ${styles.center}`}>
        <h2>{t('study.done')}</h2>
        {isSpeed && <p className={styles.score}>{t('speed.score')}: {speedScore}</p>}
        <p className={styles.starsEarned}>
          <StarSvg size={28} />
          +{earnedStars}
        </p>
        <Button onClick={() => navigate('/world')}>{t('game.toWorld')}</Button>
        <Button variant="ghost" onClick={() => navigate('/modes')}>{t('study.backToModes')}</Button>
      </div>
    );
  }

  if (!current || !modeId) return null;

  return (
    <div className={`screen ${styles.study}`}>
      <header className={styles.header}>
        <span>{getModeTitle(modeId, lang)} · {folderId}</span>
        <span>{isMatching ? `${index + 1}/${MATCHING_ROUNDS}` : isSpeed ? `${speedScore} ⭐` : `${index + 1}/${totalSteps}`}</span>
      </header>
      <ProgressBar value={progressValue} max={progressMax} />
      {isSpeed && <p className={styles.timer}>{t('speed.timeLeft')}: {timeLeft}s</p>}

      {modeId === 'flashcards' && (
        <FlashcardView
          front={getTranslation(current, settings.baseLang)}
          back={getTranscription(current, settings.dialect)}
          onKnow={() => { rewardCorrect(); markKnown(current.id); advance(); haptic('success'); }}
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
              if (revealed) return;
              setSelected(opt);
              setRevealed(true);
              if (opt === choiceQ.correct) setTimeout(handleCorrect, 600);
              else setTimeout(handleWrong, 600);
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
          {!revealed && <Button fullWidth onClick={submitDictation}>{t('study.check')}</Button>}
          {revealed && (
            <p className={selected === 'ok' ? styles.ok : styles.bad}>
              {selected === 'ok' ? t('study.correct') : t('study.wrong')}
            </p>
          )}
        </>
      )}

      {modeId === 'fill-blank' && fillQ && (
        <>
          <p className={styles.prompt}>{fillQ.prefix}___​{fillQ.suffix}</p>
          <AnswerOptions
            options={fillOptions}
            selected={selected}
            correct={fillQ.correct}
            revealed={revealed}
            onSelect={(opt) => {
              if (revealed) return;
              setSelected(opt);
              setRevealed(true);
              if (opt === fillQ.correct) setTimeout(handleCorrect, 600);
              else setTimeout(handleWrong, 600);
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
              <button key={`${s}-${i}`} type="button" className={styles.syllable} onClick={() => setBuilder((b) => [...b, s])}>
                {s}
              </button>
            ))}
          </div>
          <Button fullWidth onClick={() => {
            if (checkAnswer(builder.join(''), getTranscription(current, settings.dialect))) handleCorrect();
            else handleWrong();
          }}>
            {t('study.check')}
          </Button>
          <Button variant="ghost" fullWidth onClick={() => setBuilder([])}>{t('study.clear')}</Button>
        </>
      )}

      {modeId === 'matching' && matchRound && (
        <MatchingView
          key={index}
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
        ? getTranscription(current!, settings.dialect)
        : getTranslation(current!, settings.baseLang);
    const ok = checkAnswer(input, target);
    setRevealed(true);
    setSelected(ok ? 'ok' : 'bad');
    setTimeout(() => (ok ? handleCorrect() : handleWrong()), 600);
  }
}

function FolderPicker({ modeId, folders }: { modeId: StudyModeId; folders: string[] }) {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getFoldersMeta().then((meta) => {
      setItems(
        meta
          .filter((f) => !f.isAlphabet && folders.includes(f.id))
          .sort((a, b) => a.order - b.order)
          .map((f) => ({ id: f.id, name: lang === 'ru' ? f.nameRu : f.nameEn }))
      );
    });
  }, [folders, lang]);

  return (
    <div className={`screen ${styles.picker}`}>
      <div className={styles.pickerStripe} />
      <h1 className="screenTitle">{t('modes.pickFolder')}</h1>
      <div className={styles.pickerList}>
        {items.map((item) => (
          <button key={item.id} type="button" className={styles.folderPick} onClick={() => navigate(`/study/${modeId}/${item.id}`)}>
            <span>{item.name}</span>
            <span className={styles.chevron}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchingView({
  left, right, words, settings, onComplete,
}: {
  left: string[]; right: string[]; words: Word[];
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
            <button key={l} type="button" className={`${styles.matchItem} ${picked[l] ? styles.matched : ''} ${sel === l ? styles.selected : ''}`} disabled={!!picked[l]} onClick={() => setSel(l)}>
              {l}
            </button>
          ))}
        </div>
        <div>
          {shuffle(right).map((r) => (
            <button key={r} type="button" className={styles.matchItem} disabled={Object.values(picked).includes(r)} onClick={() => sel && tryPair(sel, r)}>
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarathonRound({ word, pool, settings, index, onDone }: {
  word: Word; pool: Word[]; settings: { baseLang: 'ru' | 'en'; dialect: 'eastern' | 'lori' }; index: number; onDone: (ok: boolean) => void;
}) {
  const types = ['choice', 'reverse', 'dictation'] as const;
  const type = types[index % types.length];
  const [input, setInput] = useState('');
  const [locked, setLocked] = useState(false);
  const { t } = useT();

  if (type === 'choice') {
    const q = buildChoiceQuestion(word, pool, settings.baseLang, settings.dialect, false);
    return (
      <>
        <p className={styles.prompt}>{q.prompt}</p>
        <AnswerOptions options={q.options} onSelect={(opt) => { if (!locked) { setLocked(true); onDone(opt === q.correct); } }} />
      </>
    );
  }
  if (type === 'reverse') {
    const q = buildChoiceQuestion(word, pool, settings.baseLang, settings.dialect, true);
    return (
      <>
        <p className={styles.prompt}>{q.prompt}</p>
        <AnswerOptions options={q.options} onSelect={(opt) => { if (!locked) { setLocked(true); onDone(opt === q.correct); } }} />
      </>
    );
  }
  return (
    <>
      <p className={styles.prompt}>{getTranslation(word, settings.baseLang)}</p>
      <input className={styles.input} value={input} onChange={(e) => setInput(e.target.value)} />
      <Button fullWidth onClick={() => { if (!locked) { setLocked(true); onDone(checkAnswer(input, getTranscription(word, settings.dialect))); } }}>
        {t('study.check')}
      </Button>
    </>
  );
}
