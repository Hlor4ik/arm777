export {};

declare global {
  interface SafeAreaInset {
    top: number;
    bottom: number;
    left: number;
    right: number;
  }

  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        isFullscreen?: boolean;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        safeAreaInset?: SafeAreaInset;
        contentSafeAreaInset?: SafeAreaInset;
        onEvent?: (event: string, handler: () => void) => void;
        offEvent?: (event: string, handler: () => void) => void;
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
        CloudStorage?: {
          setItem: (key: string, value: string, cb: (err: Error | null) => void) => void;
          getItem: (key: string, cb: (err: Error | null, val: string | null) => void) => void;
          removeItem: (key: string, cb: (err: Error | null) => void) => void;
        };
      };
    };
  }
}
