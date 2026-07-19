/** Validation limits and messages — consumed by Zod schemas in features. */

export const VALIDATION = {
  NAME_MIN: 1,
  NAME_MAX: 80,
  PHONE_REGEX: /^[+]?[0-9\s-]{7,15}$/,
  ADDRESS_MIN: 3,
  PINCODE_REGEX: /^[1-9][0-9]{5}$/,
  NOTE_MAX: 500,
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required",
  NAME_INVALID: "Please enter a valid name",
  PHONE_INVALID: "Please enter a valid phone number",
  ADDRESS_TOO_SHORT: "Please enter a complete address",
  PINCODE_INVALID: "Please enter a valid 6-digit pincode",
  NOTE_TOO_LONG: "Note is too long",
} as const;
