import { useCallback } from 'react';
import { useProgressStore } from '../store/progressStore';
import ru from './ru.json';
import en from './en.json';

const dict = { ru, en } as const;

export function useT() {
  const baseLang = useProgressStore((s) => s.settings.baseLang);

  const t = useCallback(
    (key: keyof typeof ru): string => {
      return dict[baseLang][key] ?? key;
    },
    [baseLang]
  );

  return { t, lang: baseLang };
}
