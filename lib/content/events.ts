import { EVENT_TYPE_ENQUIRY, EVENT_TYPES, type EventType } from "@/lib/enquiry/schema"

import type { ExperienceResort, PackageKind, PackageOption, VenueSummary } from "./types"

/**
 * Event types (the /event tiles and form options) and event package kinds.
 * EVENT_TYPES lives with the enquiry schema so the server validates the same list.
 */

/** Tile and form labels, in tile order. Keep in sync with EVENT_TYPE_OPTIONS in the Studio eventsPage schema. */
export const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "wedding", label: "Weddings" },
  { value: "corporate", label: "Corporate Events" },
  { value: "social", label: "Social Events" },
  { value: "private-party", label: "Private Parties" },
  { value: "conference", label: "Conferences" },
]

export const PACKAGE_KINDS: { value: PackageKind; label: string; eventType: EventType }[] = [
  { value: "wedding", label: "Wedding", eventType: "wedding" },
  { value: "meeting", label: "Meeting", eventType: "corporate" },
  { value: "celebration", label: "Celebration", eventType: "social" },
]

export function isEventType(value: unknown): value is EventType {
  return typeof value === "string" && (EVENT_TYPES as readonly string[]).includes(value)
}

export function isPackageKind(value: unknown): value is PackageKind {
  return PACKAGE_KINDS.some((k) => k.value === value)
}

export function packageKindLabel(kind: PackageKind): string {
  return PACKAGE_KINDS.find((k) => k.value === kind)?.label ?? kind
}

/** The form's event type for a package kind (a package enquiry starts from it). */
export function eventTypeForKind(kind: PackageKind): EventType {
  return PACKAGE_KINDS.find((k) => k.value === kind)?.eventType ?? "social"
}

/** The enquiry type an event type is stored as (blank → "event"). */
export function enquiryTypeFor(eventType: EventType | ""): "event" | "meeting" {
  return eventType ? EVENT_TYPE_ENQUIRY[eventType] : "event"
}

export const ENQUIRY_ANCHOR = "event-enquiry"

/** The /event enquiry form with an event type, package or resort preselected. */
export function eventEnquiryHref(pre: { type?: EventType; package?: string; resort?: string } = {}): string {
  const params = new URLSearchParams()
  if (pre.type) params.set("type", pre.type)
  if (pre.package) params.set("package", pre.package)
  if (pre.resort) params.set("resort", pre.resort)
  const query = params.toString()
  return `/event${query ? `?${query}` : ""}#${ENQUIRY_ANCHOR}`
}

export type EnquiryPreset = {
  eventType: EventType | ""
  package: PackageOption | null
  resort: ExperienceResort | null
}

/**
 * The form's preset from the URL. Only known values are kept. A package sets
 * its kind's event type (unless `?type=` names one of the same enquiry type)
 * and its resort (the posted one if it offers the package, else its first).
 */
export function parseEnquiryPreset(
  params: { get(name: string): string | null },
  packages: readonly PackageOption[],
  resorts: readonly ExperienceResort[]
): EnquiryPreset {
  const type = params.get("type")
  const resortSlug = params.get("resort")
  const pkg = packages.find((p) => p.slug === params.get("package")) ?? null
  const requestedResort = resorts.find((r) => r.slug === resortSlug) ?? null

  let eventType: EventType | "" = isEventType(type) ? type : ""
  if (pkg) {
    const kindType = eventTypeForKind(pkg.kind)
    if (!eventType || enquiryTypeFor(eventType) !== enquiryTypeFor(kindType)) eventType = kindType
  }

  const resort = pkg
    ? (pkg.resorts.find((r) => r.slug === resortSlug) ?? pkg.resorts[0] ?? requestedResort)
    : requestedResort

  return { eventType, package: pkg, resort }
}

/** Filters for /event/venues (`?resort=` holds a resort slug). Unknown values mean "all". */
export function parseVenueResort(params: { get(name: string): string | null }, resortSlugs: readonly string[]): string | null {
  const resort = params.get("resort")
  return resort && resortSlugs.includes(resort) ? resort : null
}

export function venuesHref(resort?: string | null): string {
  return `/event/venues${resort ? `?resort=${encodeURIComponent(resort)}` : ""}`
}

export function filterVenues<T extends Pick<VenueSummary, "resort">>(venues: T[], resort: string | null): T[] {
  return resort ? venues.filter((v) => v.resort.slug === resort) : venues
}

/** Resorts with at least one venue, once each, sorted by heading. */
export function venueResorts(venues: Pick<VenueSummary, "resort">[]): ExperienceResort[] {
  const bySlug = new Map<string, ExperienceResort>()
  for (const v of venues) if (!bySlug.has(v.resort.slug)) bySlug.set(v.resort.slug, v.resort)
  return [...bySlug.values()].sort((a, b) => a.heading.localeCompare(b.heading))
}

/** "Up to 500 Guests", or null when no capacity was entered. */
export function formatCapacity(capacity: number | null): string | null {
  return capacity && capacity > 0 ? `Up to ${capacity.toLocaleString("en-US")} Guests` : null
}

/** "ETB 45,000 for 10 guests", or null when no price was entered. */
export function formatPackagePrice(price: { amount: number; currency: string; unit: string } | null): string | null {
  if (!price || !(price.amount > 0)) return null
  const amount = price.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })
  return `${price.currency} ${amount}${price.unit ? ` ${price.unit}` : ""}`
}

/** Amount ("ETB 45,000") and unit ("for 10 guests") apart, for a large amount over a small unit. */
export function packagePriceParts(
  price: { amount: number; currency: string; unit: string } | null
): { amount: string; unit: string } | null {
  if (!price || !(price.amount > 0)) return null
  return { amount: `${price.currency} ${price.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, unit: price.unit }
}

export const FINAL_RATES_NOTE = "Final rates confirmed with our events team."
