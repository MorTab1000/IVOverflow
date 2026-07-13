import type { Author } from "./user";

/**
 * Stage 2 model. Typed now because GET /getQuestionAnswer already returns
 * an `answers` array (empty until Stage 2 ships) — kept here to avoid drift.
 */
export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  body: string;
  createdAt: string;
  user: Author;
}
