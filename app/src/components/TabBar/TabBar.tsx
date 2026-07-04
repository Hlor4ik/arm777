import styles from './TabBar.module.css';
import { NavLink, useLocation } from 'react-router-dom';
import { useT } from '../../i18n/useT';

const tabs = [
  { to: '/modes', key: 'tabs.modes' as const, icon: 'modes' },
  { to: '/folders', key: 'tabs.folders' as const, icon: 'folder' },
  { to: '/progress', key: 'tabs.progress' as const, icon: 'chart' },
  { to: '/settings', key: 'tabs.settings' as const, icon: 'gear' },
] as const;

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const c = active ? '#d4a853' : '#6e6a65';
  const sw = 1.6;

  if (name === 'modes') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L6.2 7.2l4-.6L12 3Z" stroke={c} strokeWidth={sw} fill={active ? 'rgba(212,168,83,0.15)' : 'none'} />
      </svg>
    );
  }

  const props = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: c,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'folder':
      return (
        <svg {...props}>
          <path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...props}>
          <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
        </svg>
      );
    case 'gear':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    default:
      return null;
  }
}

export function TabBar() {
  const { t } = useT();
  const { pathname } = useLocation();
  const onHome = pathname === '/';

  return (
    <nav className={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = !onHome && pathname === tab.to;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={isActive ? `${styles.tab} ${styles.active}` : styles.tab}
          >
            <span className={styles.icon}>
              <TabIcon name={tab.icon} active={isActive} />
            </span>
            <span className={styles.label}>{t(tab.key)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
