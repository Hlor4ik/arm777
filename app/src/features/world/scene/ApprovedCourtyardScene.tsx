import { UI_ASSETS } from '../../../assets/ui';
import styles from './ApprovedCourtyardScene.module.css';

/** Full-bleed courtyard photo — cropped to scene only, UI overlays sit on top. */
export function ApprovedCourtyardScene() {
  return (
    <div className={styles.wrap}>
      <img
        src={UI_ASSETS.mockWorld}
        alt=""
        className={styles.photo}
        draggable={false}
      />
    </div>
  );
}
