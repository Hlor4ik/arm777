import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function applySafeAreaInsets() {
  const tg = window.Telegram?.WebApp;
  const contentTop = tg?.contentSafeAreaInset?.top ?? 0;
  const safeTop = tg?.safeAreaInset?.top ?? 0;
  const headerFallback = tg?.isFullscreen ? 52 : 0;
  const top = Math.max(contentTop, safeTop, headerFallback);
  const bottom = Math.max(tg?.safeAreaInset?.bottom ?? 0, 0);

  document.documentElement.style.setProperty('--safe-top', `${top}px`);
  document.documentElement.style.setProperty('--safe-bottom', `${bottom}px`);
}

export function useTelegramBackButton(show: boolean) {
  const navigate = useNavigate();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const handler = () => navigate(-1);

    if (show) {
      tg.BackButton.show();
      tg.BackButton.onClick(handler);
    } else {
      tg.BackButton.hide();
    }

    return () => {
      tg.BackButton.offClick(handler);
      tg.BackButton.hide();
    };
  }, [show, navigate]);
}

export function initTelegram() {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    applySafeAreaInsets();
    return;
  }

  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0b1426');
  tg.setBackgroundColor('#0b1426');
  applySafeAreaInsets();

  const onInsetsChange = () => applySafeAreaInsets();
  tg.onEvent?.('viewportChanged', onInsetsChange);
  tg.onEvent?.('safeAreaChanged', onInsetsChange);
  tg.onEvent?.('contentSafeAreaChanged', onInsetsChange);
}

export function haptic(type: 'light' | 'success' | 'error' = 'light') {
  const hf = window.Telegram?.WebApp?.HapticFeedback;
  if (!hf) return;
  if (type === 'success') hf.notificationOccurred('success');
  else if (type === 'error') hf.notificationOccurred('error');
  else hf.impactOccurred('light');
}
