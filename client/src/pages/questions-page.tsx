import { useGetQuestionsQuery } from "../api/questionsApi";
import QuestionList from "../components/questions/QuestionList";
import styles from "./questions-page.module.css";

export default function QuestionsPage() {
  const { data, isLoading, isError } = useGetQuestionsQuery();

  return (
    <main className={styles.page}>
      <QuestionList questions={data?.questions} isLoading={isLoading} isError={isError} />
    </main>
  );
}
