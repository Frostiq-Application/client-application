import { useState } from "react";
import { motion } from "framer-motion";
import { Check, LayoutGrid } from "lucide-react";
import { listContainer, listItem, tapScale } from "@/animations/variants";
import { GUIDED_COPY } from "../../constants";
import type { Category } from "@/types/domain.types";

const ALL = "all";

/**
 * Photo grid of catalog categories (plus an "All cakes" tile). Selecting a tile
 * reports the choice; the parent auto-advances to the product step.
 */
export function CategoryGridStep({
  categories,
  imageByCategory,
  value,
  onSelect,
}: {
  categories: Category[];
  imageByCategory: Record<string, string | undefined>;
  value: string | null;
  onSelect: (categoryId: string) => void;
}) {
  const tiles = [
    { id: ALL, name: GUIDED_COPY.allCategory, image: undefined as string | undefined },
    ...categories.map((c) => ({ id: c.id, name: c.name, image: imageByCategory[c.id] })),
  ];

  return (
    <motion.div
      variants={listContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {tiles.map((t) => (
        <Tile
          key={t.id}
          name={t.name}
          image={t.image}
          active={value === t.id}
          onClick={() => onSelect(t.id)}
        />
      ))}
    </motion.div>
  );
}

function Tile({
  name,
  image,
  active,
  onClick,
}: {
  name: string;
  image?: string;
  active: boolean;
  onClick: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = !!image && !failed;

  return (
    <motion.button
      type="button"
      variants={listItem}
      whileTap={tapScale}
      onClick={onClick}
      className={`relative aspect-[4/5] overflow-hidden rounded-3xl border text-left transition-colors ${
        active ? "border-primary ring-2 ring-primary/40" : "border-border"
      }`}
    >
      {showImage ? (
        <img
          src={image}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
          <LayoutGrid className="h-8 w-8 text-primary/60" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

      {active && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )}

      <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-bold leading-tight text-white">
        {name}
      </span>
    </motion.button>
  );
}
