import { StarSvg } from '../illustrations/StarSvg';
import styles from './StarHud.module.css';

interface StarHudProps {
  stars: number;
  label: string;
}

export function StarHud({ stars, label }: StarHudProps) {
  return (
    <div className={styles.hud}>
      <StarSvg size={34} />
      <div className={styles.info}>
        <span className={styles.count}>{stars.toLocaleString()}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}
