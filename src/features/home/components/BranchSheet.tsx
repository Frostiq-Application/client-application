import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Store } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useBrand } from "@/hooks/useStorefront";
import { useBranchStore } from "@/store/branchStore";
import { toast } from "@/store/toastStore";
import { HOME_COPY } from "../constants";
import type { GeoPoint } from "@/services/api/storefront.service";
import { cn } from "@/lib/cn";

export interface BranchSheetProps {
  open: boolean;
  onClose: () => void;
  /** When true the sheet can't be dismissed until a branch is chosen. */
  required?: boolean;
}

/** Branch picker: nearest-first when location is granted, open/closed badges. */
export function BranchSheet({ open, onClose, required }: BranchSheetProps) {
  const [geo, setGeo] = useState<GeoPoint | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const { data: brand } = useBrand(geo);
  const selectedShopId = useBranchStore((s) => s.selectedShopId);
  const selectBranch = useBranchStore((s) => s.selectBranch);

  const branches = brand?.branches ?? [];

  /**
   * @param silent suppress the error toast — used by the automatic first-open
   *   request, where a denied permission shouldn't nag the customer.
   */
  const locate = (silent = false) => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        if (!silent) toast.error("Couldn't get your location");
      },
      { timeout: 8000 },
    );
  };

  // First-visit: the sheet opens forced (required) with no branch chosen yet, so
  // prompt for location once to sort branches nearest-first automatically. Guarded
  // so it fires a single time per mount — not on every open or manual re-open.
  const autoLocated = useRef(false);
  useEffect(() => {
    if (open && required && !geo && !autoLocated.current) {
      autoLocated.current = true;
      locate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, required]);

  return (
    <Sheet
      open={open}
      onClose={required ? () => undefined : onClose}
      title={HOME_COPY.SELECT_BRANCH}
      dismissible={!required}
    >
      <div className="space-y-3 pt-1">
        <Button variant="secondary" size="sm" block loading={locating} onClick={() => locate()}>
          <LocateFixed className="h-4 w-4" />
          {locating ? HOME_COPY.LOCATING : HOME_COPY.USE_MY_LOCATION}
        </Button>

        <div className="space-y-2">
          {branches.map((b) => {
            const active = b.id === selectedShopId;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  selectBranch(b.id);
                  onClose();
                }}
                className={cn(
                  "press flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors",
                  active ? "border-primary bg-primary/8" : "border-border bg-surface-2/50",
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Store className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-semibold">{b.branchName}</span>
                    <Badge tone={b.isOpenNow ? "success" : "danger"}>
                      {b.isOpenNow ? HOME_COPY.OPEN_NOW : HOME_COPY.CLOSED_NOW}
                    </Badge>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-[13px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {b.displayArea ?? b.city ?? b.address ?? b.slug}
                      {b.distanceKm != null && ` · ${b.distanceKm.toFixed(1)} km`}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
