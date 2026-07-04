import { useDrag } from '@use-gesture/react';
import { useState } from 'react';
import styles from './FlashcardView.module.css';

interface Props {
  front: string;
  back: string;
  onKnow: () => void;
  onAgain: () => void;
  swipeHintLeft: string;
  swipeHintRight: string;
  tapHint: string;
}

export function FlashcardView({
  front,
  back,
  onKnow,
  onAgain,
  swipeHintLeft,
  swipeHintRight,
  tapHint,
}: Props) {
  const [flipped, setFlipped] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const bind = useDrag(
    ({ movement: [mx], direction: [dx], velocity: [vx], last }) => {
      setOffset({ x: mx, y: 0 });
      if (last) {
        if (mx > 80 || (dx > 0 && vx > 0.5)) {
          onKnow();
        } else if (mx < -80 || (dx < 0 && vx > 0.5)) {
          onAgain();
        }
        setOffset({ x: 0, y: 0 });
        setFlipped(false);
      }
    },
    { axis: 'x', filterTaps: true }
  );

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.card}
        style={{ transform: `translateX(${offset.x}px) rotate(${offset.x * 0.05}deg)` }}
        onClick={() => setFlipped((f) => !f)}
        {...bind()}
      >
        <p className={flipped ? styles.back : styles.front}>
          {flipped ? back : front}
        </p>
        {!flipped && <span className={styles.tapHint}>{tapHint}</span>}
      </button>
      <div className={styles.swipeHints}>
        <span>← {swipeHintLeft}</span>
        <span>{swipeHintRight} →</span>
      </div>
    </div>
  );
}
