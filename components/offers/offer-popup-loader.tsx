"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

import { whenIdle } from "@/lib/analytics/posthog"

import type { PopupOffer } from "./offer-popup-card"

// The card starts hidden and appears seconds later, so it never needs to be in
// the server HTML or the page's first-load JS.
const OfferPopupCard = dynamic(() => import("./offer-popup-card").then((m) => m.OfferPopupCard), {
  ssr: false,
})

/** Mounts the offer card once the browser is idle. */
export function OfferPopupLoader(props: { offer: PopupOffer; consentRequired: boolean }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let live = true
    void whenIdle().then(() => {
      if (live) setReady(true)
    })
    return () => {
      live = false
    }
  }, [])

  return ready ? <OfferPopupCard {...props} /> : null
}
