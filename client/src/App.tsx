import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage from "./pages/login-page";
import QuestionDetailPage from "./pages/question-detail-page";
import QuestionsPage from "./pages/questions-page";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<QuestionsPage />} />
          <Route path="/questions/:id" element={<QuestionDetailPage />} />
        </Route>

        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
