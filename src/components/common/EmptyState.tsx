import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";
import { tabFade } from "@/animations/variants";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      variants={tabFade}
      initial="initial"
      animate="animate"
      className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-2 text-muted-foreground">
        {icon ?? <PackageOpen className="h-7 w-7" strokeWidth={1.75} />}
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
