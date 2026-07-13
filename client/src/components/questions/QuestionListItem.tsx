import { Link } from "react-router-dom";
import type { Question } from "../../types/question";
import { formatDate } from "../../utils/format-date";
import TagBadge from "./TagBadge";
import styles from "./QuestionListItem.module.css";

const EXCERPT_LENGTH = 180;

function toExcerpt(body: string): string {
  const trimmed = body.trim();
  return trimmed.length <= EXCERPT_LENGTH
    ? trimmed
    : `${trimmed.slice(0, EXCERPT_LENGTH).trimEnd()}…`;
}

export interface QuestionListItemProps {
  question: Question;
}

export default function QuestionListItem({ question }: QuestionListItemProps) {
  return (
    <article className={styles.item}>
      <Link to={`/questions/${question.id}`} className={styles.title}>
        {question.title}
      </Link>

      <p className={styles.excerpt}>{toExcerpt(question.body)}</p>

      {question.tags.length > 0 && (
        <ul className={styles.tags}>
          {question.tags.map((tag) => (
            <li key={tag}>
              <TagBadge tag={tag} />
            </li>
          ))}
        </ul>
      )}

      <p className={styles.meta}>
        asked {formatDate(question.createdAt)} by {question.user.nickname}
      </p>
    </article>
  );
}
