import type { AnswerWithVotes } from "../../types/answer";
import AnswerListItem from "./AnswerListItem";
import styles from "./AnswerList.module.css";

export interface AnswerListProps {
  answers: AnswerWithVotes[];
  onVote: (answerId: string, value: 1 | -1) => void;
}

export default function AnswerList({ answers, onVote }: AnswerListProps) {
  if (answers.length === 0) {
    return <p className={styles.empty}>No answers yet — be the first to reply!</p>;
  }

  return (
    <ul className={styles.list}>
      {answers.map((answer) => (
        <li key={answer.id}>
          <AnswerListItem
            answer={answer}
            score={answer.score}
            myVote={answer.myVote}
            onVote={(value) => onVote(answer.id, value)}
          />
        </li>
      ))}
    </ul>
  );
}
