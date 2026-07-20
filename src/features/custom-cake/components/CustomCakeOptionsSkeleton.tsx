import { Skeleton } from "@/components/ui/Skeleton";

/** Loading placeholder for a step's option pills while admin-configured choices load. */
export function CustomCakeOptionsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <Skeleton className="mb-2 h-4 w-24" />
          <div className="flex flex-wrap gap-2">
            {PILL_WIDTHS.map((w, j) => (
              <Skeleton key={j} className={`h-8 ${w} rounded-full`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const PILL_WIDTHS = ["w-16", "w-20", "w-14", "w-24", "w-16"];
