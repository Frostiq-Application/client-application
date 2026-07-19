import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { backdropFade } from "@/animations/variants";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  /** Action row (buttons). */
  footer?: ReactNode;
  className?: string;
}

/** Centered alert/confirm dialog with a pop-in scale, iOS style. */
export function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            variants={backdropFade}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/45"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 480, damping: 34 }}
            className={cn(
              "relative z-10 w-full max-w-xs rounded-3xl bg-surface p-5 text-center shadow-card",
              className,
            )}
          >
            {title && <h2 className="text-base font-bold">{title}</h2>}
            {description && (
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
            {children}
            {footer && <div className="mt-4 flex gap-2.5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
