import { Home, Search, ClipboardList, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/routes/paths";

export interface BottomNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  to: string;
}

/** Bottom tab bar — the four primary destinations. */
export const BOTTOM_NAV: readonly BottomNavItem[] = [
  { key: "home", label: "Home", icon: Home, to: ROUTES.HOME },
  { key: "search", label: "Search", icon: Search, to: ROUTES.SEARCH },
  { key: "orders", label: "Orders", icon: ClipboardList, to: ROUTES.ORDERS },
  { key: "profile", label: "Profile", icon: User, to: ROUTES.PROFILE },
] as const;
