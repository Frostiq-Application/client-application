import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, MapPin, Store } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { useBrand } from "@/hooks/useStorefront";
import { useBranchStore } from "@/store/branchStore";
import { useGeoStore } from "@/store/geoStore";
import { toast } from "@/store/toastStore";
import { HOME_COPY } from "../constants";
import { cn } from "@/lib/cn";

export interface BranchSheetProps {
  open: boolean;
  onClose: () => void;
  /** When true the sheet can't be dismissed until a branch is chosen. */
  required?: boolean;
}

/** Branch picker: nearest-first when location is granted, open/closed badges. */
export function BranchSheet({ open, onClose, required }: BranchSheetProps) {
  const [locating, setLocating] = useState(false);
  const { data: brand, isPending, isPlaceholderData } = useBrand();
  const geo = useGeoStore((s) => s.geo);
  const setGeo = useGeoStore((s) => s.setGeo);
  const selectedShopId = useBranchStore((s) => s.selectedShopId);
  const selectBranch = useBranchStore((s) => s.selectBranch);

  const branches = useMemo(() => brand?.branches ?? [], [brand]);

  /**
   * Bumped when the customer taps "Use my location" themselves — their intent is
   * "put me on the closest branch", so the nearest one gets selected once the
   * distance-sorted list lands. The silent first-visit lookup leaves it at 0:
   * that one only re-sorts the list, it never picks on the customer's behalf.
   *
   * A counter rather than a ref, and bumped on every tap, because the position
   * is often unchanged from the previous lookup — same query key, same cached
   * response, so nothing else in the effect's deps would change and a ref would
   * never re-trigger it. The bump is the signal.
   */
  const [pickNearestAt, setPickNearestAt] = useState(0);
  /** Highest tap already acted on, so one tap picks a branch exactly once. */
  const pickedAt = useRef(0);

  /**
   * Floor on how long the skeleton stays up after an explicit tap.
   *
   * Neither `locating` nor `isPlaceholderData` is reliably visible on their own:
   * the browser answers `getCurrentPosition` from a cached fix in a few ms, and
   * when the new position matches the last one the query key is unchanged, so
   * there is no refetch and no placeholder phase at all. Both flags can come and
   * go inside a single frame, which is why the list appeared to never change.
   */
  const MIN_SKELETON_MS = 550;
  const [held, setHeld] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const holdSkeleton = () => {
    setHeld(true);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setHeld(false), MIN_SKELETON_MS);
  };

  useEffect(() => () => void (holdTimer.current && clearTimeout(holdTimer.current)), []);

  /**
   * @param silent suppress the error toast — used by the automatic first-open
   *   request, where a denied permission shouldn't nag the customer.
   */
  const locate = (silent = false) => {
    if (!navigator.geolocation) return;
    setLocating(true);
    if (!silent) holdSkeleton();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!silent) {
          setPickNearestAt((n) => n + 1);
          // Restart the hold here, not just on tap: the permission prompt can
          // eat the whole window, and the re-sort happens after this point.
          holdSkeleton();
        }
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

  // The branches arrive distance-sorted, so the first one is the closest — but
  // only once the geo-aware response replaces the placeholder (the previous,
  // unsorted list) and the branch actually has coordinates set in the portal.
  useEffect(() => {
    if (!pickNearestAt || pickNearestAt === pickedAt.current || isPlaceholderData) return;
    const nearest = branches[0];
    if (!nearest || nearest.distanceKm == null) return;
    pickedAt.current = pickNearestAt;
    if (nearest.id !== selectedShopId) {
      selectBranch(nearest.id);
      toast.success(`${HOME_COPY.NEAREST_PICKED} ${nearest.branchName}`);
    }
  }, [pickNearestAt, branches, isPlaceholderData, selectedShopId, selectBranch]);

  /**
   * Skeletons cover the whole "finding you" window: the geolocation prompt plus
   * the geo-aware refetch behind it (`isPlaceholderData` — the list on screen is
   * still the previous, unsorted one). Showing the stale order until the moment
   * it reshuffles reads as a glitch; a skeleton reads as work being done.
   */
  const showSkeleton = isPending || locating || isPlaceholderData || held;
  const skeletonRows = Math.max(branches.length, 2);

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

        {showSkeleton ? (
          <div className="space-y-2">
            {Array.from({ length: skeletonRows }, (_, i) => (
              <Skeleton key={i} className="h-[74px] rounded-2xl" />
            ))}
          </div>
        ) : branches.length === 0 ? (
          <EmptyState
            icon={<Store className="h-7 w-7" strokeWidth={1.75} />}
            title={HOME_COPY.NO_BRANCHES_TITLE}
            description={HOME_COPY.NO_BRANCHES_DESC}
          />
        ) : (
          <div className="space-y-2">
            {branches.map((b, i) => {
              const active = b.id === selectedShopId;
              // The API returns branches distance-sorted when coordinates were
              // sent, so the first one with a distance is the closest outlet.
              const nearest = i === 0 && b.distanceKm != null && branches.length > 1;
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
                    active ? "bg-primary/8 border-primary" : "border-border bg-surface-2/50",
                  )}
                >
                  <span className="bg-primary/12 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary">
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
                        {b.distanceKm != null && ` · ${b.distanceKm.toFixed(1)} km away`}
                      </span>
                      {nearest && (
                        <Badge tone="primary" className="ml-0.5 shrink-0">
                          {HOME_COPY.NEAREST}
                        </Badge>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Sheet>
  );
}
