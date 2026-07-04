import { WORLD_ASSETS } from '../../../assets/world';
import styles from './StarHud.module.css';

interface StarHudProps {
  stars: number;
  label: string;
}

export function StarHud({ stars, label }: StarHudProps) {
  return (
    <div className={styles.hud}>
      <img src={WORLD_ASSETS.starIcon} alt="" className={styles.icon} draggable={false} />
      <div className={styles.info}>
        <span className={styles.count}>{stars.toLocaleString()}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}
