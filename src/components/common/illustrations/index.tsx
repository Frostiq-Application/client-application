import type { SVGProps } from "react";
import { PRODUCT_TYPE, type ProductType } from "@/constants/status.constants";

/**
 * Hand-drawn flat illustrations for the cake storefront. They lean on the
 * brand accent via `hsl(var(--primary))` so they recolor with the theme,
 * with soft cream/cocoa companions that read well in light & dark.
 */

type IllustrationProps = SVGProps<SVGSVGElement>;

const ACCENT = "hsl(var(--primary))";
const ACCENT_SOFT = "hsl(var(--primary) / 0.25)";
const CREAM = "#FFF3E0";
const CREAM_DARK = "#FFE0B2";
const COCOA = "#8D6E63";
const COCOA_DARK = "#5D4037";
const FLAME = "#FFB300";

/** Two-tier celebration cake with a candle. */
export function TieredCakeArt(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden {...props}>
      <ellipse cx="48" cy="82" rx="34" ry="6" fill={ACCENT_SOFT} />
      {/* bottom tier */}
      <rect x="18" y="56" width="60" height="24" rx="6" fill={CREAM} />
      <path
        d="M18 62c0-3.3 2.7-6 6-6h48c3.3 0 6 2.7 6 6v2c-4 0-4 4-8 4s-4-4-8-4-4 4-8 4-4-4-8-4-4 4-8 4-4-4-8-4-4 4-8 4-4-4-4-4v-2Z"
        fill={ACCENT}
      />
      {/* top tier */}
      <rect x="28" y="36" width="40" height="20" rx="5" fill={CREAM_DARK} />
      <path
        d="M28 41c0-2.8 2.2-5 5-5h30c2.8 0 5 2.2 5 5v1c-3.4 0-3.4 3.5-6.7 3.5-3.3 0-3.3-3.5-6.6-3.5-3.4 0-3.4 3.5-6.7 3.5-3.3 0-3.3-3.5-6.7-3.5-3.3 0-3.3 3.5-6.6 3.5-3.4 0-6.7-3.5-6.7-3.5v-1Z"
        fill={ACCENT}
      />
      {/* candle */}
      <rect x="45.5" y="22" width="5" height="14" rx="2" fill={ACCENT} />
      <ellipse cx="48" cy="17" rx="3.4" ry="4.6" fill={FLAME} />
      <ellipse cx="48" cy="18" rx="1.6" ry="2.4" fill="#FFF8E1" />
      {/* sprinkles */}
      <circle cx="34" cy="70" r="1.8" fill={ACCENT} />
      <circle cx="48" cy="73" r="1.8" fill={COCOA} />
      <circle cx="62" cy="70" r="1.8" fill={ACCENT} />
    </svg>
  );
}

/** Frosted cupcake with a cherry. */
export function CupcakeArt(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden {...props}>
      <ellipse cx="48" cy="84" rx="26" ry="5" fill={ACCENT_SOFT} />
      {/* wrapper */}
      <path d="M30 58h36l-5 24a4 4 0 0 1-4 3.4H39a4 4 0 0 1-4-3.4l-5-24Z" fill={ACCENT} />
      <path d="M37 58l3 27M48 58v27.4M59 58l-3 27" stroke="hsl(var(--primary) / 0.55)" strokeWidth="2" />
      {/* frosting swirl */}
      <path
        d="M28 58c0-5 4-8 8-8-1-6 3-10 8-10 0-5 4-9 9-8 5 .8 7 5 6 9 5 0 9 4 8 9 4 1 7 4 7 8H28Z"
        transform="translate(-2 0)"
        fill={CREAM}
      />
      <path
        d="M30 58c8 0 10-3 18-3s10 3 18 3"
        stroke={CREAM_DARK}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* cherry */}
      <circle cx="48" cy="28" r="6" fill={ACCENT} />
      <path d="M48 22c1-3 3-5 6-5" stroke={COCOA_DARK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Chocolate bar, corner bitten. */
export function ChocolateArt(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden {...props}>
      <ellipse cx="48" cy="84" rx="28" ry="5" fill={ACCENT_SOFT} />
      <rect x="24" y="20" width="48" height="58" rx="6" fill={COCOA_DARK} />
      {/* squares */}
      {[0, 1].map((col) =>
        [0, 1, 2].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={29 + col * 20}
            y={25 + row * 17}
            width="18"
            height="15"
            rx="3"
            fill={COCOA}
          />
        )),
      )}
      {/* bite */}
      <circle cx="72" cy="24" r="9" fill="hsl(var(--background))" />
      <circle cx="64" cy="18" r="5" fill="hsl(var(--background))" />
      {/* wrapper band */}
      <rect x="24" y="58" width="48" height="14" fill={ACCENT} />
      <rect x="24" y="58" width="48" height="3" fill="hsl(var(--primary) / 0.6)" />
    </svg>
  );
}

