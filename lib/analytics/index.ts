/**
 * Typed analytics events. They reach PostHog only after the guest consents
 * (see components/site/consent-banner.tsx); otherwise they are dropped.
 * In development without a PostHog key they are logged to the console.
 */
import { analyticsEnabled, captureOrQueue } from "./posthog"

type AnalyticsEvents = {
  availability_search_submitted: {
    destination: string
    nights: number
    guests: number
  }
  booking_handoff_clicked: { source: string; resort?: string; room?: string }
  video_played: { source: string }
  contact_tap: { method: "phone" | "email"; source: string }
  enquiry_submitted: { type: "event" | "meeting" | "spa" | "contact" }
  offer_viewed: { offer: string; source: string }
  offer_dismissed: { offer: string; source: string }
}

export function track<E extends keyof AnalyticsEvents>(
  event: E,
  props: AnalyticsEvents[E]
): void {
  if (typeof window === "undefined") return
  if (captureOrQueue(event, props)) return
  if (process.env.NODE_ENV === "development" && !analyticsEnabled()) {
    console.info("[analytics]", event, props)
  }
}
