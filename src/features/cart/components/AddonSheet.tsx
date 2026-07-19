import { Cake, Camera, Flame, Gift, Mail, Minus, Plus, Sparkles, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet } from "@/components/ui/Sheet";
import { LoadingScreen } from "@/components/ui/Spinner";
import { useAddons } from "@/hooks/useStorefront";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/cn";
import { tapScale } from "@/animations/variants";
import { CART_COPY } from "../constants";

const ADDON_MAX = 10;

/** Fallback when an addon has no image — pick a fitting icon from the name. */
const ADDON_ICONS: ReadonlyArray<[RegExp, LucideIcon]> = [
  [/candle|flame|sparkler/i, Flame],
  [/card|greeting|message|note/i, Mail],
  [/knife|server|cutlery|fork|spoon/i, UtensilsCrossed],
  [/photo|picture|print|edible/i, Camera],
  [/topper|decor|sprinkle|crown/i, Sparkles],
  [/cake|cupcake/i, Cake],
];

function addonIcon(name: string): LucideIcon {
  return ADDON_ICONS.find(([re]) => re.test(name))?.[1] ?? Gift;
}

export interface AddonSheetProps {
  /** Cart line the extras attach to; null = closed. */
  lineKey: string | null;
  onClose: () => void;
}

/** Bottom sheet of branch add-ons (candles, card, topper…) for one cart line. */
export function AddonSheet({ lineKey, onClose }: AddonSheetProps) {
  const line = useCartStore((s) => s.items.find((i) => i.key === lineKey) ?? null);
  const setAddonQuantity = useCartStore((s) => s.setAddonQuantity);
  const addonsQuery = useAddons(line?.shopId ?? null);
  const addons = addonsQuery.data ?? [];

  return (
    <Sheet open={!!line} onClose={onClose} title={CART_COPY.EXTRAS_TITLE}>
      {line && (
        <div className="space-y-2 pt-1">
          <p className="pb-1 text-[13px] font-medium text-muted-foreground">
            {CART_COPY.EXTRAS_FOR} <span className="font-bold text-foreground">{line.name}</span>
          </p>
          {addonsQuery.isLoading ? (
            <LoadingScreen />
          ) : addons.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {CART_COPY.NO_EXTRAS}
            </p>
          ) : (
            addons.map((addon) => {
              const attached = line.addons.find((a) => a.addonId === addon.id);
              const quantity = attached?.quantity ?? 0;
              const Icon = addonIcon(addon.name);
              const setQty = (q: number) =>
                setAddonQuantity(
                  line.key,
                  { addonId: addon.id, name: addon.name, price: parseFloat(addon.price) },
                  Math.min(ADDON_MAX, Math.max(0, q)),
                );
              return (
                <div
                  key={addon.id}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3.5 transition-colors",
                    quantity > 0 ? "border-primary bg-primary/8" : "border-border bg-surface-2/50",
                  )}
                >
                  {addon.imageUrl ? (
                    <img
                      src={addon.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{addon.name}</span>
                    <span className="text-[13px] font-medium text-muted-foreground">
                      {formatCurrency(addon.price)}
                      {quantity > 1 && (
                        <span className="ml-1.5 font-bold text-primary">
                          = {formatCurrency(parseFloat(addon.price) * quantity)}
                        </span>
                      )}
                    </span>
                  </span>

                  {quantity === 0 ? (
                    <motion.button
                      type="button"
                      whileTap={tapScale}
                      onClick={() => setQty(1)}
                      className="flex h-9 items-center gap-1 rounded-full bg-primary px-3.5 text-[13px] font-bold text-primary-foreground shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                      {CART_COPY.ADD}
                    </motion.button>
                  ) : (
                    <div className="flex h-9 items-center gap-0.5 rounded-full border border-primary/40 bg-surface px-1">
                      <motion.button
                        type="button"
                        whileTap={tapScale}
                        aria-label="Decrease"
                        onClick={() => setQty(quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-primary"
                      >
                        <Minus className="h-3.5 w-3.5" strokeWidth={3} />
                      </motion.button>
                      <motion.span
                        key={quantity}
                        initial={{ scale: 1.4 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="w-6 text-center text-sm font-extrabold tabular-nums text-primary"
                      >
                        {quantity}
                      </motion.span>
                      <motion.button
                        type="button"
                        whileTap={tapScale}
                        aria-label="Increase"
                        onClick={() => setQty(quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-primary"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                      </motion.button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </Sheet>
  );
}
