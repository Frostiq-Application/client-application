import { forwardRef, type InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

/** iOS-style search field: pill, leading icon, clear button. */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, value, onClear, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-11 items-center gap-2 rounded-2xl bg-surface-2 px-3.5 transition-shadow focus-within:ring-2 focus-within:ring-ring/40",
          className,
        )}
      >
        <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" strokeWidth={2.25} />
        <input
          ref={ref}
          type="search"
          value={value}
          enterKeyHint="search"
          className="h-full w-full bg-transparent text-base outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          {...props}
        />
        {!!value && onClear && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={onClear}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted-foreground/25 text-surface"
          >
            <X className="h-3 w-3" strokeWidth={3} />
          </button>
        )}
      </div>
    );
  },
);
SearchBar.displayName = "SearchBar";
