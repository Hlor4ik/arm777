import styles from './Button.module.css';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  fullWidth,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        fullWidth ? styles.full : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
