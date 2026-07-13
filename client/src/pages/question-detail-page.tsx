import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCreateAnswerMutation } from "../api/answersApi";
import { useGetQuestionAnswerQuery } from "../api/questionsApi";
import AnswerForm from "../components/answers/AnswerForm";
import type { AnswerFormSubmitValues } from "../components/answers/AnswerForm";
import AnswerList from "../components/answers/AnswerList";
import TagBadge from "../components/questions/TagBadge";
import { formatDate } from "../utils/format-date";
import { getApiErrorMessage } from "../utils/get-error-message";
import styles from "./question-detail-page.module.css";

const CREATE_ANSWER_FAILED_MESSAGE = "Unable to submit your answer. Please try again.";

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetQuestionAnswerQuery(id ?? "", { skip: !id });
  const [createAnswer, { isLoading: isSubmitting }] = useCreateAnswerMutation();
  const [formKey, setFormKey] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!id) {
    return (
      <main className={styles.page}>
        <p className={styles.statusError}>Question not found.</p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <p className={styles.status}>Loading question…</p>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className={styles.page}>
        <p className={styles.statusError}>Unable to load this question. Please try again.</p>
      </main>
    );
  }

  const { question, answers } = data;

  async function handleCreateAnswer({ body }: AnswerFormSubmitValues) {
    setSubmitError(null);

    try {
      // answersApi invalidatesTags → getQuestionAnswer refetches automatically
      await createAnswer({ questionId: id!, body }).unwrap();
      setFormKey((key) => key + 1);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, CREATE_ANSWER_FAILED_MESSAGE));
    }
  }

  return (
    <main className={styles.page}>
      <article>
        <h1 className={styles.title}>{question.title}</h1>
        <p className={styles.meta}>
          Asked {formatDate(question.createdAt)} by {question.user.nickname}
        </p>

        <hr className={styles.divider} />

        <p className={styles.body}>{question.body}</p>

        {question.tags.length > 0 && (
          <ul className={styles.tags}>
            {question.tags.map((tag) => (
              <li key={tag}>
                <TagBadge tag={tag} />
              </li>
            ))}
          </ul>
        )}
      </article>

      <section className={styles.answersSection} aria-labelledby="answers-heading">
        <h2 id="answers-heading" className={styles.answersTitle}>
          {answers.length === 1 ? "1 Answer" : `${answers.length} Answers`}
        </h2>
        <AnswerList answers={answers} />
      </section>

      <section className={styles.answerFormSection} aria-labelledby="answer-form-heading">
        <h2 id="answer-form-heading" className={styles.answerFormTitle}>
          Your Answer
        </h2>
        <AnswerForm
          key={`${id}-${formKey}`}
          onSubmit={handleCreateAnswer}
          isSubmitting={isSubmitting}
          errorMessage={submitError}
        />
      </section>
    </main>
  );
}
