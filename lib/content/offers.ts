/**
 * Offer timing. An offer is live from its start date (inclusive) until its
 * end date (exclusive). Cached offer data lives only until the next start or
 * end, so offers appear and disappear without a deploy.
 */

import { RESORT_TIME_ZONE } from "@/lib/booking/dates"

import type { OfferCategory, OfferResort } from "./types"

export type Dated = { startDate: string; endDate: string }

/** Shortest cache lifetime; anything under 5 minutes becomes a dynamic hole. */
export const MIN_CACHE_SECONDS = 300
/** Longest cache lifetime when no offer starts or ends sooner. */
export const MAX_CACHE_SECONDS = 86_400

export function isLive(offer: Dated, now: Date): boolean {
  const t = now.getTime()
  const start = Date.parse(offer.startDate)
  const end = Date.parse(offer.endDate)
  return start <= t && t < end
}

/** The soonest future start or end across offers (ms since epoch), or null. */
export function nextBoundary(offers: Dated[], now: Date): number | null {
  const t = now.getTime()
  let next: number | null = null
  for (const offer of offers) {
    for (const value of [Date.parse(offer.startDate), Date.parse(offer.endDate)]) {
      if (Number.isFinite(value) && value > t && (next === null || value < next)) next = value
    }
  }
  return next
}

/** Seconds the offer data may be cached: until the next boundary, clamped. */
export function cacheSeconds(offers: Dated[], now: Date): number {
  const next = nextBoundary(offers, now)
  if (next === null) return MAX_CACHE_SECONDS
  const seconds = Math.ceil((next - now.getTime()) / 1000)
  return Math.min(MAX_CACHE_SECONDS, Math.max(MIN_CACHE_SECONDS, seconds))
}

/** From live offers, the popup offer that ends soonest, or null. */
export function pickPopupOffer<T extends Dated & { showAsPopup: boolean }>(liveOffers: T[]): T | null {
  let pick: T | null = null
  for (const offer of liveOffers) {
    if (!offer.showAsPopup) continue
    if (!pick || Date.parse(offer.endDate) < Date.parse(pick.endDate)) pick = offer
  }
  return pick
}

/** "Nov 30, 2026", in the resorts' time zone so dates don't shift abroad. */
export function formatOfferDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("en-US", {
    timeZone: RESORT_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/** Offer filters on /offers, in tile order. Keep in sync with the Studio schema. */
export const OFFER_CATEGORIES: ReadonlyArray<{ value: OfferCategory; label: string }> = [
  { value: "deals", label: "Special Deals" },
  { value: "stay", label: "Stay Packages" },
  { value: "wellness", label: "Wellness Retreats" },
  { value: "dining", label: "Dining Offers" },
  { value: "family", label: "Family Packages" },
]

export function isOfferCategory(value: unknown): value is OfferCategory {
  return OFFER_CATEGORIES.some((c) => c.value === value)
}

/** Offers in one category, or all of them when none is chosen. */
export function filterByCategory<T extends { category: OfferCategory }>(
  offers: T[],
  category: OfferCategory | null
): T[] {
  return category ? offers.filter((o) => o.category === category) : offers
}

/** Where an offer applies: resort names, or "All Resorts" when it lists none. */
export function offerWhere(resorts: { name: string }[]): string {
  return resorts.length > 0 ? resorts.map((r) => r.name).join(", ") : "All Resorts"
}

export type OfferAction =
  /** Booking engine hand-off; `resort` set when the offer is for one bookable resort. */
  | { kind: "book"; resort: OfferResort | null }
  /** No bookable resort: contact the resort, or site reservations when null. */
  | { kind: "contact"; resort: OfferResort | null }

/**
 * How a guest takes up an offer. One resort: book it, or contact it when it
 * isn't bookable. Several or all resorts: the group booking engine, unless
 * none of the listed resorts can be booked.
 */
export function offerAction(resorts: OfferResort[]): OfferAction {
  if (resorts.length === 0) return { kind: "book", resort: null }
  if (resorts.length === 1) {
    const [resort] = resorts
    return { kind: resort.bookable ? "book" : "contact", resort }
  }
  return resorts.some((r) => r.bookable) ? { kind: "book", resort: null } : { kind: "contact", resort: null }
}

/** The short line, unless it only repeats the title (e.g. "Enjoy " + title). */
export function offerSubtitle(title: string, shortLine: string): string {
  const line = shortLine.trim()
  return line.toLowerCase().includes(title.trim().toLowerCase()) ? "" : line
}
