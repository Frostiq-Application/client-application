import { useState } from "react";
import { UserRound } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useBrand } from "@/hooks/useStorefront";
import { customerService } from "@/services/api/customer.service";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import { normalizeError } from "@/lib/apiError";
import { env } from "@/config/env";
import { AUTH_COPY } from "../constants";
import { buildDevToken, useGoogleIdentity } from "../hooks/useGoogleIdentity";

export interface AuthSheetProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful sign-in (e.g. continue to checkout). */
  onAuthed?: () => void;
  title?: string;
  subtitle?: string;
}

/**
 * The sign-in sheet. Guests browse freely — this appears only when an action
 * needs an account (checkout, orders). Google sign-in via VITE_GOOGLE_CLIENT_ID;
 * dev fallback button when unset (backend decodes unverified in dev).
 */
export function AuthSheet({ open, onClose, onAuthed, title, subtitle }: AuthSheetProps) {
  const { data: brand } = useBrand();
  const signIn = useAuthStore((s) => s.signIn);
  const [busy, setBusy] = useState(false);

  const exchange = async (idToken: string) => {
    if (!brand) return;
    setBusy(true);
    try {
      const res = await customerService.googleLogin(brand.appSlug, idToken);
      signIn(res.accessToken, res.customer);
      toast.success(AUTH_COPY.WELCOME(res.customer.name));
      onClose();
      onAuthed?.();
    } catch (err) {
      toast.error(normalizeError(err).message || AUTH_COPY.FAILED);
    } finally {
      setBusy(false);
    }
  };

  const { buttonRef, devMode, ready } = useGoogleIdentity(
    (idToken) => void exchange(idToken),
    open,
  );

  return (
    <Sheet open={open} onClose={onClose} title={title ?? AUTH_COPY.TITLE}>
      <div className="flex flex-col items-center pb-2 pt-1 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/12 text-primary">
          <UserRound className="h-7 w-7" strokeWidth={2} />
        </div>
        <p className="mt-3 max-w-[17rem] text-sm leading-relaxed text-muted-foreground">
          {subtitle ?? AUTH_COPY.SUBTITLE}
        </p>

        <div className="mt-5 flex w-full flex-col items-center gap-3">
          {devMode ? (
            env.isDev && (
              <Button block loading={busy} onClick={() => void exchange(buildDevToken())}>
                {AUTH_COPY.DEV_LOGIN}
              </Button>
            )
          ) : (
            <>
              <div ref={buttonRef} className="flex min-h-[44px] justify-center" />
              {!ready && <Spinner />}
            </>
          )}
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground">{AUTH_COPY.TERMS}</p>
      </div>
    </Sheet>
  );
}
