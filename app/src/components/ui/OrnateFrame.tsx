import type { ReactNode } from 'react';
import styles from './OrnateFrame.module.css';

interface OrnateFrameProps {
  children: ReactNode;
  className?: string;
  texture?: string;
}

export function OrnateFrame({ children, className, texture }: OrnateFrameProps) {
  return (
    <div className={`${styles.frame} ${texture ? styles.textured : ''} ${className ?? ''}`}>
      {texture && (
        <span
          className={styles.textureLayer}
          style={{ backgroundImage: `url(${texture})` }}
          aria-hidden
        />
      )}
      <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden />
      <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden />
      <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden />
      <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden />
      <span className={styles.innerBorder} aria-hidden />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
