import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCartCount } from "@/store/cartStore";
import { ROUTES } from "@/routes/paths";
import { tapScale } from "@/animations/variants";

/**
 * Floating cart icon for pushed screens (product, category): pops in with a
 * spring when the cart gains its first item, and the count badge re-pops on
 * every add. Tapping goes straight to the cart.
 */
export function CartFab() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const count = useCartCount();

  const visible = count > 0 && pathname !== ROUTES.CART && pathname !== ROUTES.CHECKOUT;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label={`Cart, ${count} items`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 480, damping: 22 } }}
          exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
          whileTap={tapScale}
          onClick={() => navigate(ROUTES.CART)}
          className="absolute bottom-28 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-fab"
        >
          <ShoppingBag className="h-6 w-6" strokeWidth={2.2} />
          {/* count badge — re-pops whenever the count changes */}
          <motion.span
            key={count}
            initial={{ scale: 1.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-foreground px-1.5 text-xs font-extrabold text-background shadow-sm"
          >
            {count}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
