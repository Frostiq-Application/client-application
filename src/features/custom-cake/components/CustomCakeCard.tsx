import { useNavigate } from "react-router-dom";
import { CakeSlice, ChevronRight } from "lucide-react";
import { CUSTOM_CAKE_COPY } from "../constants";
import { ROUTES } from "@/routes/paths";

/**
 * Home promo card that opens the custom cake request flow. Rendered only when
 * the brand has the `can_use_custom_cake` feature.
 */
export function CustomCakeCard() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(ROUTES.CUSTOM_CAKE)}
      className="mx-4 flex w-[calc(100%-2rem)] items-center gap-4 rounded-3xl bg-gradient-to-r from-primary/15 to-primary/5 p-4 text-left"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <CakeSlice className="h-7 w-7" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold">{CUSTOM_CAKE_COPY.entryTitle}</p>
        <p className="truncate text-sm text-muted-foreground">
          {CUSTOM_CAKE_COPY.entrySubtitle}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </button>
  );
}
