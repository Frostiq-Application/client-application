import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { backdropFade, sheetSlide, IOS_SPRING } from "@/animations/variants";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Extra classes for the sheet panel. */
  className?: string;
  /** Hide the grab handle / disable drag-to-dismiss. */
  dismissible?: boolean;
  /**
   * Custom header rendered in place of the plain title row. Lives outside the
   * scroll container, so it stays pinned while the body scrolls.
   */
  header?: ReactNode;
}

const DRAG_CLOSE_DISTANCE = 90;
const DRAG_CLOSE_VELOCITY = 500;

/**
 * Native-feeling bottom sheet: slides up with a spring, drags down to dismiss,
 * dims + locks the background. Positioned absolutely inside the AppShell so it
 * stays within the phone frame on desktop.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  className,
  dismissible = true,
  header,
}: SheetProps) {
  const dragControls = useDragControls();

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DRAG_CLOSE_DISTANCE || info.velocity.y > DRAG_CLOSE_VELOCITY) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <motion.div
            variants={backdropFade}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-black/45"
            onClick={dismissible ? onClose : undefined}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={sheetSlide}
            initial="initial"
            animate="animate"
            exit="exit"
            drag={dismissible ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            transition={IOS_SPRING}
            className={cn(
              // flex-col so the scroll body is height-constrained (min-h-0)
              // instead of overflowing the clipped panel — otherwise tall
              // content can't scroll.
              "relative z-10 flex max-h-[88%] flex-col overflow-hidden rounded-t-[1.75rem] bg-surface shadow-sheet",
              "lg:mb-10 lg:w-full lg:max-w-md lg:self-center lg:rounded-[1.75rem]",
              className,
            )}
          >
            {/* Grab handle — the drag hot zone (header area). */}
            <div
              className="flex shrink-0 cursor-grab touch-none flex-col items-center pb-1 pt-2.5"
              onPointerDown={(e) => dismissible && dragControls.start(e)}
            >
              {dismissible && <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />}
            </div>

            {header ? (
              <div className="shrink-0">{header}</div>
            ) : (
              (title || dismissible) && (
                <div className="flex shrink-0 items-center justify-between px-5 pb-2">
                  <h2 className="text-lg font-bold">{title}</h2>
                  {dismissible && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      className="press -mr-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted-foreground"
                    >
                      <X className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              )
            )}

            <div className="scroll-native hide-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
