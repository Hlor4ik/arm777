import styles from './AnswerOptions.module.css';

interface Props {
  options: string[];
  selected?: string;
  correct?: string;
  revealed?: boolean;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export function AnswerOptions({
  options,
  selected,
  correct,
  revealed,
  onSelect,
  disabled,
}: Props) {
  return (
    <div className={styles.list}>
      {options.map((opt) => {
        let cls = styles.option;
        if (revealed && opt === correct) cls += ` ${styles.correct}`;
        else if (revealed && opt === selected && opt !== correct) cls += ` ${styles.wrong}`;
        else if (opt === selected) cls += ` ${styles.selected}`;

        return (
          <button
            key={opt}
            type="button"
            className={cls}
            disabled={disabled || revealed}
            onClick={() => onSelect(opt)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
