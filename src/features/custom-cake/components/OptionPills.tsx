import { cn } from "@/lib/cn";

/**
 * Single-select pill group backed by the admin-configured option list. Tapping
 * the active pill again clears the choice (nothing is required).
 */
export function OptionPills({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string | undefined;
  onChange: (label: string | undefined) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.label;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(active ? undefined : o.label)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/50",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Multi-select variant (used for decorations). */
export function MultiOptionPills({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: { id: string; label: string }[];
  values: string[];
  onToggle: (label: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = values.includes(o.label);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onToggle(o.label)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/50",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
