/**
 * TravelBook booking engine configuration. The base URL (including the
 * Kuriftu group ids) lives in env; see .env.example.
 *
 * The query parameter names TravelBook accepts for property, dates, and
 * guests have NOT been verified. Each stays `null` until confirmed with
 * TravelBook, and a `null` param is never sent. Confirming one is a single
 * edit here plus the matching test in handoff.test.ts.
 */
export type BookingParamMap = {
  property: string | null
  checkIn: string | null
  checkOut: string | null
  adults: string | null
  children: string | null
}

export type BookingConfig = {
  baseUrl: string
  paramMap: BookingParamMap
}

export const UNVERIFIED_PARAM_MAP: BookingParamMap = {
  property: null,
  checkIn: null,
  checkOut: null,
  adults: null,
  children: null,
}

export const bookingConfig: BookingConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BOOKING_ENGINE_URL ?? "",
  paramMap: UNVERIFIED_PARAM_MAP,
}
