import { useT } from '../../i18n/useT';
import styles from './AboutPage.module.css';

export function AboutPage() {
  const { t } = useT();

  return (
    <div className="screen">
      <h1 className="screenTitle">{t('about.title')}</h1>
      <p className={styles.text}>{t('about.text')}</p>
      <p className={styles.version}>
        {t('about.version')}: 1.0.0
      </p>
    </div>
  );
}
