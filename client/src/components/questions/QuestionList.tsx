import type { Question } from "../../types/question";
import QuestionListItem from "./QuestionListItem";
import styles from "./QuestionList.module.css";

export interface QuestionListProps {
  questions: Question[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export default function QuestionList({ questions, isLoading, isError }: QuestionListProps) {
  if (isLoading) {
    return <p className={styles.status}>Loading questions…</p>;
  }

  if (isError) {
    return (
      <p className={styles.statusError}>
        Something went wrong while loading questions. Please try again.
      </p>
    );
  }

  if (!questions || questions.length === 0) {
    return <p className={styles.status}>No questions yet — be the first to ask one!</p>;
  }

  return (
    <ul className={styles.list}>
      {questions.map((question) => (
        <li key={question.id}>
          <QuestionListItem question={question} />
        </li>
      ))}
    </ul>
  );
}
