import {
  CalendarDays,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  Sparkles,
  Store,
} from "lucide-react";
import { ProductImage } from "@/features/home/components/ProductImage";
import { formatCurrency, formatDate, formatTime } from "@/utils/format";
import { DELIVERY_TYPE } from "@/constants/status.constants";
import type { ProductVariant } from "@/types/domain.types";
import type { GuidedDraft } from "./types";

/** Read-only summary of everything the customer built, shown before sending. */
export function ReviewStep({
  draft,
  variant,
}: {
  draft: GuidedDraft;
  variant: ProductVariant | null;
}) {
  const product = draft.product;
  if (!product) return null;

  const looks = [
    draft.occasion,
    draft.theme,
    draft.colour,
    draft.topper,
    ...draft.decorations,
  ].filter(Boolean) as string[];

  const dateLabel = draft.neededDate
    ? `${formatDate(draft.neededDate)}${draft.neededTime ? ` · ${formatTime(draft.neededTime)}` : ""}`
    : null;

  return (
    <div className="space-y-4">
      {/* The cake */}
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        <div className="flex gap-4 p-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-2">
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              type={product.productType}
              className="h-full w-full"
              artClassName="p-4"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-bold leading-tight">{product.name}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {variant && <Chip>{variant.label}</Chip>}
              {draft.flavour && <Chip>{draft.flavour}</Chip>}
            </div>
            {variant && (
              <p className="mt-2 text-sm text-muted-foreground">
                Base price{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(variant.price)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {draft.cakeMessage && (
        <Row icon={<MessageCircle className="h-4 w-4" />} label="Message on cake">
          “{draft.cakeMessage}”
        </Row>
      )}

      {looks.length > 0 && (
        <Row icon={<Palette className="h-4 w-4" />} label="Look & feel">
          <div className="flex flex-wrap gap-1.5">
            {looks.map((l) => (
              <Chip key={l}>{l}</Chip>
            ))}
          </div>
        </Row>
      )}

      {draft.referenceImageUrls.length > 0 && (
        <Row icon={<Sparkles className="h-4 w-4" />} label="Reference photos">
          <div className="flex gap-2">
            {draft.referenceImageUrls.slice(0, 4).map((url) => (
              <img
                key={url}
                src={url}
                alt="reference"
                className="h-14 w-14 rounded-xl object-cover"
              />
            ))}
          </div>
        </Row>
      )}

      <Row
        icon={
          draft.deliveryType === DELIVERY_TYPE.DELIVERY ? (
            <MapPin className="h-4 w-4" />
          ) : (
            <Store className="h-4 w-4" />
          )
        }
        label={draft.deliveryType === DELIVERY_TYPE.DELIVERY ? "Delivery" : "Pickup"}
      >
        {draft.deliveryType === DELIVERY_TYPE.DELIVERY && draft.deliveryAddress
          ? draft.deliveryAddress
          : draft.deliveryType === DELIVERY_TYPE.DELIVERY
            ? "Address shared at confirmation"
            : "Collect from store"}
      </Row>

      {dateLabel && (
        <Row icon={<CalendarDays className="h-4 w-4" />} label="Needed by">
          {dateLabel}
        </Row>
      )}

      <Row icon={<Phone className="h-4 w-4" />} label="Contact">
        {draft.contactName} · {draft.contactPhone}
      </Row>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-surface p-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-foreground">
      {children}
    </span>
  );
}
