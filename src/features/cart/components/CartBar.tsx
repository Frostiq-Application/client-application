import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { useCartCount, useCartSubtotal } from "@/store/cartStore";
import { formatCurrency } from "@/utils/format";
import { ROUTES } from "@/routes/paths";
import { IOS_SPRING, tapScale } from "@/animations/variants";
import { CART_COPY } from "../constants";

/** Floating "View Cart" bar shown above the tab bar when the cart has items. */
export function CartBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const count = useCartCount();
  const subtotal = useCartSubtotal();

  const visible = count > 0 && pathname !== ROUTES.CART;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: IOS_SPRING }}
          exit={{ y: 90, opacity: 0, transition: { duration: 0.18 } }}
          whileTap={tapScale}
          onClick={() => navigate(ROUTES.CART)}
          className="absolute inset-x-4 bottom-[84px] z-40 flex h-[52px] items-center justify-between rounded-full bg-primary px-5 text-primary-foreground shadow-fab md:inset-x-auto md:bottom-8 md:right-8 md:w-80"
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <ShoppingBag className="h-4.5 w-4.5" strokeWidth={2.4} />
            {count} {count === 1 ? CART_COPY.ITEM : CART_COPY.ITEMS} · {formatCurrency(subtotal)}
          </span>
          <span className="flex items-center text-sm font-extrabold">
            {CART_COPY.VIEW_CART}
            <ChevronRight className="h-4.5 w-4.5" strokeWidth={2.6} />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
