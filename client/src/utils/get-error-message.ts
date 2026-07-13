import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

function hasErrorField(data: unknown): data is { error: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  );
}

/**
 * Extracts the `{ error: string }` message the backend sends on failed
 * requests (per .cursorrules response envelope). Falls back to a generic
 * message for network errors or unexpected shapes.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isFetchBaseQueryError(error) && hasErrorField(error.data)) {
    return error.data.error;
  }

  return fallback;
}
