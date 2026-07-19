import { useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { Gift, Trash2 } from "lucide-react";
import { Stepper } from "@/components/ui/Stepper";
import { ProductImage } from "@/features/home/components/ProductImage";
import { formatCurrency } from "@/utils/format";
import { lineTotal, type CartLine } from "@/store/cartStore";
import { IOS_SPRING } from "@/animations/variants";
import { CART_COPY } from "../constants";

/** How far the row parks open to expose the delete button. */
const REVEAL_WIDTH = 88;
const OPEN_AT = -40;

export interface CartItemRowProps {
  line: CartLine;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
  onExtras: () => void;
  /** Tap on the item (image/name) — opens the product. */
  onOpen: () => void;
  /** One-time swipe demo: the row nudges left to reveal the delete zone. */
  hintNudge?: boolean;
}

/** Cart line — reference style card; swipe left to reveal delete. */
export function CartItemRow({
  line,
  onQuantity,
  onRemove,
  onExtras,
  onOpen,
  hintNudge,
}: CartItemRowProps) {
  // Swipe parks the row open; the user confirms by tapping the trash.
  const [revealed, setRevealed] = useState(false);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setRevealed(info.offset.x < OPEN_AT || info.velocity.x < -300);
  };

  // Tapping the content while the delete is revealed just closes it.
  const contentTap = () => {
    if (revealed) {
      setRevealed(false);
    } else {
      onOpen();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
      className="relative mb-3"
    >
      {/* swipe reveal */}
      <div className="absolute inset-y-0 right-0 flex w-[88px] items-center justify-center rounded-3xl bg-gradient-to-l from-danger/25 to-danger/5">
        <button
          type="button"
          aria-label="Remove item"
          onClick={onRemove}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-danger text-danger-foreground shadow-sm"
        >
          <Trash2 className="h-4.5 w-4.5" strokeWidth={2.2} />
        </button>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
        dragElastic={{ left: 0.12, right: 0.02 }}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        animate={
          hintNudge
            ? { x: [0, -76, -76, 0] }
            : { x: revealed ? -REVEAL_WIDTH : 0 }
        }
        transition={
          hintNudge
            ? { delay: 0.7, duration: 1.4, times: [0, 0.3, 0.65, 1] }
            : IOS_SPRING
        }
        className="relative flex items-center gap-3 rounded-3xl bg-surface p-3 shadow-card"
      >
        <button
          type="button"
          onClick={contentTap}
          aria-label={`Open ${line.name}`}
          className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface-2"
        >
          <ProductImage
            src={line.image ?? undefined}
            alt={line.name}
            type={line.productType}
            className="h-full w-full"
            artClassName="p-2"
          />
        </button>

        <div className="min-w-0 flex-1">
          <button type="button" onClick={contentTap} className="block w-full min-w-0 text-left">
            <h3 className="truncate text-[15px] font-bold">{line.name}</h3>
            <p className="truncate text-xs font-medium text-muted-foreground">
              {line.variantLabel}
              {line.flavorName ? ` · ${line.flavorName}` : ""}
            </p>
          </button>
          {line.addons.length > 0 && (
            <p className="truncate text-[11px] font-medium text-primary">
              + {line.addons.map((a) => (a.quantity > 1 ? `${a.quantity}× ${a.name}` : a.name)).join(", ")}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <Stepper value={line.quantity} onChange={onQuantity} className="h-8 [&>span]:w-5" />
            <button
              type="button"
              onClick={onExtras}
              className="flex h-8 items-center gap-1 rounded-full bg-surface-2 px-2.5 text-[11px] font-bold text-foreground"
            >
              <Gift className="h-3.5 w-3.5 text-primary" strokeWidth={2.4} />
              {CART_COPY.EXTRAS}
              {line.addons.length > 0 &&
                ` · ${line.addons.reduce((n, a) => n + a.quantity, 0)}`}
            </button>
          </div>
        </div>

        <p className="shrink-0 text-[15px] font-extrabold">{formatCurrency(lineTotal(line))}</p>
      </motion.div>
    </motion.div>
  );
}
