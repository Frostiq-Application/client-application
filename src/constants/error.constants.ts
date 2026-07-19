/** User-facing error copy. Keep messages calm and actionable. */

export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "You appear to be offline. Check your connection.",
  TIMEOUT: "The request took too long. Please try again.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You don't have access to this.",
  NOT_FOUND: "We couldn't find what you're looking for.",
  SERVER: "Our kitchen is a little busy. Please try again shortly.",
  VALIDATION: "Please check the highlighted fields.",
} as const;

export const ERROR_TITLES = {
  OFFLINE: "No connection",
  NOT_FOUND: "Nothing here",
  GENERIC: "Oops",
} as const;
