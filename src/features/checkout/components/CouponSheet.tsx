import { useState } from "react";
import { BadgePercent } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { usePublicCoupons } from "@/hooks/useStorefront";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/cn";
import type { Coupon } from "@/types/domain.types";
import { CHECKOUT_COPY } from "../constants";

export interface CouponSheetProps {
  open: boolean;
  onClose: () => void;
  shopId: string | null;
  subtotal: number;
  applying: boolean;
  onApply: (code: string) => void;
}

function couponLabel(coupon: Coupon): string {
  return coupon.displayLabel ?? (
    coupon.discountType === "percentage"
      ? `${parseFloat(coupon.discountValue)}% OFF`
      : `${formatCurrency(coupon.discountValue)} OFF`
  );
}

/** Applicable-coupons sheet: public offers + a manual code field. */
export function CouponSheet({ open, onClose, shopId, subtotal, applying, onApply }: CouponSheetProps) {
  const couponsQuery = usePublicCoupons(open ? shopId : null);
  const coupons = couponsQuery.data ?? [];
  const [code, setCode] = useState("");

  return (
    <Sheet open={open} onClose={onClose} title={CHECKOUT_COPY.COUPON_SHEET_TITLE}>
      {/* Manual code */}
      <div className="flex gap-2 pt-1">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={CHECKOUT_COPY.COUPON_PLACEHOLDER}
          className="h-11 min-w-0 flex-1 rounded-2xl border border-input bg-surface px-3.5 text-sm font-semibold uppercase outline-none placeholder:normal-case placeholder:text-muted-foreground focus:border-primary"
        />
        <Button
          variant="secondary"
          loading={applying}
          disabled={code.trim().length === 0}
          onClick={() => onApply(code.trim())}
        >
          {CHECKOUT_COPY.APPLY}
        </Button>
      </div>

      {/* Available offers */}
      <div className="mt-4 space-y-2.5 pb-2">
        {coupons.length === 0 && !couponsQuery.isLoading && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {CHECKOUT_COPY.NO_COUPONS}
          </p>
        )}
        {coupons.map((coupon) => {
          const minOrder = coupon.minOrderAmount ? parseFloat(coupon.minOrderAmount) : 0;
          const eligible = subtotal >= minOrder;
          return (
            <div
              key={coupon.code}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-dashed p-3.5",
                eligible ? "border-primary/45 bg-primary/6" : "border-border bg-surface-2/50 opacity-70",
              )}
            >
              <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-surface" />
              <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-surface" />
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <BadgePercent className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-extrabold">{couponLabel(coupon)}</p>
                  <p className="truncate text-[11px] font-medium text-muted-foreground">
                    {coupon.code}
                    {minOrder > 0 &&
                      ` · ${CHECKOUT_COPY.MIN_ORDER_NOTE} ${formatCurrency(minOrder)}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={eligible ? "primary" : "secondary"}
                  disabled={!eligible || applying}
                  onClick={() => onApply(coupon.code)}
                >
                  {CHECKOUT_COPY.APPLY}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}
