/**
 * TravelBook booking engine configuration.
 *
 * `baseUrl` is the group "Reserve" link from env (see .env.example). The
 * engine host, `id_stile` and `lingua_int` are read from it, so nothing about
 * Kuriftu's account is hardcoded here.
 *
 * The page names and query params below were verified against the live engine
 * on 2026-11-24 (its own search scripts plus live requests); see
 * prompts/21-booking-handoff.md. A change on TravelBook's side is one edit
 * here plus the matching tests in handoff.test.ts.
 */
export type BookingConfig = {
  baseUrl: string
}

export const bookingConfig: BookingConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BOOKING_ENGINE_URL ?? "",
}

/** Engine pages, relative to the group URL's directory (`/premium/`). */
export const ENGINE_PAGES = {
  /** One property's start page: its availability calendar. */
  property: "index.html",
  /** One property's room results for a given stay. */
  propertyStay: "index2.html",
} as const

/** Params copied from the group URL onto property links. */
export const SHARED_PARAMS = ["id_stile", "lingua_int"] as const
