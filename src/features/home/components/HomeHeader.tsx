import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, MapPin, SlidersVertical } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/authStore";
import { useWishlistCount } from "@/store/wishlistStore";
import { toast } from "@/store/toastStore";
import { ROUTES } from "@/routes/paths";
import { APP } from "@/constants/app.constants";
import { tapScale } from "@/animations/variants";
import { RotatingSearchBar } from "./RotatingSearchBar";
import { getGreeting, HOME_COPY } from "../constants";
import type { Branch, Brand } from "@/types/domain.types";

export interface HomeHeaderProps {
  brand: Brand | null;
  branch: Branch | null;
  onBranchTap: () => void;
}

/**
 * Reference-design header: avatar + greeting/name line, circular location &
 * bell actions, then the rotating search bar with a filter button.
 */
export function HomeHeader({ brand, branch, onBranchTap }: HomeHeaderProps) {
  const navigate = useNavigate();
  const customer = useAuthStore((s) => s.customer);
  const wishlistCount = useWishlistCount();

  const displayName = customer?.name ?? brand?.name ?? APP.NAME;

  return (
    <div className="px-4 pb-3 pt-3 md:pt-5">
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={tapScale}
          aria-label="Profile"
          onClick={() => navigate(ROUTES.PROFILE)}
          className="shrink-0 rounded-full shadow-card"
        >
          <Avatar size="md" name={customer?.name ?? brand?.name ?? null} src={brand?.logoUrl ?? null} />
        </motion.button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {getGreeting(new Date().getHours())}
          </p>
          <h1 className="truncate text-[17px] font-extrabold leading-6 tracking-tight">
            {displayName}
          </h1>
        </div>

        <CircleAction label={branch?.displayArea ?? HOME_COPY.SELECT_BRANCH} onClick={onBranchTap}>
          <MapPin className="h-[19px] w-[19px]" strokeWidth={2.2} />
        </CircleAction>
        <CircleAction
          label="Wishlist"
          onClick={() => navigate(ROUTES.WISHLIST)}
          badge={wishlistCount}
        >
          <Heart className="h-[19px] w-[19px]" strokeWidth={2.2} />
        </CircleAction>
        <CircleAction label="Notifications" onClick={() => toast.show(HOME_COPY.NO_NOTIFICATIONS)}>
          <Bell className="h-[19px] w-[19px]" strokeWidth={2.2} />
        </CircleAction>
      </div>

      <div className="mt-3.5 flex items-center gap-2 md:max-w-xl">
        <RotatingSearchBar onTap={() => navigate(ROUTES.SEARCH)} className="flex-1" />
        <motion.button
          type="button"
          whileTap={tapScale}
          aria-label="Search filters"
          onClick={() => navigate(ROUTES.SEARCH)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-card"
        >
          <SlidersVertical className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </motion.button>
      </div>
    </div>
  );
}

function CircleAction({
  label,
  onClick,
  children,
  badge = 0,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  /** When > 0, shows a count pill in the top-right corner. */
  badge?: number;
}) {
  return (
    <motion.button
      type="button"
      whileTap={tapScale}
      aria-label={badge > 0 ? `${label} (${badge})` : label}
      onClick={onClick}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-foreground shadow-card"
    >
      {children}
      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </motion.button>
  );
}
