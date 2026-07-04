import { Outlet, useLocation } from 'react-router-dom';
import { TabBar } from '../components/TabBar/TabBar';
import { useTelegramBackButton } from '../hooks/useTelegramBackButton';

const TAB_ROUTES = ['/', '/modes', '/folders', '/progress', '/settings'];
const FULLSCREEN_ROUTES = ['/world'];

export function Layout() {
  const { pathname } = useLocation();
  const showTabBar = TAB_ROUTES.includes(pathname);
  const isWorld = FULLSCREEN_ROUTES.includes(pathname);
  useTelegramBackButton(!showTabBar);

  return (
    <div className={`appShell${isWorld ? ' worldShell' : ''}`}>
      <main className={showTabBar ? 'appMain' : `appMain noTabBar${isWorld ? ' worldMain' : ''}`}>
        <Outlet />
      </main>
      {showTabBar && <TabBar />}
    </div>
  );
}