/** Cake slice with layers + strawberry. */
export function CakeSliceArt(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden {...props}>
      <ellipse cx="48" cy="82" rx="30" ry="5" fill={ACCENT_SOFT} />
      {/* slice body */}
      <path d="M22 74 66 32c6 5 10 12 11 20l1 22H22Z" fill={CREAM} />
      <path d="M22 74 66 32c2 1.6 3.6 3.4 5.2 5.4L28 74h-6Z" fill={ACCENT} />
      {/* layers */}
      <path d="M34 62l26 0 0 4-30 0z" transform="rotate(-2 47 64)" fill={COCOA} opacity="0.7" />
      <path d="M43 50h22v4H41z" fill={COCOA} opacity="0.7" />
      {/* strawberry */}
      <path d="M64 22c5 0 9 4 9 9 0 6-9 11-9 11s-9-5-9-11c0-5 4-9 9-9Z" fill={ACCENT} />
      <path d="M62 20c1-2 1-4 0-6M66 20c1-2 3-3 5-3" stroke="#66BB6A" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Open pastry box — empty states. */
export function EmptyBoxArt(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden {...props}>
      <ellipse cx="48" cy="82" rx="30" ry="5" fill={ACCENT_SOFT} />
      <path d="M24 46h48v30a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4V46Z" fill={CREAM_DARK} />
      <path d="M24 46 14 32l34-6v20H24Z" fill={CREAM} />
      <path d="M72 46l10-14-34-6v20h24Z" fill={CREAM} />
      <path d="M48 26v54" stroke={ACCENT_SOFT} strokeWidth="2" />
      <circle cx="40" cy="64" r="2" fill={COCOA} />
      <circle cx="55" cy="70" r="1.6" fill={COCOA} />
      <circle cx="48" cy="58" r="1.6" fill={ACCENT} />
    </svg>
  );
}

/** Order slip with a heart seal — "order placed". */
export function ReceiptArt(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden {...props}>
      <ellipse cx="48" cy="84" rx="28" ry="5" fill={ACCENT_SOFT} />
      <path
        d="M30 14h36a3 3 0 0 1 3 3v60l-6-4-6 4-6-4-6 4-6-4-6 4V17a3 3 0 0 1 3-3Z"
        fill={CREAM}
      />
      <path d="M35 28h26M35 36h26M35 44h16" stroke={COCOA} strokeWidth="2.6" strokeLinecap="round" opacity="0.55" />
      <path d="M35 56h12" stroke={COCOA} strokeWidth="2.6" strokeLinecap="round" opacity="0.35" />
      {/* heart seal */}
      <circle cx="60" cy="58" r="9" fill={ACCENT} />
      <path
        d="M60 62.5s-4.6-2.9-4.6-6a2.6 2.6 0 0 1 4.6-1.7 2.6 2.6 0 0 1 4.6 1.7c0 3.1-4.6 6-4.6 6Z"
        fill="#fff"
      />
    </svg>
  );
}

/** Chef hat — "order confirmed, the bakers are on it". */
export function ChefHatArt(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden {...props}>
      <ellipse cx="48" cy="82" rx="28" ry="5" fill={ACCENT_SOFT} />
      <path
        d="M30 44c-6 0-11-5-11-11 0-6 5-11 11-11 1-7 7-12 14-11 3-5 9-7 14-4s7 9 5 14c5 2 8 8 6 13-1.7 4.6-6 7-11 7v10H30V44Z"
        fill={CREAM}
      />
      <path d="M30 44v7h38v-7" stroke={CREAM_DARK} strokeWidth="2" />
      <rect x="28" y="56" width="42" height="12" rx="4" fill={ACCENT} />
      <path d="M38 30v14M48 32v12M58 30v14" stroke={CREAM_DARK} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="70" cy="22" r="2" fill={ACCENT} />
      <circle cx="24" cy="26" r="1.6" fill={COCOA} />
    </svg>
  );
}

