import { UI_ASSETS } from '../../../assets/ui';
import styles from './ApprovedCourtyardScene.module.css';

export function ApprovedCourtyardScene() {
  return (
    <div
      className={styles.scene}
      style={{ backgroundImage: `url(${UI_ASSETS.mockWorld})` }}
      aria-hidden
    />
  );
}
