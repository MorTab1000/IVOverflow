import { useState, type FormEvent } from "react";
import type { CreateQuestionRequest } from "../../types/question";
import Button from "../ui/Button";
import TextArea from "../ui/TextArea";
import TextField from "../ui/TextField";
import styles from "./AskQuestionForm.module.css";

export interface AskQuestionFormProps {
  onSubmit: (values: CreateQuestionRequest) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

interface FieldErrors {
  title?: string;
  body?: string;
}

/** Splits a comma-separated tags string into trimmed, non-empty tag values. */
function parseTags(rawTags: string): string[] {
  return rawTags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export default function AskQuestionForm({
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}: AskQuestionFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    }
    if (!body.trim()) {
      errors.body = "Question body is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      body: body.trim(),
      tags: parseTags(tagsInput),
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Title"
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={fieldErrors.title}
        disabled={isSubmitting}
      />

      <TextArea
        label="Question"
        name="body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        error={fieldErrors.body}
        disabled={isSubmitting}
        rows={6}
      />

      <TextField
        label="Tags separated by ,"
        name="tags"
        value={tagsInput}
        onChange={(event) => setTagsInput(event.target.value)}
        disabled={isSubmitting}
        placeholder="react, typescript, redux"
      />

      {errorMessage && (
        <p className={styles.formError} role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? "Submitting…" : "Submit"}
      </Button>
    </form>
  );
}
