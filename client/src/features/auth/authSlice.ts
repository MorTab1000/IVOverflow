import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { User } from "../../types/user";

const STORAGE_KEY = "ivoverflow_auth";

export interface AuthState {
  token: string | null;
  user: User | null;
}

interface StoredAuth {
  token: string;
  user: User;
}

function loadStoredAuth(): AuthState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };

    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed.token || !parsed.user) return { token: null, user: null };

    return { token: parsed.token, user: parsed.user };
  } catch {
    // Corrupted/blocked storage (e.g. private browsing) — fall back to signed-out.
    return { token: null, user: null };
  }
}

function persistAuth(auth: StoredAuth | null): void {
  try {
    if (auth) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures — the in-memory Redux state remains the source of truth for this session.
  }
}

const initialState: AuthState = loadStoredAuth();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      persistAuth(action.payload);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      persistAuth(null);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthToken = (state: RootState): string | null => state.auth.token;
export const selectCurrentUser = (state: RootState): User | null => state.auth.user;
export const selectIsAuthenticated = (state: RootState): boolean => state.auth.token !== null;
