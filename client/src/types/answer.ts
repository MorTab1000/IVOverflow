import type { Author } from "./user";

/**
 * Mirrors the Answer shape returned by GET /getQuestionAnswer and POST /answer
 * (with embedded Author — no email exposed).
 */
export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  body: string;
  createdAt: string;
  user: Author;
}

/** Request body for POST /answer */
export interface CreateAnswerRequest {
  questionId: string;
  body: string;
}

/** Response payload for POST /answer (wrapped in ApiSuccess by the server) */
export interface CreateAnswerResponse {
  answer: Answer;
}
