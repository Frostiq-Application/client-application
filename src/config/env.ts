/**
 * Typed, validated access to Vite env vars. Import from here — never touch
 * import.meta.env directly elsewhere.
 */

interface AppEnv {
  apiBaseUrl: string;
  /** Tenant this white-label build serves — the tenant schema name. */
  tenantId: string;
  googleClientId: string;
  isDev: boolean;
}

function required(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const env: AppEnv = {
  apiBaseUrl: required(import.meta.env.VITE_API_BASE_URL, "VITE_API_BASE_URL"),
  tenantId: required(import.meta.env.VITE_TENANT_ID, "VITE_TENANT_ID"),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
  isDev: import.meta.env.DEV,
};
