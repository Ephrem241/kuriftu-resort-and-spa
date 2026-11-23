import { bookingConfig, ENGINE_PAGES, SHARED_PARAMS, type BookingConfig } from "./config"
import { isIsoDate, nightsBetween } from "./dates"

/** A resort's TravelBook property: `id_albergo` and its `dc` code. */
export type BookingProperty = { id: string; code: string }

/** A validated stay (dates as YYYY-MM-DD). */
export type BookingStay = {
  checkIn: string
  checkOut: string
  adults: number
  children: number
}

export type HandoffInput = {
  property?: BookingProperty | null
  stay?: BookingStay | null
}

const DIGITS = /^\d+$/

function isProperty(p: BookingProperty | null | undefined): p is BookingProperty {
  return !!p && DIGITS.test(p.id) && DIGITS.test(p.code)
}

function isStay(s: BookingStay | null | undefined): s is BookingStay {
  return (
    !!s &&
    isIsoDate(s.checkIn) &&
    isIsoDate(s.checkOut) &&
    s.checkOut > s.checkIn &&
    Number.isInteger(s.adults) &&
    s.adults >= 1 &&
    Number.isInteger(s.children) &&
    s.children >= 0
  )
}

/** "2027-01-05" → ["05", "01", "2027"] (day, month, year). */
function dmy(iso: string): [string, string, string] {
  const [y, m, d] = iso.split("-")
  return [d, m, y]
}

/**
 * Turns a guest's choices into a TravelBook URL. Pure: no payment, no storage.
 *
 * - No (valid) property: the group "Reserve" link from env, unchanged.
 * - Property: that property's calendar.
 * - Property + stay: its room results for those dates and guests. Child ages
 *   are not sent, so with children the engine asks for them on its own page.
 *
 * Returns "" when the engine URL is missing or not an https TravelBook-style
 * `/premium/` link; callers fall back to /contact.
 */
export function buildBookingUrl(
  { property, stay }: HandoffInput = {},
  config: BookingConfig = bookingConfig
): string {
  let group: URL
  try {
    group = new URL(config.baseUrl)
  } catch {
    return ""
  }
  if (group.protocol !== "https:" || !group.pathname.includes("/premium/")) return ""

  if (!isProperty(property)) return group.toString()

  const withStay = isStay(stay)
  const url = new URL(withStay ? ENGINE_PAGES.propertyStay : ENGINE_PAGES.property, group)
  const set = (name: string, value: string | number) => url.searchParams.set(name, String(value))

  set("id_albergo", property.id)
  set("dc", property.code)
  for (const name of SHARED_PARAMS) {
    const value = group.searchParams.get(name)
    if (value) set(name, value)
  }

  if (withStay) {
    const [gg, mm, aa] = dmy(stay.checkIn)
    const [ggf, mmf, aaf] = dmy(stay.checkOut)
    set("gg", gg)
    set("mm", mm)
    set("aa", aa)
    set("ggf", ggf)
    set("mmf", mmf)
    set("aaf", aaf)
    set("notti_1", nightsBetween(stay.checkIn, stay.checkOut))
    set("tot_camere", 1)
    set("tot_adulti", stay.adults)
    set("tot_bambini", stay.children)
    set("adulti1", stay.adults)
    set("bambini1", stay.children)
  }

  return url.toString()
}
