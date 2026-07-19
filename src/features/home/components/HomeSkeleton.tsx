import { Skeleton } from "@/components/ui/Skeleton";

/** Loading placeholder mirroring the Home layout. */
export function HomeSkeleton() {
  return (
    <div className="space-y-5 pb-8">
      <div className="space-y-3 px-4 pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-11 w-full rounded-2xl" />
      </div>
      <div className="flex gap-3 px-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2.2/1] w-[85%] shrink-0 rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3 px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-[72px] w-[72px] rounded-full" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
