import type { HTMLAttributes, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { tapScale } from "@/animations/variants";

/** iOS grouped-list container: rounded card with hairline separators. */
export function ListGroup({
  className,
  header,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { header?: string }) {
  return (
    <section {...props} className={cn("w-full", className)}>
      {header && (
        <h3 className="mb-2 px-4 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
          {header}
        </h3>
      )}
      <div className="overflow-hidden rounded-3xl bg-surface shadow-card [&>*+*]:border-t [&>*+*]:border-border/70">
        {children}
      </div>
    </section>
  );
}

export interface ListItemProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  /** Right-side content; defaults to a chevron when onClick is present. */
  trailing?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  className?: string;
}

/** A tappable grouped-list row with press feedback. */
export function ListItem({ icon, title, subtitle, trailing, onClick, danger, className }: ListItemProps) {
  const content = (
    <>
      {icon && (
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            danger ? "bg-danger/12 text-danger" : "bg-primary/12 text-primary",
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 text-left">
        <span className={cn("block truncate text-[15px] font-medium", danger && "text-danger")}>
          {title}
        </span>
        {subtitle && (
          <span className="block truncate text-[13px] text-muted-foreground">{subtitle}</span>
        )}
      </span>
      {trailing ??
        (onClick && <ChevronRight className="h-4.5 w-4.5 shrink-0 text-muted-foreground/60" />)}
    </>
  );

  if (!onClick) {
    return <div className={cn("flex items-center gap-3 px-4 py-3.5", className)}>{content}</div>;
  }

  return (
    <motion.button
      type="button"
      whileTap={tapScale}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3.5 transition-colors active:bg-surface-2",
        className,
      )}
    >
      {content}
    </motion.button>
  );
}
