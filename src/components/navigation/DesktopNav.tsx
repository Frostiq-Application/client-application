import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cake } from "lucide-react";
import { BOTTOM_NAV } from "@/constants/navigation.constants";
import { APP } from "@/constants/app.constants";
import { ROUTES } from "@/routes/paths";
import { useBrand } from "@/hooks/useStorefront";
import { cn } from "@/lib/cn";
import { IOS_SPRING } from "@/animations/variants";

/**
 * Top navigation for tablet/laptop/desktop (md+). Replaces the bottom tab
 * bar: brand identity on the left, the four destinations on the right.
 */
export function DesktopNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: brand } = useBrand();

  return (
    <header className="blur-surface sticky top-0 z-40 hidden shrink-0 border-b border-border/60 md:block">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6 lg:max-w-5xl xl:max-w-6xl">
        <button
          type="button"
          onClick={() => navigate(ROUTES.HOME)}
          className="flex items-center gap-2.5"
          aria-label="Home"
        >
          {brand?.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt=""
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-border"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Cake className="h-5 w-5" />
            </span>
          )}
          <span className="text-lg font-extrabold tracking-tight">
            {brand?.name ?? APP.NAME}
          </span>
        </button>

        <nav aria-label="Primary" className="flex items-center gap-1">
          {BOTTOM_NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="desktop-nav-pill"
                    transition={IOS_SPRING}
                    className="absolute inset-0 rounded-2xl bg-primary/10"
                  />
                )}
                <Icon className="relative h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
                <span className="relative">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
