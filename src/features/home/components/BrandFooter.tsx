import type { BrandContent } from "@/types/domain.types";
import { HOME_COPY } from "../constants";

export interface BrandFooterProps {
  content: BrandContent | null | undefined;
  /** Brand name, used as the footer heading. */
  brandName?: string | null;
  /** Brand logo — shown as the footer's crest when available. */
  logoUrl?: string | null;
}

type IconProps = { className?: string };

/**
 * Brand glyphs as inline SVGs — lucide dropped Facebook/Instagram marks over
 * trademark concerns, and self-contained paths keep the footer dependency-free.
 */
function InstagramIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 9h3V6h-3c-1.66 0-3 1.34-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9.5c0-.28.22-.5.5-.5H14z" />
    </svg>
  );
}

function WhatsappIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2A9.9 9.9 0 0 0 2.13 11.9c0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.9 9.9 0 0 0 4.74 1.2h.01A9.9 9.9 0 0 0 22 11.9 9.9 9.9 0 0 0 12.04 2zm0 18.1h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.14.82.84-3.06-.2-.31a8.2 8.2 0 1 1 6.99 4.08zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.13-.16.25-.63.8-.77.96-.14.16-.28.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.28.37-.42.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42l-.47-.01c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.62 4.15 3.67.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28z" />
    </svg>
  );
}

const SOCIAL = [
  { key: "instagramUrl", label: "Instagram", Icon: InstagramIcon },
  { key: "facebookUrl", label: "Facebook", Icon: FacebookIcon },
  { key: "whatsappUrl", label: "WhatsApp", Icon: WhatsappIcon },
] as const;

/**
 * Storefront footer showing the brand's CMS content — about/tagline text and
 * social links. Renders nothing when the brand has set none of it, so branches
 * without content don't get an empty slab.
 */
export function BrandFooter({ content, brandName, logoUrl }: BrandFooterProps) {
  if (!content) return null;

  const links = SOCIAL.filter((s) => content[s.key]);
  const hasText = Boolean(content.tagline || content.aboutText);
  if (!hasText && links.length === 0) return null;

  const initial = (brandName ?? "").trim().charAt(0).toUpperCase() || "•";
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-8 overflow-hidden rounded-t-[2rem] border-t border-border bg-gradient-to-b from-surface-2/70 to-surface-2/20 px-6 pb-9 pt-9">
      {/* Hairline accent that draws the eye to the brand crest. */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Crest + wordmark */}
      <div className="flex flex-col items-center text-center">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={brandName ?? "Brand"}
            className="h-16 w-16 rounded-2xl object-cover shadow-sm ring-1 ring-border"
          />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/12 text-2xl font-bold text-primary ring-1 ring-primary/15">
            {initial}
          </div>
        )}
        {brandName && (
          <h2 className="mt-3.5 text-[19px] font-bold tracking-tight text-foreground">
            {brandName}
          </h2>
        )}
        {content.tagline && (
          <p className="mt-1 text-[13px] font-medium text-primary">{content.tagline}</p>
        )}
      </div>

      {/* About */}
      {content.aboutText && (
        <div className="mx-auto mt-7 max-w-[19rem]">
          <div className="mb-2.5 flex items-center justify-center gap-2.5">
            <span className="h-px w-6 bg-border" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {HOME_COPY.ABOUT_TITLE}
            </span>
            <span className="h-px w-6 bg-border" />
          </div>
          <p className="whitespace-pre-line text-center text-[13.5px] leading-relaxed text-muted-foreground">
            {content.aboutText}
          </p>
        </div>
      )}

      {/* Socials */}
      {links.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-3.5">
          {links.map(({ key, label, Icon }) => (
            <a
              key={key}
              href={content[key] as string}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="press grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-muted-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/25"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ))}
        </div>
      )}

      {/* Legal line */}
      <p className="mt-9 text-center text-[11px] tracking-wide text-muted-foreground/60">
        © {year}
        {brandName ? ` · ${brandName}` : ""} · All rights reserved
      </p>
    </footer>
  );
}
