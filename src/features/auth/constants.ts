/** Copy for the auth feature. */

export const AUTH_COPY = {
  TITLE: "Almost there!",
  SUBTITLE: "Sign in to place your order and track it live.",
  PROFILE_TITLE: "Sign in",
  PROFILE_SUBTITLE: "Sync your orders and addresses across devices.",
  DEV_LOGIN: "Continue as test user",
  WELCOME: (name: string | null) => (name ? `Welcome, ${name}!` : "Welcome!"),
  SIGN_OUT: "Sign out",
  TERMS: "By continuing you agree to receive order updates.",
  FAILED: "Sign-in failed. Please try again.",
} as const;
