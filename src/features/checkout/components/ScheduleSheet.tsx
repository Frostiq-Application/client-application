import { useMemo } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { WheelPicker } from "@/components/ui/WheelPicker";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate, formatTime } from "@/utils/format";
import { cn } from "@/lib/cn";
import { CHECKOUT_COPY } from "../constants";

export interface ScheduleSlot {
  start: string;
  end: string;
}

export interface ScheduleSheetProps {
  open: boolean;
  onClose: () => void;
  dates: string[];
  date: string | null;
  onDate: (date: string) => void;
  slots: ScheduleSlot[];
  slotsLoading: boolean;
  closedReason: string | null;
  slot: ScheduleSlot | null;
  onSlot: (slot: ScheduleSlot | null) => void;
}

/** iOS-style schedule picker: date chips on top, a time wheel below. */
export function ScheduleSheet({
  open,
  onClose,
  dates,
  date,
  onDate,
  slots,
  slotsLoading,
  closedReason,
  slot,
  onSlot,
}: ScheduleSheetProps) {
  const labels = useMemo(
    () => slots.map((s) => `${formatTime(s.start)} – ${formatTime(s.end)}`),
    [slots],
  );
  const index = Math.max(
    0,
    slots.findIndex((s) => s.start === slot?.start),
  );

  return (
    <Sheet open={open} onClose={onClose} title={CHECKOUT_COPY.SCHEDULE_TITLE}>
      {/* Dates */}
      <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-1">
        {dates.map((d) => {
          const active = d === date;
          return (
            <button
              key={d}
              type="button"
              onClick={() => {
                onDate(d);
                onSlot(null);
              }}
              className={cn(
                "h-11 shrink-0 rounded-2xl px-4 text-sm font-bold transition-colors",
                active ? "bg-primary text-primary-foreground shadow-sm" : "bg-surface-2",
              )}
            >
              {formatDate(d)}
            </button>
          );
        })}
      </div>

      {/* Time wheel */}
      <div className="mt-3">
        {slotsLoading ? (
          <div className="flex h-[220px] items-center justify-center">
            <Spinner />
          </div>
        ) : slots.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center px-8 text-center text-sm text-muted-foreground">
            {closedReason ?? CHECKOUT_COPY.NO_SLOTS}
          </div>
        ) : (
          <WheelPicker
            items={labels}
            index={index}
            onChange={(i) => onSlot(slots[i] ?? null)}
          />
        )}
      </div>

      <Button
        block
        size="lg"
        className="mt-4 rounded-full"
        onClick={() => {
          // Confirm the centered slot even if the user never scrolled.
          if (!slot && slots.length > 0) onSlot(slots[0] ?? null);
          onClose();
        }}
      >
        {CHECKOUT_COPY.SCHEDULE_DONE}
      </Button>
    </Sheet>
  );
}
