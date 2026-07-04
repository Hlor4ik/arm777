import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadAlphabet, loadWords } from '../../data/loaders';
import type { ExamQuestion } from '../../data/types';
import { buildExamQuestions } from '../../engine/questions';
import { STAR_REWARDS } from '../../engine/gamification';
import { checkAnswer, shuffle } from '../../engine/utils';
import { useProgressStore } from '../../store/progressStore';
import { useT } from '../../i18n/useT';
import { haptic } from '../../hooks/useTelegramBackButton';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { AnswerOptions } from '../study/AnswerOptions';
import { Button } from '../../components/Button/Button';
import styles from './ExamPage.module.css';

export function ExamPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { t } = useT();
  const settings = useProgressStore((s) => s.settings);
  const passExam = useProgressStore((s) => s.passExam);
  const addStars = useProgressStore((s) => s.addStars);
  const markAgain = useProgressStore((s) => s.markAgain);
  const touchStreak = useProgressStore((s) => s.touchStreak);

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState('');
  const [input, setInput] = useState('');
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({});
  const [matchSel, setMatchSel] = useState<string | null>(null);

  const isAlphabet = folderId === 'alphabet';

  useEffect(() => {
    touchStreak();
    (async () => {
      if (isAlphabet) {
        const { letters } = await loadAlphabet();
        const qs: ExamQuestion[] = shuffle(letters).slice(0, 20).map((l, i) => ({
          id: `alpha-${i}`,
          type: i % 2 === 0 ? 'choice' : 'reverse-choice',
          prompt: i % 2 === 0 ? l.letter : l.transcription,
          correctAnswer: i % 2 === 0 ? l.transcription : l.letter,
          options:
            i % 2 === 0
              ? shuffle([l.transcription, ...shuffle(letters.filter((x) => x.id !== l.id)).slice(0, 3).map((x) => x.transcription)])
              : shuffle([l.letter, ...shuffle(letters.filter((x) => x.id !== l.id)).slice(0, 3).map((x) => x.letter)]),
        }));
        setQuestions(qs);
        return;
      }
      if (!folderId) return;
      const words = await loadWords(folderId);
      setQuestions(buildExamQuestions(words, settings.baseLang, settings.dialect));
    })();
  }, [folderId, isAlphabet, settings.baseLang, settings.dialect, touchStreak]);

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [finished]);

  const q = questions[index];
  const threshold = isAlphabet ? 0.85 : 0.8;

  const finish = (finalCorrect: number) => {
    const score = finalCorrect / questions.length;
    const ok = score >= threshold;
    setFinalScore(finalCorrect);
    setCorrect(finalCorrect);
    setPassed(ok);
    setFinished(true);
    if (ok) {
      haptic('success');
      addStars(STAR_REWARDS.examPass);
      passExam(folderId!, isAlphabet);
    } else {
      haptic('error');
    }
  };

  const goNext = (wasCorrect: boolean) => {
    const nextCorrect = correct + (wasCorrect ? 1 : 0);
    if (!wasCorrect && q?.wordId) markAgain(q.wordId);
    if (index + 1 >= questions.length) {
      finish(nextCorrect);
    } else {
      setCorrect(nextCorrect);
      setIndex((i) => i + 1);
      setRevealed(false);
      setSelected('');
      setInput('');
      setMatchPairs({});
      setMatchSel(null);
    }
  };

  const handleChoice = (opt: string, answer: string) => {
    setSelected(opt);
    setRevealed(true);
    setTimeout(() => goNext(opt === answer), 800);
  };

  if (finished) {
    const scorePct = Math.round((finalScore / questions.length) * 100);
    return (
      <div className={`screen ${styles.result}`}>
        <h1>{passed ? t('exam.pass') : t('exam.fail')}</h1>
        <p className={styles.score}>{t('exam.score')}: {scorePct}%</p>
        <Button onClick={() => navigate(passed ? '/folders' : `/exam/${folderId}`)}>
          {passed ? t('exam.toFolders') : t('exam.retry')}
        </Button>
        {!passed && (
          <Button variant="ghost" onClick={() => navigate('/modes')}>
            {t('study.backToModes')}
          </Button>
        )}
      </div>
    );
  }

  if (!q) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className={`screen ${styles.exam}`}>
      <header className={styles.header}>
        <span>{isAlphabet ? t('exam.alphabetTitle') : t('exam.title')}</span>
        <span className={timeLeft < 60 ? styles.red : ''}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
      </header>
      <ProgressBar value={index + 1} max={questions.length} />

      {q.type === 'matching' && q.pairs && (
        <div className={styles.matching}>
          <p className={styles.hint}>{t('exam.matchHint')}</p>
          <div className={styles.matchCols}>
            <div>
              {q.pairs.map((p) => (
                <button
                  key={p.left}
                  type="button"
                  className={`${styles.matchItem} ${matchPairs[p.left] ? styles.done : ''} ${matchSel === p.left ? styles.sel : ''}`}
                  disabled={!!matchPairs[p.left]}
                  onClick={() => setMatchSel(p.left)}
                >
                  {p.left}
                </button>
              ))}
            </div>
            <div>
              {shuffle(q.pairs.map((p) => p.right)).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={styles.matchItem}
                  disabled={Object.values(matchPairs).includes(r)}
                  onClick={() => {
                    if (!matchSel) return;
                    const pair = q.pairs!.find((p) => p.left === matchSel && p.right === r);
                    if (pair) {
                      const next = { ...matchPairs, [matchSel]: r };
                      setMatchPairs(next);
                      setMatchSel(null);
                      if (Object.keys(next).length === q.pairs!.length) {
                        setTimeout(() => goNext(true), 500);
                      }
                    } else haptic('error');
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {q.type === 'dictation' && (
        <>
          <p className={styles.prompt}>{q.prompt}</p>
          <input
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={revealed}
          />
          {!revealed && (
            <Button
              fullWidth
              onClick={() => {
                const ok = checkAnswer(input, q.correctAnswer);
                setRevealed(true);
                setTimeout(() => goNext(ok), 800);
              }}
            >
              {t('study.check')}
            </Button>
          )}
        </>
      )}

      {(q.type === 'choice' || q.type === 'reverse-choice') && q.options && (
        <>
          <p className={styles.prompt}>{q.prompt}</p>
          <AnswerOptions
            options={q.options}
            selected={selected}
            correct={q.correctAnswer}
            revealed={revealed}
            onSelect={(opt) => handleChoice(opt, q.correctAnswer)}
          />
        </>
      )}
    </div>
  );
}
