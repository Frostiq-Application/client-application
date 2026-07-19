import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;

export interface WheelPickerProps {
  items: string[];
  /** Selected index. */
  index: number;
  onChange: (index: number) => void;
  className?: string;
}

/**
 * iOS-style wheel picker: snap-scrolling column, center highlight band,
 * faded edges. Tap a row or flick to select.
 */
export function WheelPicker({ items, index, onChange, className }: WheelPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the scroll position in sync with the selected index.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = index * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - target) > 2) {
      el.scrollTo({ top: target, behavior: "instant" as ScrollBehavior });
    }
  }, [index, items.length]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const next = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_HEIGHT)));
      if (next !== index) onChange(next);
    }, 90);
  };

  const pad = (ITEM_HEIGHT * (VISIBLE_ROWS - 1)) / 2;

  return (
    <div className={cn("relative", className)} style={{ height: ITEM_HEIGHT * VISIBLE_ROWS }}>
      {/* center highlight band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-2xl bg-surface-2"
        style={{ height: ITEM_HEIGHT }}
      />
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="hide-scrollbar relative h-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
      >
        <div style={{ paddingTop: pad, paddingBottom: pad }}>
          {items.map((label, i) => {
            const active = i === index;
            return (
              <button
                key={`${label}-${i}`}
                type="button"
                onClick={() => onChange(i)}
                className={cn(
                  "flex w-full snap-center items-center justify-center text-[16px] transition-all duration-150",
                  active
                    ? "font-bold text-foreground"
                    : "font-medium text-muted-foreground/50",
                )}
                style={{ height: ITEM_HEIGHT }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      {/* edge fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-surface to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-surface to-transparent"
      />
    </div>
  );
}
