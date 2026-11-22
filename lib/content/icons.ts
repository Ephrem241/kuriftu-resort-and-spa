/**
 * Icon names editors can pick in Sanity (studio ICON_OPTIONS values).
 * Each maps to one Lucide outline icon in components/ui/content-icon.tsx.
 */
export const ICON_NAMES = [
  "bed",
  "spa",
  "utensils",
  "activity",
  "map-pin",
  "calendar",
  "user",
  "wifi",
  "waves",
  "car",
  "coffee",
  "dumbbell",
  "trees",
  "mountain",
  "eye",
  "snowflake",
  "tv",
  "bath",
  "wind",
  "vault",
  "refrigerator",
  "phone",
  "baby",
  "party-popper",
  "presentation",
  "landmark",
  "leaf",
] as const

export type IconName = (typeof ICON_NAMES)[number]

export function isIconName(value: unknown): value is IconName {
  return typeof value === "string" && (ICON_NAMES as readonly string[]).includes(value)
}
