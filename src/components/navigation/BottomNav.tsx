import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { BOTTOM_NAV } from "@/constants/navigation.constants";
import { cn } from "@/lib/cn";
import { IOS_SPRING } from "@/animations/variants";

/**
 * Frosted bottom tab bar with an animated active indicator and icon pop.
 * Safe-area padding keeps it clear of the home indicator on real devices.
 */
export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="blur-surface z-40 shrink-0 border-t border-border/60 pb-safe-bottom lg:hidden"
    >
      <div className="flex h-[64px] items-stretch px-2">
        {BOTTOM_NAV.map((item) => {
          const active =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.key}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5"
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-pill"
                  transition={IOS_SPRING}
                  className="absolute top-1.5 h-[30px] w-14 rounded-full bg-primary/12"
                />
              )}
              <motion.span
                animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
                transition={IOS_SPRING}
                className="relative"
              >
                <Icon
                  className={cn(
                    "h-[22px] w-[22px]",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                  strokeWidth={active ? 2.4 : 2}
                />
              </motion.span>
              <span
                className={cn(
                  "relative text-[10px] font-semibold",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
