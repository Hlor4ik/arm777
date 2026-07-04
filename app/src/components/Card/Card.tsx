import styles from './Card.module.css';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  flagStripe?: boolean;
}

export function Card({ children, className, onClick, disabled, flagStripe }: Props) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={[styles.card, disabled ? styles.disabled : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {flagStripe && <div className={styles.stripe} />}
      {children}
    </Tag>
  );
}
