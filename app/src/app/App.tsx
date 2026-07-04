import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { initTelegram } from '../hooks/useTelegramBackButton';
import {
  loadFromCloudStorage,
  syncToCloudStorage,
  useProgressStore,
} from '../store/progressStore';

export function App() {
  const hydrated = useProgressStore((s) => s.hydrated);

  useEffect(() => {
    initTelegram();
    loadFromCloudStorage();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const unsub = useProgressStore.subscribe(() => {
      syncToCloudStorage();
    });
    return unsub;
  }, [hydrated]);

  if (!hydrated) {
    return (
      <div className="appShell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>...</p>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
