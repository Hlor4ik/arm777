import { Outlet, useLocation } from 'react-router-dom';
import { TabBar } from '../components/TabBar/TabBar';
import { useTelegramBackButton } from '../hooks/useTelegramBackButton';

const TAB_ROUTES = ['/modes', '/folders', '/progress', '/settings'];

export function Layout() {
  const { pathname } = useLocation();
  const showTabBar = TAB_ROUTES.includes(pathname);
  useTelegramBackButton(!showTabBar);

  return (
    <div className="appShell">
      <main className={showTabBar ? 'appMain' : 'appMain noTabBar'}>
        <Outlet />
      </main>
      {showTabBar && <TabBar />}
    </div>
  );
}
