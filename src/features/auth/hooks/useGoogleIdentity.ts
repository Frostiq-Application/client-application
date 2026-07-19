import { useEffect, useRef, useState } from "react";
import { env } from "@/config/env";

/** Minimal Google Identity Services surface we use. */
interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: { theme: string; size: string; width?: number; shape?: string },
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });
}

/**
 * Renders the official Google button into `buttonRef` (uses VITE_GOOGLE_CLIENT_ID).
 * `active` must be true while the ref's element is mounted (e.g. sheet open) —
 * the Sheet unmounts its children when closed, so we (re)render per open.
 * When no client id is configured, `devMode` is true and the caller shows the
 * dev fallback (backend decodes tokens unverified in that mode).
 */
export function useGoogleIdentity(onCredential: (idToken: string) => void, active: boolean) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const devMode = !env.googleClientId;

  const handler = useRef(onCredential);
  useEffect(() => {
    handler.current = onCredential;
  });

  useEffect(() => {
    if (devMode || !active) return;
    let cancelled = false;
    void loadScript()
      .then(() => {
        if (cancelled || !window.google || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: env.googleClientId,
          callback: (res) => handler.current(res.credential),
        });
        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 320,
        });
        setReady(true);
      })
      .catch(() => setReady(false));
    return () => {
      cancelled = true;
    };
  }, [devMode, active]);

  return { buttonRef, ready, devMode };
}

/**
 * Dev-only unsigned "Google" token (backend decodes without verification when
 * GOOGLE_CLIENT_ID is unset). Stable sub so re-logins map to the same customer.
 */
export function buildDevToken(): string {
  const b64 = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const stableSub = localStorage.getItem("frostique-dev-sub") ?? `dev-${crypto.randomUUID()}`;
  localStorage.setItem("frostique-dev-sub", stableSub);
  const header = { alg: "none", typ: "JWT" };
  const payload = {
    sub: stableSub,
    email: "testuser@example.com",
    name: "Test User",
  };
  return `${b64(header)}.${b64(payload)}.devsig`;
}
