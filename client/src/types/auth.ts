import type { User } from "./user";

/** Request body for POST /login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Response payload for POST /login */
export interface LoginResponseData {
  token: string;
  user: User;
}
