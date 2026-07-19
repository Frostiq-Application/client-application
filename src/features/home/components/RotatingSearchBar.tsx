import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { useRotatingIndex } from "@/hooks/useRotatingIndex";
import { SEARCH_PREFIX, SEARCH_ROTATE_MS, SEARCH_SUGGESTIONS } from "../constants";

export interface RotatingSearchBarProps {
  onTap: () => void;
  className?: string;
  compact?: boolean;
}

const EASE_IOS = [0.32, 0.72, 0, 1] as const;

const containerVariants = {
  visible: { transition: { staggerChildren: 0.035 } },
  exit: { transition: { staggerChildren: 0.012 } },
};

const charVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.28, ease: EASE_IOS } },
  exit: { y: -10, opacity: 0, transition: { duration: 0.14, ease: EASE_IOS } },
};

/**
 * Tappable search bar whose placeholder cycles through suggestions with a
 * staggered per-character reveal. Navigates to Search on tap — the real
 * input lives on the Search page.
 */
export function RotatingSearchBar({ onTap, className, compact }: RotatingSearchBarProps) {
  const index = useRotatingIndex(SEARCH_SUGGESTIONS.length, SEARCH_ROTATE_MS);
  const suggestion = SEARCH_SUGGESTIONS[index] ?? SEARCH_SUGGESTIONS[0];

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label="Search products"
      className={cn(
        "flex w-full items-center gap-2 rounded-2xl bg-surface px-3.5 text-left shadow-card transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        compact ? "h-10" : "h-11",
        className,
      )}
    >
      <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" strokeWidth={2.25} />
      <span
        className={cn(
          "flex flex-1 items-center overflow-hidden whitespace-nowrap text-muted-foreground",
          compact ? "h-5 text-sm leading-5" : "h-6 text-base leading-6",
        )}
      >
        <span className="shrink-0">{SEARCH_PREFIX}&nbsp;&ldquo;</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={index}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-hidden
            className="inline-flex"
          >
            {[...`${suggestion}”`].map((char, i) => (
              <motion.span
                key={`${char}-${i}`}
                variants={charVariants}
                className="inline-block"
              >
                {/* flex items collapse plain spaces, so render nbsp */}
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
