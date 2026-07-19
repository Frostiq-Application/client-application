import { useEffect, type ReactNode } from "react";
import { onUnauthorized } from "@/lib/authToken";
import { useAuthStore } from "@/store/authStore";

/**
 * Bridges the network layer's 401 signal to the auth store: on an expired
 * session we sign the customer out so guards redirect to login.
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => onUnauthorized(signOut), [signOut]);

  return <>{children}</>;
}
