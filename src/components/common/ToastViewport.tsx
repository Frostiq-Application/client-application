import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, X } from "lucide-react";
import { useToastStore, type ToastTone } from "@/store/toastStore";
import { cn } from "@/lib/cn";

const TONE_STYLES: Record<ToastTone, string> = {
  neutral: "bg-foreground text-background",
  success: "bg-success text-success-foreground",
  error: "bg-danger text-danger-foreground",
};

const TONE_ICON: Record<ToastTone, typeof Check> = {
  neutral: Info,
  success: Check,
  error: X,
};

/** Native-style snackbar stack, anchored above the bottom nav. */
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = TONE_ICON[t.tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className={cn(
                "pointer-events-auto flex max-w-[22rem] items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium shadow-card",
                TONE_STYLES[t.tone],
              )}
              role="status"
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
              <span className="truncate">{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
