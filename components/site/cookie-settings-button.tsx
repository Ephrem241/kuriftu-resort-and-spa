"use client"

import { OPEN_CONSENT_EVENT } from "@/lib/analytics/consent"

/** Reopens the consent banner so a guest can change or withdraw consent. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => e.currentTarget.dispatchEvent(new Event(OPEN_CONSENT_EVENT, { bubbles: true }))}
    >
      Cookie settings
    </button>
  )
}
