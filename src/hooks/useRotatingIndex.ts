import { useEffect, useState } from "react";

/** Cycles 0..count-1 on an interval — powers rotating placeholders/tickers. */
export function useRotatingIndex(count: number, intervalMs: number): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs]);

  return index;
}
