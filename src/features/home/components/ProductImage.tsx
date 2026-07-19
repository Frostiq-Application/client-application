import { useState } from "react";
import { ProductTypeArt } from "@/components/common/illustrations";
import { cn } from "@/lib/cn";
import type { ProductType } from "@/constants/status.constants";

export interface ProductImageProps {
  src: string | undefined;
  alt: string;
  type: ProductType;
  className?: string;
  /** Classes for the illustration fallback (usually adds padding). */
  artClassName?: string;
}

/**
 * Product photo with a graceful illustration fallback — used instead of a raw
 * <img> so a missing or broken URL never shows the browser's broken-image glyph.
 */
export function ProductImage({ src, alt, type, className, artClassName }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;

  if (!showImage) {
    return <ProductTypeArt type={type} className={cn(className, artClassName)} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
