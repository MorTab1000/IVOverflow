import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCreateQuestionMutation } from "../../api/questionsApi";
import { useAppSelector } from "../../app/hooks";
import { selectIsAuthenticated } from "../../features/auth/authSlice";
import type { CreateQuestionRequest } from "../../types/question";
import { getApiErrorMessage } from "../../utils/get-error-message";
import AskQuestionModal from "../questions/AskQuestionModal";
import AppHeader from "./AppHeader";

const CREATE_QUESTION_FAILED_MESSAGE = "Unable to submit your question. Please try again.";

/**
 * Layout route for every authenticated page: renders the shared `AppHeader`
 * plus the matched child route (`<Outlet />`) when a JWT is present,
 * otherwise redirects to `/login`. Also doubles as the target `authSlice.logout()`
 * relies on — once `token` becomes null (manual logout or a 401 from baseApi),
 * this component re-renders and performs the redirect automatically.
 *
 * `AskQuestionModal` (+ its `createQuestion` mutation) lives here rather than
 * inside `questions-page.tsx`: `AppHeader`'s "Ask question" button must open
 * it from *any* protected page (e.g. `/questions/:id`), and this is the
 * nearest common ancestor of `AppHeader` and every routed page.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();
  const [isAskQuestionModalOpen, setIsAskQuestionModalOpen] = useState(false);
  const [createQuestion, { isLoading: isCreating }] = useCreateQuestionMutation();
  const [createError, setCreateError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  function handleCloseModal() {
    setCreateError(null);
    setIsAskQuestionModalOpen(false);
  }

  async function handleCreateQuestion(values: CreateQuestionRequest) {
    setCreateError(null);

    try {
      // Cache invalidation (see questionsApi.ts `invalidatesTags`) refetches
      // the questions list automatically — no manual refetch needed here.
      await createQuestion(values).unwrap();
      setIsAskQuestionModalOpen(false);
    } catch (error) {
      setCreateError(getApiErrorMessage(error, CREATE_QUESTION_FAILED_MESSAGE));
    }
  }

  return (
    <>
      <AppHeader onAskQuestion={() => setIsAskQuestionModalOpen(true)} />
      <Outlet />
      <AskQuestionModal
        open={isAskQuestionModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateQuestion}
        isSubmitting={isCreating}
        errorMessage={createError}
      />
    </>
  );
}
