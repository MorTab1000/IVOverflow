import { useParams } from "react-router-dom";
import { useGetQuestionAnswerQuery } from "../api/questionsApi";
import TagBadge from "../components/questions/TagBadge";
import { formatDate } from "../utils/format-date";
import styles from "./question-detail-page.module.css";

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetQuestionAnswerQuery(id ?? "", { skip: !id });

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

  const { question } = data;

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

      <section className={styles.answersPlaceholder}>
        <h2 className={styles.answersTitle}>Answers</h2>
        <p className={styles.answersNote}>
          Answers and voting features will be unlocked in Stage 2 &amp; 3.
        </p>
      </section>
    </main>
  );
}
