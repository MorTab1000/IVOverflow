import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectIsAuthenticated } from "../../features/auth/authSlice";
import AppHeader from "./AppHeader";

/**
 * Shared with the routed child via `<Outlet context>` so pages can render
 * the Ask Question modal that `AppHeader` (a sibling, not an ancestor of the
 * routed page) triggers. Consume with `useOutletContext<ProtectedRouteContext>()`.
 */
export interface ProtectedRouteContext {
  isAskQuestionModalOpen: boolean;
  closeAskQuestionModal: () => void;
}

/**
 * Layout route for every authenticated page: renders the shared `AppHeader`
 * plus the matched child route (`<Outlet />`) when a JWT is present,
 * otherwise redirects to `/login`. Also doubles as the target `authSlice.logout()`
 * relies on — once `token` becomes null (manual logout or a 401 from baseApi),
 * this component re-renders and performs the redirect automatically.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();
  const [isAskQuestionModalOpen, setIsAskQuestionModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const outletContext: ProtectedRouteContext = {
    isAskQuestionModalOpen,
    closeAskQuestionModal: () => setIsAskQuestionModalOpen(false),
  };

  return (
    <>
      <AppHeader onAskQuestion={() => setIsAskQuestionModalOpen(true)} />
      <Outlet context={outletContext} />
    </>
  );
}
