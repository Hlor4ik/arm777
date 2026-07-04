import styles from './TabBar.module.css';
import { NavLink } from 'react-router-dom';
import { useT } from '../../i18n/useT';

const tabs = [
  { to: '/modes', key: 'tabs.modes' as const, icon: '◫' },
  { to: '/folders', key: 'tabs.folders' as const, icon: '▤' },
  { to: '/progress', key: 'tabs.progress' as const, icon: '◔' },
  { to: '/settings', key: 'tabs.settings' as const, icon: '⚙' },
];

export function TabBar() {
  const { t } = useT();

  return (
    <nav className={styles.tabBar}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            isActive ? `${styles.tab} ${styles.active}` : styles.tab
          }
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{t(tab.key)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
