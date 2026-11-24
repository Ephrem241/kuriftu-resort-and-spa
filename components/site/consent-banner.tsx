"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  browserStorage,
  CONSENT_DECIDED_EVENT,
  OPEN_CONSENT_EVENT,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from "@/lib/analytics/consent"
import { loadPostHog, optOut } from "@/lib/analytics/posthog"

/** A "Cookie settings" press that happened before this module loaded. */
export type EarlyOpen = { target: HTMLElement | null }

/**
 * Non-blocking consent panel. Nothing is tracked until Accept; a previous
 * grant loads PostHog on mount. Rendered only when a PostHog key is set,
 * and loaded after idle by ConsentBannerLoader.
 */
export function ConsentBanner({ earlyOpen }: { earlyOpen?: EarlyOpen }) {
  const [open, setOpen] = useState(false)
  const [reopened, setReopened] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const earlyOpenRef = useRef(earlyOpen)

  useEffect(() => {
    function reopen(target: EventTarget | null) {
      returnFocusRef.current = (target instanceof HTMLElement ? target : null) ??
        (document.activeElement as HTMLElement | null)
      setReopened(true)
      setOpen(true)
    }

    const state = readConsent(browserStorage())
    if (state === "granted") void loadPostHog()
    // Reading storage only works after mount, so this cannot be initial state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (state === "undecided") setOpen(true)
    if (earlyOpenRef.current) reopen(earlyOpenRef.current.target)

    const onOpen = (e: Event) => reopen(e.target)
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, onOpen)
  }, [])

  useEffect(() => {
    if (open && reopened) panelRef.current?.focus()
  }, [open, reopened])

  function choose(choice: ConsentChoice) {
    writeConsent(browserStorage(), choice)
    if (choice === "granted") void loadPostHog()
    else optOut()
    setOpen(false)
    if (reopened) returnFocusRef.current?.focus()
    setReopened(false)
    window.dispatchEvent(new Event(CONSENT_DECIDED_EVENT))
  }

  if (!open) return null

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      aria-labelledby="consent-title"
      className="fixed inset-x-4 bottom-4 z-40 animate-fade-in rounded-md border border-border bg-ivory p-6 shadow-lg focus-visible:outline-offset-0 md:inset-x-auto md:bottom-6 md:left-6 md:max-w-[480px]"
    >
      <h2 id="consent-title" className="text-h4">
        Your privacy
      </h2>
      <p className="mt-2 text-small text-charcoal">
        We use analytics cookies and session recordings to understand how guests use our site and
        improve it. Nothing is tracked or recorded unless you accept.
      </p>
      <div className="mt-4 flex gap-3">
        <Button size="sm" onClick={() => choose("granted")}>
          Accept
        </Button>
        <Button variant="outline" size="sm" onClick={() => choose("denied")}>
          Decline
        </Button>
      </div>
    </section>
  )
}
