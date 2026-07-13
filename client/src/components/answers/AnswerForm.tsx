import { useState, type FormEvent } from "react";
import Button from "../ui/Button";
import TextArea from "../ui/TextArea";
import styles from "./AnswerForm.module.css";

export interface AnswerFormSubmitValues {
  body: string;
}

export interface AnswerFormProps {
  onSubmit: (values: AnswerFormSubmitValues) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export default function AnswerForm({
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}: AnswerFormProps) {
  const [body, setBody] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!body.trim()) {
      setFieldError("Answer body is required");
      return;
    }

    setFieldError(undefined);
    onSubmit({ body: body.trim() });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextArea
        label="Your answer"
        name="body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        error={fieldError}
        disabled={isSubmitting}
        rows={5}
      />

      {errorMessage && (
        <p className={styles.formError} role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? "Posting…" : "Post your answer"}
      </Button>
    </form>
  );
}
