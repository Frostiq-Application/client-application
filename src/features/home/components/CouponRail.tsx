import { motion } from "framer-motion";
import { BadgePercent, Copy } from "lucide-react";
import { toast } from "@/store/toastStore";
import { formatCurrency } from "@/utils/format";
import { tapScale } from "@/animations/variants";
import { HOME_COPY } from "../constants";
import type { Coupon } from "@/types/domain.types";

/** Fallback label when the shop didn't set a display label. */
function couponLabel(coupon: Coupon): string {
  return coupon.displayLabel ?? (
    coupon.discountType === "percentage"
      ? `${parseFloat(coupon.discountValue)}% OFF`
      : `${formatCurrency(coupon.discountValue)} OFF`
  );
}

/** Zomato-style offer tickets: dashed border, tap to copy the code. */
export function CouponRail({ coupons }: { coupons: Coupon[] }) {
  if (coupons.length === 0) return null;

  const copy = (code: string) => {
    void navigator.clipboard?.writeText(code);
    toast.success(HOME_COPY.COUPON_COPIED);
  };

  return (
    <div className="hide-scrollbar flex snap-x gap-3 overflow-x-auto px-4 py-1">
      {coupons.map((coupon) => (
        <motion.button
          key={coupon.code}
          type="button"
          whileTap={tapScale}
          onClick={() => copy(coupon.code)}
          className="relative flex w-64 shrink-0 snap-start items-center gap-3 overflow-hidden rounded-2xl border border-dashed border-primary/45 bg-primary/6 p-3.5 text-left"
        >
          {/* ticket notches */}
          <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background" />
          <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background" />

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <BadgePercent className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-extrabold">{couponLabel(coupon)}</span>
            <span className="mt-0.5 block truncate text-[11px] font-medium text-muted-foreground">
              {coupon.minOrderAmount
                ? `${HOME_COPY.MIN_ORDER} ${formatCurrency(coupon.minOrderAmount)}`
                : `${HOME_COPY.USE_CODE} ${coupon.code}`}
            </span>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-primary px-2 py-0.5 text-[11px] font-bold tracking-wide text-primary-foreground">
              {coupon.code}
              <Copy className="h-3 w-3" strokeWidth={2.5} />
            </span>
          </span>
        </motion.button>
      ))}
    </div>
  );
}
