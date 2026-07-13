/** Formats an ISO date string (e.g. Question.createdAt) as "Jul 13, 2026". */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "unknown date";
  }

  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
