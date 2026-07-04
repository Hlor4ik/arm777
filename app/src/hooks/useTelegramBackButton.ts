import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  if (!tg) return;
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0b1426');
  tg.setBackgroundColor('#0b1426');
}

export function haptic(type: 'light' | 'success' | 'error' = 'light') {
  const hf = window.Telegram?.WebApp?.HapticFeedback;
  if (!hf) return;
  if (type === 'success') hf.notificationOccurred('success');
  else if (type === 'error') hf.notificationOccurred('error');
  else hf.impactOccurred('light');
}
