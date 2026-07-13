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

/** Answer row from GET /getQuestionAnswer after Stage 3 (includes vote summary). */
export interface AnswerWithVotes extends Answer {
  score: number;
  myVote: 1 | -1 | null;
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

/** Client arg for POST /vote — questionId is for RTK Query tag invalidation only. */
export interface VoteRequest {
  answerId: string;
  value: 1 | -1;
  questionId: string;
}

/** Response payload for POST /vote (wrapped in ApiSuccess by the server) */
export interface VoteResponse {
  vote: {
    id: string;
    answerId: string;
    userId: string;
    value: number;
  } | null;
  score: number;
}