/** Mixing bowl with whisk — "preparing". */
export function WhiskBowlArt(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden {...props}>
      <ellipse cx="48" cy="84" rx="30" ry="5" fill={ACCENT_SOFT} />
      {/* whisk */}
      <path d="M64 12 54 34" stroke={COCOA_DARK} strokeWidth="3.4" strokeLinecap="round" />
      <path
        d="M54 34c-4 6-3 11 0 12s8-2 9-9m-9-3c-1 6 1 11 4 12m5-12c2 6 1 10-1 12"
        stroke={COCOA}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* bowl */}
      <path d="M20 48h56c0 12-8 22-19 25v5H39v-5c-11-3-19-13-19-25Z" fill={ACCENT} />
      <path d="M20 48h56" stroke="hsl(var(--primary) / 0.5)" strokeWidth="2" />
      {/* batter splashes */}
      <path
        d="M26 44c3-3 8-2 9 1M42 42c2-3 7-3 9 0M62 43c3-2 7-1 8 2"
        stroke={CREAM_DARK}
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="34" cy="36" r="2" fill={CREAM_DARK} />
      <circle cx="70" cy="34" r="1.8" fill={ACCENT} />
    </svg>
  );
}

/** Closed pastry box with ribbon bow — "ready for pickup/delivery". */
export function CakeBoxArt(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden {...props}>
      <ellipse cx="48" cy="84" rx="30" ry="5" fill={ACCENT_SOFT} />
      <rect x="22" y="42" width="52" height="36" rx="5" fill={CREAM} />
      <rect x="18" y="34" width="60" height="12" rx="4" fill={CREAM_DARK} />
      {/* ribbon */}
      <rect x="44" y="34" width="8" height="44" fill={ACCENT} />
      <path
        d="M48 30c-3-6-10-7-12-3-1.8 3.6 2 7 12 7 10 0 13.8-3.4 12-7-2-4-9-3-12 3Z"
        fill={ACCENT}
      />
      <circle cx="48" cy="31" r="2.6" fill="hsl(var(--primary) / 0.55)" />
      <circle cx="33" cy="60" r="1.8" fill={COCOA} opacity="0.5" />
      <circle cx="64" cy="66" r="1.8" fill={COCOA} opacity="0.5" />
    </svg>
  );
}

/** Delivery scooter with a treat box — "out for delivery". */
export function ScooterArt(props: IllustrationProps) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden {...props}>
      <ellipse cx="48" cy="84" rx="34" ry="5" fill={ACCENT_SOFT} />
      {/* speed lines */}
      <path d="M8 52h10M6 60h8M10 68h8" stroke={ACCENT_SOFT} strokeWidth="3" strokeLinecap="round" />
      {/* box on rack */}
      <rect x="56" y="28" width="20" height="16" rx="3" fill={CREAM_DARK} />
      <rect x="64" y="28" width="4" height="16" fill={ACCENT} />
      {/* body */}
      <path d="M30 62c0-8 7-14 15-14h13l6 14H30Z" fill={ACCENT} />
      <path d="M64 44v-8h8" stroke={COCOA_DARK} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <path d="M36 48c-4-8-12-8-14-4" stroke={COCOA_DARK} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      {/* wheels */}
      <circle cx="32" cy="70" r="8" fill={COCOA_DARK} />
      <circle cx="32" cy="70" r="3.4" fill={CREAM} />
      <circle cx="66" cy="70" r="8" fill={COCOA_DARK} />
      <circle cx="66" cy="70" r="3.4" fill={CREAM} />
    </svg>
  );
}

/** Pick an illustration for a product type. */
export function ProductTypeArt({
  type,
  ...props
}: IllustrationProps & { type: ProductType }) {
  switch (type) {
    case PRODUCT_TYPE.CUPCAKE:
      return <CupcakeArt {...props} />;
    case PRODUCT_TYPE.CHOCOLATE:
      return <ChocolateArt {...props} />;
    default:
      return <TieredCakeArt {...props} />;
  }
}

const CATEGORY_ART = [TieredCakeArt, CupcakeArt, CakeSliceArt, ChocolateArt] as const;

/** Deterministic illustration for a category (stable per id). */
export function CategoryArt({ seed, ...props }: IllustrationProps & { seed: string }) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const index = Math.abs(hash) % CATEGORY_ART.length;
  const Art = CATEGORY_ART[index] ?? TieredCakeArt;
  return <Art {...props} />;
}
