import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useCreateQuestionMutation, useGetQuestionsQuery } from "../api/questionsApi";
import type { ProtectedRouteContext } from "../components/layout/ProtectedRoute";
import AskQuestionModal from "../components/questions/AskQuestionModal";
import QuestionList from "../components/questions/QuestionList";
import type { CreateQuestionRequest } from "../types/question";
import { getApiErrorMessage } from "../utils/get-error-message";
import styles from "./questions-page.module.css";

const CREATE_QUESTION_FAILED_MESSAGE = "Unable to submit your question. Please try again.";

export default function QuestionsPage() {
  const { isAskQuestionModalOpen, closeAskQuestionModal } =
    useOutletContext<ProtectedRouteContext>();
  const { data, isLoading, isError } = useGetQuestionsQuery();
  const [createQuestion, { isLoading: isCreating }] = useCreateQuestionMutation();
  const [createError, setCreateError] = useState<string | null>(null);

  function handleCloseModal() {
    setCreateError(null);
    closeAskQuestionModal();
  }

  async function handleCreateQuestion(values: CreateQuestionRequest) {
    setCreateError(null);

    try {
      // Cache invalidation (see questionsApi.ts `invalidatesTags`) refetches
      // the list automatically — no manual refetch/state update needed here.
      await createQuestion(values).unwrap();
      closeAskQuestionModal();
    } catch (error) {
      setCreateError(getApiErrorMessage(error, CREATE_QUESTION_FAILED_MESSAGE));
    }
  }

  return (
    <main className={styles.page}>
      <QuestionList questions={data?.questions} isLoading={isLoading} isError={isError} />

      <AskQuestionModal
        open={isAskQuestionModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateQuestion}
        isSubmitting={isCreating}
        errorMessage={createError}
      />
    </main>
  );
}
