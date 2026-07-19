import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/paths";
import { EASE_OUT, IOS_SPRING } from "@/animations/variants";
import { RotatingSearchBar } from "./RotatingSearchBar";
import { HOME_COPY } from "../constants";
import type { Branch } from "@/types/domain.types";

export interface CollapsedHeaderProps {
  visible: boolean;
  branch: Branch | null;
  onBranchTap: () => void;
}

/**
 * Compact frosted bar that slides in once the hero header scrolls away:
 * one-line address + the rotating search bar stay within thumb's reach.
 */
export function CollapsedHeader({ visible, branch, onBranchTap }: CollapsedHeaderProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -88, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: IOS_SPRING }}
          exit={{ y: -88, opacity: 0, transition: EASE_OUT }}
          className="blur-surface absolute inset-x-0 top-0 z-30 border-b border-border/60 shadow-sm"
        >
          <div className="mx-auto w-full px-4 pb-2.5 pt-2 lg:max-w-5xl lg:px-6">
            <button
              type="button"
              onClick={onBranchTap}
              className="mb-1.5 flex max-w-full items-center gap-1"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} />
              <span className="truncate text-[13px] font-bold">
                {branch ? (branch.displayArea ?? branch.branchName) : HOME_COPY.SELECT_BRANCH}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
            </button>
            <RotatingSearchBar compact onTap={() => navigate(ROUTES.SEARCH)} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
