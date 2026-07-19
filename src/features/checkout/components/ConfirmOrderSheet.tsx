import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/format";
import { CHECKOUT_COPY } from "../constants";

export interface ConfirmOrderSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirming: boolean;
  itemsLabel: string;
  scheduleLabel: string;
  paymentLabel: string;
  subtotal: number;
  discount: number;
  total: number;
}

/** Last-look bottom sheet between "Place Order" and the actual mutation. */
export function ConfirmOrderSheet({
  open,
  onClose,
  onConfirm,
  confirming,
  itemsLabel,
  scheduleLabel,
  paymentLabel,
  subtotal,
  discount,
  total,
}: ConfirmOrderSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={CHECKOUT_COPY.CONFIRM_TITLE}>
      <div className="space-y-3 pt-1">
        <div className="space-y-2.5 rounded-2xl bg-surface-2/60 p-4 text-sm">
          <SummaryRow label={CHECKOUT_COPY.CONFIRM_ITEMS} value={itemsLabel} />
          <SummaryRow label={CHECKOUT_COPY.CONFIRM_SCHEDULE} value={scheduleLabel} />
          <SummaryRow label={CHECKOUT_COPY.CONFIRM_PAYMENT} value={paymentLabel} />
          <div className="border-t border-border/60 pt-2.5">
            <SummaryRow label={CHECKOUT_COPY.SUBTOTAL} value={formatCurrency(subtotal)} />
            {discount > 0 && (
              <SummaryRow
                label={CHECKOUT_COPY.DISCOUNT}
                value={`−${formatCurrency(discount)}`}
                accent
              />
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
            <span className="font-semibold text-muted-foreground">{CHECKOUT_COPY.TOTAL}</span>
            <span className="text-lg font-extrabold">{formatCurrency(total)}</span>
          </div>
        </div>
        <Button block size="lg" loading={confirming} onClick={onConfirm}>
          {CHECKOUT_COPY.CONFIRM_CTA}
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="block w-full py-1 text-center text-sm font-semibold text-muted-foreground"
        >
          {CHECKOUT_COPY.CONFIRM_BACK}
        </button>
      </div>
    </Sheet>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="shrink-0 font-medium text-muted-foreground">{label}</span>
      <span className={accent ? "text-right font-bold text-success" : "text-right font-bold"}>
        {value}
      </span>
    </div>
  );
}
