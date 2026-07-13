import { useId, type TextareaHTMLAttributes } from "react";
import styles from "./TextArea.module.css";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export default function TextArea({
  label,
  error,
  id,
  className,
  rows = 5,
  ...rest
}: TextAreaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label htmlFor={textareaId} className={styles.label}>
        {label}
      </label>
      <textarea
        id={textareaId}
        className={styles.textarea}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${textareaId}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
