/**
 * Typed analytics events. A no-op until PostHog is wired up (with consent)
 * in its own step; then this forwards to posthog.capture.
 */
type AnalyticsEvents = {
  availability_search_submitted: {
    destination: string
    nights: number
    guests: number
  }
  booking_handoff_clicked: { source: string; resort?: string }
  video_played: { source: string }
  contact_tap: { method: "phone" | "email"; source: string }
}

type PostHogLike = {
  capture: (event: string, props?: Record<string, unknown>) => void
}

export function track<E extends keyof AnalyticsEvents>(
  event: E,
  props: AnalyticsEvents[E]
): void {
  if (typeof window === "undefined") return
  const ph = (window as unknown as { posthog?: PostHogLike }).posthog
  ph?.capture(event, props)
}
