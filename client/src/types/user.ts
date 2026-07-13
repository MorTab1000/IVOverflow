export interface User {
  id: string;
  nickname: string;
  fullName: string;
  email: string;
}

/** Lightweight author shape embedded in Question/Answer responses (no email exposed). */
export interface Author {
  id: string;
  nickname: string;
  fullName: string;
}
