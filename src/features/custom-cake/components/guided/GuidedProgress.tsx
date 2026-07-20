import { motion } from "framer-motion";
import { GUIDED_STEPS, type GuidedStep } from "../../constants";

/**
 * Labeled step rail for the guided builder. Completed steps are tappable to
 * jump back; the active step is highlighted with an animated pill underline.
 */
export function GuidedProgress({
  current,
  onJump,
}: {
  current: GuidedStep;
  onJump: (step: GuidedStep) => void;
}) {
  const currentIdx = GUIDED_STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-1 px-3 pb-2">
      {GUIDED_STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <button
            key={s.key}
            type="button"
            disabled={i > currentIdx}
            onClick={() => done && onJump(s.key)}
            className="group relative flex-1"
          >
            <div
              className={`h-1.5 w-full rounded-full transition-colors ${
                i <= currentIdx ? "bg-primary" : "bg-muted"
              }`}
            />
            <span
              className={`mt-1.5 block truncate text-[10px] font-semibold transition-colors ${
                active
                  ? "text-primary"
                  : done
                    ? "text-foreground/60"
                    : "text-muted-foreground/50"
              }`}
            >
              {s.label}
            </span>
            {active && (
              <motion.span
                layoutId="guided-step-dot"
                className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
