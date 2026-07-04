import styles from './TabBar.module.css';
import { NavLink } from 'react-router-dom';
import { useT } from '../../i18n/useT';

const tabs = [
  { to: '/', key: 'tabs.home' as const, icon: 'home' },
  { to: '/modes', key: 'tabs.modes' as const, icon: 'grid' },
  { to: '/folders', key: 'tabs.folders' as const, icon: 'folder' },
  { to: '/progress', key: 'tabs.progress' as const, icon: 'chart' },
  { to: '/settings', key: 'tabs.settings' as const, icon: 'gear' },
] as const;

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? 'var(--accent-primary)' : 'var(--text-muted)';
  const props = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return (
        <svg {...props}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...props}>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'folder':
      return (
        <svg {...props}>
          <path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...props}>
          <path d="M5 19V9" />
          <path d="M12 19V5" />
          <path d="M19 19v-7" />
        </svg>
      );
    case 'gear':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
        </svg>
      );
    default:
      return null;
  }
}

export function TabBar() {
  const { t } = useT();

  return (
    <nav className={styles.tabBar}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            isActive ? `${styles.tab} ${styles.active}` : styles.tab
          }
        >
          {({ isActive }) => (
            <>
              <span className={styles.icon}>
                <TabIcon name={tab.icon} active={isActive} />
              </span>
              <span className={styles.label}>{t(tab.key)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
