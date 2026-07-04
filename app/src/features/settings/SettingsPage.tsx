import { useNavigate } from 'react-router-dom';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { Button } from '../../components/Button/Button';
import { useT } from '../../i18n/useT';
import { useProgressStore } from '../../store/progressStore';
import type { BaseLang, Dialect } from '../../data/types';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const settings = useProgressStore((s) => s.settings);
  const setBaseLang = useProgressStore((s) => s.setBaseLang);
  const setDialect = useProgressStore((s) => s.setDialect);
  const resetProgress = useProgressStore((s) => s.resetProgress);

  const handleReset = () => {
    if (window.confirm(t('settings.resetConfirm'))) {
      resetProgress();
      window.Telegram?.WebApp?.CloudStorage?.removeItem('armenian-learn-v1', () => {});
    }
  };

  return (
    <div className="screen">
      <div className="flagStripe" />
      <h1 className="screenTitle">{t('settings.title')}</h1>

      <section className={styles.section}>
        <h2 className={styles.label}>{t('settings.baseLang')}</h2>
        <SegmentedControl<BaseLang>
          value={settings.baseLang}
          onChange={setBaseLang}
          options={[
            { value: 'ru', label: t('settings.baseLang.ru') },
            { value: 'en', label: t('settings.baseLang.en') },
          ]}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.label}>{t('settings.dialect')}</h2>
        <SegmentedControl<Dialect>
          value={settings.dialect}
          onChange={setDialect}
          options={[
            { value: 'eastern', label: t('settings.dialect.eastern') },
            { value: 'lori', label: t('settings.dialect.lori') },
          ]}
        />
      </section>

      <button type="button" className={styles.row} onClick={() => navigate('/settings/about')}>
        <span>{t('settings.about')}</span>
        <span className={styles.chevron}>›</span>
      </button>

      <div className={styles.resetWrap}>
        <Button variant="outline" fullWidth onClick={handleReset}>
          {t('settings.reset')}
        </Button>
      </div>
    </div>
  );
}
