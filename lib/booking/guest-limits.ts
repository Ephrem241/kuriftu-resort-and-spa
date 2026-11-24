/**
 * Guest count limits for the availability search. Kept free of Zod so the
 * guests picker can use them without pulling the schema into the page's JS.
 */
export const GUEST_LIMITS = {
  adults: { min: 1, max: 8 },
  children: { min: 0, max: 6 },
} as const
