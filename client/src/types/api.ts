/** Success envelope used by every IVOverflow API endpoint (see .cursorrules). */
export interface ApiSuccess<T> {
  data: T;
}

/** Error envelope used by every IVOverflow API endpoint on failure. */
export interface ApiErrorBody {
  error: string;
}
