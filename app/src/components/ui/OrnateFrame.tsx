import type { ReactNode } from 'react';
import styles from './OrnateFrame.module.css';

interface OrnateFrameProps {
  children: ReactNode;
  className?: string;
}

export function OrnateFrame({ children, className }: OrnateFrameProps) {
  return (
    <div className={`${styles.frame} ${className ?? ''}`}>
      <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden />
      <span className={`${styles.corner} ${styles.cornerTR}`} aria-hidden />
      <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden />
      <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden />
      <span className={styles.innerBorder} aria-hidden />
      {children}
    </div>
  );
}
