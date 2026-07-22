import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/cn";
import {
  DEFAULT_FILTERS,
  SEARCH_COPY,
  SORT_OPTIONS,
  TYPE_OPTIONS,
  type SearchFilters,
} from "../constants";
import type { Category } from "@/types/domain.types";

export interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  value: SearchFilters;
  categories: Category[];
  onApply: (filters: SearchFilters) => void;
}

/** Search filters: category, product type, eggless-only, price sort. */
export function FilterSheet({ open, onClose, value, categories, onApply }: FilterSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={SEARCH_COPY.FILTERS}>
      {/* Sheet unmounts its children when closed, so the draft re-seeds per open. */}
      <FilterForm
        initial={value}
        categories={categories}
        onApply={(f) => {
          onApply(f);
          onClose();
        }}
      />
    </Sheet>
  );
}

function FilterForm({
  initial,
  categories,
  onApply,
}: {
  initial: SearchFilters;
  categories: Category[];
  onApply: (filters: SearchFilters) => void;
}) {
  const [draft, setDraft] = useState<SearchFilters>(initial);

  const apply = () => onApply(draft);
  const reset = () => setDraft(DEFAULT_FILTERS);

  return (
    <div className="space-y-5 pt-1">
        {categories.length > 0 && (
          <section>
            <h3 className="text-sm font-extrabold">{SEARCH_COPY.CATEGORY}</h3>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {[{ id: "", name: SEARCH_COPY.ALL_CATEGORIES }, ...categories].map((category) => {
                const active = draft.categoryId === category.id;
                return (
                  <button
                    key={category.id || "all"}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDraft((d) => ({ ...d, categoryId: category.id }))}
                    className={cn(
                      "h-10 rounded-full px-4 text-sm font-bold transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-2 text-foreground",
                    )}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-sm font-extrabold">{SEARCH_COPY.TYPE}</h3>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((opt) => {
              const active = draft.type === opt.value;
              return (
                <button
                  key={opt.value || "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDraft((d) => ({ ...d, type: opt.value }))}
                  className={cn(
                    "h-10 rounded-full px-4 text-sm font-bold transition-colors",
                    active ? "bg-primary text-primary-foreground" : "bg-surface-2 text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold">{SEARCH_COPY.EGGLESS_ONLY}</h3>
          <Switch
            checked={draft.egglessOnly}
            label={SEARCH_COPY.EGGLESS_ONLY}
            onCheckedChange={(on) => setDraft((d) => ({ ...d, egglessOnly: on }))}
          />
        </section>

        <section>
          <h3 className="text-sm font-extrabold">{SEARCH_COPY.SORT}</h3>
          <div className="mt-2.5 space-y-2">
            {SORT_OPTIONS.map((opt) => {
              const active = draft.sort === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDraft((d) => ({ ...d, sort: opt.value }))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                    active ? "border-primary bg-primary/8 text-foreground" : "border-border",
                  )}
                >
                  {opt.label}
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full border-2",
                      active ? "border-primary bg-primary" : "border-muted-foreground/40",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </section>

      <div className="flex gap-2.5 pt-1">
        <Button variant="secondary" block onClick={reset}>
          {SEARCH_COPY.RESET}
        </Button>
        <Button block onClick={apply}>
          {SEARCH_COPY.APPLY}
        </Button>
      </div>
    </div>
  );
}
