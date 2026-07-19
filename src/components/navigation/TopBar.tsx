import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { tapScale } from "@/animations/variants";

export interface TopBarProps {
  title?: string;
  /** Show the iOS-style back chevron; navigates -1 unless backTo is given. */
  back?: boolean;
  backTo?: string;
  /** Right-side actions (icon buttons). */
  actions?: ReactNode;
  /** Large-title mode renders the big heading under the bar (Home-style pages). */
  large?: boolean;
  className?: string;
}

/**
 * Sticky frosted top navigation bar. Compact by default; `large` adds an
 * iOS large-title block that scrolls with the page while the bar stays.
 */
export function TopBar({ title, back, backTo, actions, large, className }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className={cn("blur-surface sticky top-0 z-40 shrink-0", className)}>
      <div className="mx-auto flex h-12 w-full items-center gap-1 px-2 md:max-w-3xl md:px-4 lg:max-w-5xl xl:max-w-6xl">
        {back && (
          <motion.button
            type="button"
            whileTap={tapScale}
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
          </motion.button>
        )}
        {!large && title && (
          <h1 className={cn("min-w-0 flex-1 truncate text-[17px] font-bold", !back && "pl-2")}>
            {title}
          </h1>
        )}
        {large && <div className="flex-1" />}
        {actions && <div className="ml-auto flex items-center gap-1 pr-1">{actions}</div>}
      </div>
      {large && title && (
        <div className="mx-auto w-full px-4 pb-2 md:max-w-3xl md:px-6 lg:max-w-5xl xl:max-w-6xl">
          <h1 className="text-[28px] font-extrabold tracking-tight">{title}</h1>
        </div>
      )}
    </header>
  );
}

/** Round icon button for TopBar actions. */
export function TopBarAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileTap={tapScale}
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
    >
      {children}
    </motion.button>
  );
}
