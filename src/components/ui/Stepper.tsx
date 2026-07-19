import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { tapScale } from "@/animations/variants";

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

/** Quantity stepper (− 1 +) used on product and cart lines. */
export function Stepper({ value, onChange, min = 1, max = 99, className }: StepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div
      className={cn(
        "inline-flex h-10 items-center gap-1 rounded-2xl border border-primary/30 bg-primary/8 px-1",
        className,
      )}
    >
      <motion.button
        type="button"
        whileTap={tapScale}
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex h-8 w-8 items-center justify-center rounded-xl text-primary disabled:opacity-35"
      >
        <Minus className="h-4 w-4" strokeWidth={2.5} />
      </motion.button>
      <span
        aria-live="polite"
        className="w-7 text-center text-[15px] font-bold tabular-nums text-primary"
      >
        {value}
      </span>
      <motion.button
        type="button"
        whileTap={tapScale}
        onClick={inc}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="flex h-8 w-8 items-center justify-center rounded-xl text-primary disabled:opacity-35"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
