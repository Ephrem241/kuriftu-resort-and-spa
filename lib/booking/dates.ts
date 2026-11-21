/**
 * Plain calendar dates (YYYY-MM-DD) in the resorts' time zone.
 * Dates are compared as strings or UTC midnights so they never shift for
 * guests browsing from another time zone.
 */

export const RESORT_TIME_ZONE = "Africa/Addis_Ababa"

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Today's date in Addis Ababa as YYYY-MM-DD. */
export function todayInResortZone(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RESORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

/** Adds whole days to a YYYY-MM-DD date. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Number of nights between two YYYY-MM-DD dates. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = Date.parse(`${checkIn}T00:00:00Z`)
  const b = Date.parse(`${checkOut}T00:00:00Z`)
  return Math.round((b - a) / 86_400_000)
}
