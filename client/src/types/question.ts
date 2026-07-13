import type { Answer } from "./answer";
import type { Author } from "./user";

export interface Question {
  id: string;
  userId: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  user: Author;
}

/** Response payload for GET /getQuestions */
export interface GetQuestionsResponse {
  questions: Question[];
}

/** Response payload for POST /createQuestion */
export interface CreateQuestionResponse {
  question: Question;
}

/** Request body for POST /createQuestion */
export interface CreateQuestionRequest {
  title: string;
  body: string;
  tags: string[];
}

/** Response payload for GET /getQuestionAnswer */
export interface GetQuestionAnswerResponse {
  question: Question;
  answers: Answer[]; // empty array until Stage 2
}
