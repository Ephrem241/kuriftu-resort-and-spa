import type { DiningResort, DiningVenueSummary, SiteSettings } from "./types"

type Filterable = Pick<DiningVenueSummary, "resort">

/**
 * The resort a /dining view is filtered to (`?resort=`). Only a resort with
 * a venue counts; anything else means "all".
 */
export function parseDiningResort(params: { get(name: string): string | null }, resortSlugs: readonly string[]): string | null {
  const resort = params.get("resort")
  return resort && resortSlugs.includes(resort) ? resort : null
}

/** Query string for the filter ("" when none). */
export function diningQuery(resort: string | null): string {
  return resort ? `?${new URLSearchParams({ resort })}` : ""
}

export function filterVenues<T extends Filterable>(venues: T[], resort: string | null): T[] {
  return resort ? venues.filter((v) => v.resort.slug === resort) : venues
}

/** Resorts with at least one venue, once each, sorted by name. */
export function diningResortsIn(venues: Filterable[]): DiningResort[] {
  const bySlug = new Map<string, DiningResort>()
  for (const v of venues) if (!bySlug.has(v.resort.slug)) bySlug.set(v.resort.slug, v.resort)
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export type ReservationContact = {
  phone: { display: string; tel: string } | null
  email: string | null
  /** The resort whose desk this is; null for the site-wide reservations. */
  resortName: string | null
}

/**
 * Who "Make a Reservation" reaches: the filtered resort's reservation desk
 * when it has a phone, otherwise the site-wide reservations. A missing email
 * falls back to the site-wide one either way.
 */
export function reservationContact(
  resort: DiningResort | null,
  settings: Pick<SiteSettings, "reservationPhone" | "reservationEmail">
): ReservationContact {
  if (resort?.phone) {
    return { phone: resort.phone, email: resort.email ?? settings.reservationEmail, resortName: resort.name }
  }
  return { phone: settings.reservationPhone, email: settings.reservationEmail, resortName: null }
}
