import styles from './ProgressBar.module.css';

interface Props {
  value: number;
  max?: number;
  className?: string;
}

export function ProgressBar({ value, max = 100, className }: Props) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`${styles.track} ${className ?? ''}`}>
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}
