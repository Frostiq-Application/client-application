import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";

/**
 * Renders the current route's element inside AnimatePresence, keyed by path,
 * so exiting pages animate out (AnimatePresence freezes the exiting subtree).
 */
export function AnimatedOutlet({ variants }: { variants: Variants }) {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex min-h-0 flex-1 flex-col"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
