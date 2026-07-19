import { PRODUCT_TYPE, type ProductType } from "@/constants/status.constants";

/** Copy + option sets for the search feature. */

export const SEARCH_COPY = {
  TITLE: "Search",
  RECENT: "Recent searches",
  CLEAR: "Clear",
  POPULAR: "Popular right now",
  FILTERS: "Filters",
  TYPE: "Type",
  EGGLESS_ONLY: "Eggless only",
  SORT: "Sort by",
  APPLY: "Apply",
  RESET: "Reset",
  RESULTS: (n: number) => `${n} ${n === 1 ? "result" : "results"}`,
  START_TITLE: "What are you craving?",
  START_DESC: "Search cakes, cupcakes and chocolates from your branch.",
  MENU: "Menu",
  MENU_ITEMS: (n: number) => `${n} ${n === 1 ? "item" : "items"}`,
  MENU_UNCATEGORIZED: "More treats",
  MENU_SEE_ALL: "See all",
  MENU_EMPTY_TITLE: "Menu's warming up",
  MENU_EMPTY_DESC: "This branch hasn't added products yet.",
  EMPTY_TITLE: "No matches",
  EMPTY_DESC: (q: string) => `Nothing found for "${q}". Try another flavour?`,
} as const;

export const TYPE_OPTIONS: ReadonlyArray<{ value: ProductType | ""; label: string }> = [
  { value: "", label: "All" },
  { value: PRODUCT_TYPE.CAKE, label: "Cakes" },
  { value: PRODUCT_TYPE.CUPCAKE, label: "Cupcakes" },
  { value: PRODUCT_TYPE.CHOCOLATE, label: "Chocolates" },
];

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export interface SearchFilters {
  type: ProductType | "";
  egglessOnly: boolean;
  sort: SortValue;
}

export const DEFAULT_FILTERS: SearchFilters = {
  type: "",
  egglessOnly: false,
  sort: "recommended",
};

export const RECENT_SEARCHES_MAX = 8;
