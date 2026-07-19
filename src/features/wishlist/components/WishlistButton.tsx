import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import { tapScale } from "@/animations/variants";
import { toast } from "@/store/toastStore";
import { TOAST } from "@/constants/toast.constants";
import { useWishlistStore, useIsWishlisted } from "@/store/wishlistStore";
import type { Product } from "@/types/domain.types";

export interface WishlistButtonProps {
  product: Product;
  /** Extra classes on the button (size, background). */
  className?: string;
  /** Heart icon classes (size/stroke handled by presets below). */
  iconClassName?: string;
  /** Show a confirmation toast on toggle (default true). */
  toastOnToggle?: boolean;
}

/**
 * Heart toggle bound to the guest wishlist. Fills + pops when saved, outlines
 * when not. Stops click propagation so it can sit on top of a tappable card.
 */
export function WishlistButton({
  product,
  className,
  iconClassName,
  toastOnToggle = true,
}: WishlistButtonProps) {
  const saved = useIsWishlisted(product.id);
  const toggle = useWishlistStore((s) => s.toggle);

  const onToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const nowSaved = toggle(product);
    if (toastOnToggle) {
      toast.show(nowSaved ? TOAST.SAVED_TO_WISHLIST : TOAST.REMOVED_FROM_WISHLIST);
    }
  };

  return (
    <motion.button
      type="button"
      whileTap={tapScale}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      onClick={onToggle}
      className={cn(
        "flex items-center justify-center rounded-full transition-colors",
        className,
      )}
    >
      <motion.span
        key={saved ? "on" : "off"}
        initial={{ scale: saved ? 0.6 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className="flex"
      >
        <Heart
          className={cn(saved ? "text-rose-500" : "text-foreground", iconClassName)}
          strokeWidth={2}
          fill={saved ? "currentColor" : "none"}
        />
      </motion.span>
    </motion.button>
  );
}
