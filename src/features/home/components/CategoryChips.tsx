import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { tapScale } from "@/animations/variants";
import { HOME_COPY } from "../constants";
import type { Category } from "@/types/domain.types";

export const ALL_CATEGORIES = "all";

export interface CategoryChipsProps {
  categories: Category[];
  /** categoryId → representative image (first product photo in the category). */
  imageByCategory: Record<string, string | undefined>;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Photo-backed category pills (reference-design style): each chip renders its
 * category image as the background with a dark scrim + white label; categories
 * without an image fall back to a plain pill. Selecting filters the feed.
 */
export function CategoryChips({ categories, imageByCategory, value, onChange }: CategoryChipsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
      <Chip
        label={HOME_COPY.ALL_CHIP}
        active={value === ALL_CATEGORIES}
        onTap={() => onChange(ALL_CATEGORIES)}
      />
      {categories.map((category) => (
        <Chip
          key={category.id}
          label={category.name}
          image={imageByCategory[category.id]}
          active={value === category.id}
          onTap={() => onChange(category.id)}
        />
      ))}
    </div>
  );
}

interface ChipProps {
  label: string;
  image?: string;
  active: boolean;
  onTap: () => void;
}

function Chip({ label, image, active, onTap }: ChipProps) {
  const [failed, setFailed] = useState(false);
  const showImage = !!image && !failed;

  return (
    <motion.button
      type="button"
      whileTap={tapScale}
      onClick={onTap}
      aria-pressed={active}
      className={cn(
        "relative flex h-11 shrink-0 items-center justify-center overflow-hidden rounded-full px-5 transition-shadow",
        showImage
          ? "text-white"
          : active
            ? "bg-primary text-primary-foreground"
            : "bg-surface-2 text-foreground",
        active && "shadow-card ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      {showImage && (
        <>
          <img
            src={image}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span
            aria-hidden
            className={cn("absolute inset-0", active ? "bg-black/30" : "bg-black/45")}
          />
        </>
      )}
      <span className="relative whitespace-nowrap text-sm font-bold">{label}</span>
    </motion.button>
  );
}
