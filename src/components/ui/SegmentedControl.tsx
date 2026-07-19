import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { IOS_SPRING } from "@/animations/variants";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Unique id so multiple controls don't share the sliding thumb layoutId. */
  name: string;
}

/** iOS-style segmented control with a sliding thumb. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  name,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={cn("flex rounded-2xl bg-surface-2 p-1", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors",
              active ? "text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`segmented-${name}`}
                transition={IOS_SPRING}
                className="absolute inset-0 rounded-xl bg-primary shadow-sm"
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
