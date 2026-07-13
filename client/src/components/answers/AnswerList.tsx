import type { Answer } from "../../types/answer";
import AnswerListItem from "./AnswerListItem";
import styles from "./AnswerList.module.css";

export interface AnswerListProps {
  answers: Answer[];
}

export default function AnswerList({ answers }: AnswerListProps) {
  if (answers.length === 0) {
    return <p className={styles.empty}>No answers yet — be the first to reply!</p>;
  }

  return (
    <ul className={styles.list}>
      {answers.map((answer) => (
        <li key={answer.id}>
          <AnswerListItem answer={answer} />
        </li>
      ))}
    </ul>
  );
}
