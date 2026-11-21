import { bookingConfig, type BookingConfig } from "./config"

export type HandoffInput = {
  propertyId?: string | null
  checkIn?: string
  checkOut?: string
  adults?: number
  children?: number
}

/**
 * Turns a guest's choices into a TravelBook URL. Pure: no payment, no storage.
 * Only parameters with a verified name in `config.paramMap` are appended.
 * Returns "" when the engine URL is not configured.
 */
export function buildBookingUrl(
  input: HandoffInput = {},
  config: BookingConfig = bookingConfig
): string {
  if (!config.baseUrl) return ""

  let url: URL
  try {
    url = new URL(config.baseUrl)
  } catch {
    return ""
  }
  if (url.protocol !== "https:") return ""

  const { paramMap } = config
  const set = (name: string | null, value: string | number | null | undefined) => {
    if (!name || value === undefined || value === null || value === "") return
    url.searchParams.set(name, String(value))
  }

  set(paramMap.property, input.propertyId)
  set(paramMap.checkIn, input.checkIn)
  set(paramMap.checkOut, input.checkOut)
  set(paramMap.adults, input.adults)
  set(paramMap.children, input.children)

  return url.toString()
}
