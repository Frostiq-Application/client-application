import { Megaphone } from "lucide-react";
import type { Announcement } from "@/types/domain.types";

/** Thin announcement strip above the header — colors come from the CMS row. */
export function AnnouncementBar({ announcement }: { announcement: Announcement | null }) {
  if (!announcement) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-semibold"
      style={{
        backgroundColor: announcement.bgColor ?? "hsl(var(--primary))",
        color: announcement.textColor ?? "hsl(var(--primary-foreground))",
      }}
      role="status"
    >
      <Megaphone className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{announcement.message}</span>
    </div>
  );
}
