import posthog from "posthog-js"

/** Typed analytics events sent from client-side interaction handlers. */
type AnalyticsEvents = {
  availability_search_submitted: {
    destination: string
    nights: number
    guests: number
  }
  booking_handoff_clicked: { source: string; resort?: string; room?: string }
  video_played: { source: string }
  contact_tap: { method: "phone" | "email"; source: string }
}

export function track<E extends keyof AnalyticsEvents>(
  event: E,
  props: AnalyticsEvents[E]
): void {
  posthog.capture(event, props)
}
