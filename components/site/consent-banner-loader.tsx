"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

import { OPEN_CONSENT_EVENT } from "@/lib/analytics/consent"
import { whenIdle } from "@/lib/analytics/posthog"

import type { EarlyOpen } from "./consent-banner"

// The banner renders nothing until it has read storage after mount, so it is
// never in the first paint: keep it out of the first-load JS as well.
const ConsentBanner = dynamic(() => import("./consent-banner").then((m) => m.ConsentBanner), {
  ssr: false,
})

/**
 * Mounts the consent banner once the browser is idle, or at once if the guest
 * presses "Cookie settings" first (that press is handed on, not lost).
 */
export function ConsentBannerLoader() {
  const [ready, setReady] = useState(false)
  const [earlyOpen, setEarlyOpen] = useState<EarlyOpen>()

  useEffect(() => {
    let live = true
    void whenIdle().then(() => {
      if (live) setReady(true)
    })
    // Kept for the page's life: a press while the banner chunk is still loading
    // reaches it through `earlyOpen`; once mounted, the banner ignores the prop
    // and handles the event itself.
    function onEarlyOpen(e: Event) {
      setEarlyOpen({ target: e.target instanceof HTMLElement ? e.target : null })
      setReady(true)
    }
    window.addEventListener(OPEN_CONSENT_EVENT, onEarlyOpen)
    return () => {
      live = false
      window.removeEventListener(OPEN_CONSENT_EVENT, onEarlyOpen)
    }
  }, [])

  return ready ? <ConsentBanner earlyOpen={earlyOpen} /> : null
}
