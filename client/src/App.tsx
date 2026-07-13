import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage from "./pages/login-page";
import QuestionsPage from "./pages/questions-page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<QuestionsPage />} />
          {/* Replaced with question-detail-page.tsx in Step 6 */}
          <Route path="/questions/:id" element={<div>Question Detail Placeholder</div>} />
        </Route>

        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
