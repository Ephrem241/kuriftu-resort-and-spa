import { z } from "zod"

import { isIsoDate } from "./dates"
import { GUEST_LIMITS } from "./guest-limits"

export { GUEST_LIMITS }

/**
 * Availability search rules. `bookableSlugs` and `today` are injected so the
 * schema stays pure and testable (today is computed in Africa/Addis_Ababa).
 */
export function createSearchSchema({
  bookableSlugs,
  today,
}: {
  bookableSlugs: readonly string[]
  today: string
}) {
  const isoDate = z.string().refine(isIsoDate, "Choose a date")

  return z
    .object({
      destination: z
        .string()
        .min(1, "Choose a destination")
        .refine((slug) => bookableSlugs.includes(slug), "Choose a destination"),
      checkIn: isoDate.refine((d) => d >= today, "Check-in can't be in the past"),
      checkOut: isoDate,
      adults: z
        .number()
        .int()
        .min(GUEST_LIMITS.adults.min, "At least one adult")
        .max(GUEST_LIMITS.adults.max),
      children: z
        .number()
        .int()
        .min(GUEST_LIMITS.children.min)
        .max(GUEST_LIMITS.children.max),
    })
    .refine((v) => v.checkOut > v.checkIn, {
      path: ["checkOut"],
      message: "Check-out must be after check-in",
    })
}

export type AvailabilitySearch = z.infer<ReturnType<typeof createSearchSchema>>
