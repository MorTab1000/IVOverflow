import type { Answer } from "../../types/answer";
import { formatDate } from "../../utils/format-date";
import styles from "./AnswerListItem.module.css";

export interface AnswerListItemProps {
  answer: Answer;
}

export default function AnswerListItem({ answer }: AnswerListItemProps) {
  return (
    <article className={styles.item}>
      <p className={styles.body}>{answer.body}</p>
      <p className={styles.meta}>
        answered {formatDate(answer.createdAt)} by {answer.user.nickname}
      </p>
    </article>
  );
}
