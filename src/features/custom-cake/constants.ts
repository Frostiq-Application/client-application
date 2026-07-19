import type { CustomCakeStatus } from "@/types/domain.types";

/** Steps of the custom cake request wizard, in order. */
export const CUSTOM_CAKE_STEPS = [
  { key: "cake", label: "Cake" },
  { key: "flavour", label: "Flavour" },
  { key: "appearance", label: "Design" },
  { key: "delivery", label: "Delivery" },
  { key: "review", label: "Review" },
] as const;

export type CustomCakeStep = (typeof CUSTOM_CAKE_STEPS)[number]["key"];

/** Single-select option fields → the request property they fill. */
export const SELECT_FIELDS: {
  field: string;
  label: string;
  prop:
    | "cakeType"
    | "weight"
    | "shape"
    | "theme"
    | "occasion"
    | "sponge"
    | "cream"
    | "filling"
    | "flavour"
    | "colour"
    | "topper";
  step: CustomCakeStep;
}[] = [
  { field: "cake_type", label: "Cake type", prop: "cakeType", step: "cake" },
  { field: "weight", label: "Weight", prop: "weight", step: "cake" },
  { field: "shape", label: "Shape", prop: "shape", step: "cake" },
  { field: "occasion", label: "Occasion", prop: "occasion", step: "cake" },
  { field: "theme", label: "Theme", prop: "theme", step: "cake" },
  { field: "sponge", label: "Sponge", prop: "sponge", step: "flavour" },
  { field: "cream", label: "Cream", prop: "cream", step: "flavour" },
  { field: "filling", label: "Filling", prop: "filling", step: "flavour" },
  { field: "flavour", label: "Flavour", prop: "flavour", step: "flavour" },
  { field: "colour", label: "Colour", prop: "colour", step: "appearance" },
  { field: "topper", label: "Topper", prop: "topper", step: "appearance" },
];

export const MAX_REFERENCE_IMAGES = 5;

export const CUSTOM_CAKE_COPY = {
  entryTitle: "Custom Cake",
  entrySubtitle: "Dream it up — we'll bake it",
  intro:
    "Tell us about your dream cake and we'll send you a quote. Flavour, design, reference photos, delivery — all in a few taps.",
  start: "Start a request",
  myRequests: "My requests",
  submitted: "Request sent!",
  submittedBody:
    "We've received your custom cake request. The bakery will review it and send you a quote shortly.",
};

export const CUSTOM_CAKE_STATUS_LABEL: Record<CustomCakeStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  quotation_sent: "Quote sent",
  accepted: "Accepted",
  rejected: "Declined",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Tailwind tone classes per status (badge bg/text). */
export const CUSTOM_CAKE_STATUS_TONE: Record<CustomCakeStatus, string> = {
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-violet-100 text-violet-700",
  quotation_sent: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  preparing: "bg-amber-100 text-amber-700",
  ready: "bg-emerald-100 text-emerald-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

/** Customer-visible request pipeline (excludes the off-ramps). */
export const CUSTOM_CAKE_PIPELINE: CustomCakeStatus[] = [
  "submitted",
  "under_review",
  "quotation_sent",
  "accepted",
  "preparing",
  "ready",
  "delivered",
];
