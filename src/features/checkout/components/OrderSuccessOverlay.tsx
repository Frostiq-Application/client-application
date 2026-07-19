import { useEffect } from "react";
import { motion } from "framer-motion";
import { CHECKOUT_COPY } from "../constants";

const HOLD_MS = 3200;

/** Confetti dot positions (deterministic so the burst looks composed). */
const CONFETTI = [
  { x: -70, y: -80, delay: 0.35, className: "bg-primary" },
  { x: 75, y: -60, delay: 0.45, className: "bg-warning" },
  { x: -95, y: 10, delay: 0.5, className: "bg-success" },
  { x: 95, y: -5, delay: 0.4, className: "bg-primary/70" },
  { x: -45, y: -110, delay: 0.55, className: "bg-danger/80" },
  { x: 40, y: -105, delay: 0.6, className: "bg-success/80" },
];

export interface OrderSuccessOverlayProps {
  /** Called after the celebratory hold — navigate away here. */
  onDone: () => void;
}

/**
 * Full-screen "order placed" celebration: springing check seal with a drawn
 * tick, a soft confetti burst, heading + sub-line, then hands control back
 * after a short hold.
 */
export function OrderSuccessOverlay({ onDone }: OrderSuccessOverlayProps) {
  useEffect(() => {
    const t = setTimeout(onDone, HOLD_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background px-8 text-center"
      role="status"
    >
      <div className="relative">
        {CONFETTI.map((c, i) => (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ x: c.x, y: c.y, scale: [0, 1, 0.6], opacity: [0, 1, 0] }}
            transition={{ delay: c.delay, duration: 1.4, ease: "easeOut" }}
            className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full ${c.className}`}
          />
        ))}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-success/15"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success shadow-fab">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
              <motion.path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="white"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.35, duration: 0.45, ease: "easeOut" }}
              />
            </svg>
          </span>
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.35 }}
        className="mt-7 text-2xl font-extrabold tracking-tight"
      >
        {CHECKOUT_COPY.SUCCESS_TITLE}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.35 }}
        className="mt-2 max-w-xs text-sm font-medium text-muted-foreground"
      >
        {CHECKOUT_COPY.SUCCESS_DESC}
      </motion.p>
    </motion.div>
  );
}
