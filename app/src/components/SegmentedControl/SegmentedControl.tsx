import styles from './SegmentedControl.module.css';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div className={styles.wrap} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={value === opt.value ? `${styles.item} ${styles.active}` : styles.item}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
