import { motion } from "framer-motion";
import type { Banner } from "@/types/domain.types";
import { tapScale } from "@/animations/variants";
import { useNavigate } from "react-router-dom";
import { buildPath } from "@/routes/paths";

/** Snap-scrolling promo banner carousel (Zomato deal-cards feel). */
export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const navigate = useNavigate();
  if (banners.length === 0) return null;

  const onTap = (banner: Banner) => {
    if (banner.tapAction === "open_category" && banner.tapTarget) {
      navigate(buildPath.category(banner.tapTarget));
    } else if (banner.tapAction === "open_product" && banner.tapTarget) {
      navigate(buildPath.product(banner.tapTarget));
    } else if (banner.tapAction === "open_url" && banner.tapTarget) {
      window.open(banner.tapTarget, "_blank", "noopener");
    }
  };

  return (
    <div className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-1">
      {banners.map((banner) => (
        <motion.button
          key={banner.id}
          type="button"
          whileTap={tapScale}
          onClick={() => onTap(banner)}
          className="relative aspect-[2.2/1] w-[85%] shrink-0 snap-center overflow-hidden rounded-3xl shadow-card md:w-[420px]"
        >
          <img
            src={banner.imageUrl}
            alt={banner.title ?? "Offer"}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {(banner.title || banner.subtitle) && (
            <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-4 text-left text-white">
              {banner.title && (
                <span className="text-lg font-extrabold leading-tight">{banner.title}</span>
              )}
              {banner.subtitle && (
                <span className="mt-0.5 text-xs font-medium opacity-90">{banner.subtitle}</span>
              )}
              {banner.ctaLabel && (
                <span className="mt-2 self-start rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-black">
                  {banner.ctaLabel}
                </span>
              )}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
}
