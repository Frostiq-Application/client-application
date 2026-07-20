import type { CustomCakeStatus } from "@/types/domain.types";

/**
 * Steps of the custom cake request wizard, in order. Image-first: the customer
 * shares their inspiration up front, the detail pills are one optional step,
 * and the flow ends on delivery + contact where the request is sent.
 */
export const CUSTOM_CAKE_STEPS = [
  { key: "inspiration", label: "Inspiration" },
  { key: "details", label: "Details" },
  { key: "delivery", label: "Delivery" },
] as const;

export type CustomCakeStep = (typeof CUSTOM_CAKE_STEPS)[number]["key"];

/** Subsections shown within the single (optional) "Details" step. */
export const DETAIL_GROUPS = [
  { key: "size", title: "Size & shape" },
  { key: "flavour", title: "Flavour" },
  { key: "look", title: "Look & feel" },
] as const;

export type DetailGroup = (typeof DETAIL_GROUPS)[number]["key"];

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
  group: DetailGroup;
}[] = [
  { field: "cake_type", label: "Cake type", prop: "cakeType", group: "size" },
  { field: "weight", label: "Weight", prop: "weight", group: "size" },
  { field: "shape", label: "Shape", prop: "shape", group: "size" },
  { field: "sponge", label: "Sponge", prop: "sponge", group: "flavour" },
  { field: "cream", label: "Cream", prop: "cream", group: "flavour" },
  { field: "filling", label: "Filling", prop: "filling", group: "flavour" },
  { field: "flavour", label: "Flavour", prop: "flavour", group: "flavour" },
  { field: "occasion", label: "Occasion", prop: "occasion", group: "look" },
  { field: "theme", label: "Theme", prop: "theme", group: "look" },
  { field: "colour", label: "Colour", prop: "colour", group: "look" },
  { field: "topper", label: "Topper", prop: "topper", group: "look" },
];

export const MAX_REFERENCE_IMAGES = 5;

export const CUSTOM_CAKE_COPY = {
  entryTitle: "Custom Cake",
  entrySubtitle: "Dream it up — we'll bake it",
  intro:
    "Tell us about your dream cake and we'll send you a quote. Flavour, design, reference photos, delivery — all in a few taps.",
  start: "Start a request",
  myRequests: "My requests",
  inspirationTitle: "Show us your dream cake",
  inspirationSubtitle: "Share a photo or two — a screenshot, a Pinterest pin, anything.",
  addDetails: "Add details",
  skipToSend: "Skip — just send my photo",
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
