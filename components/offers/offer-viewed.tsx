"use client"

import { useEffect } from "react"

import { track } from "@/lib/analytics"

/** Records one `offer_viewed` when an offer page mounts. Renders nothing. */
export function OfferViewed({ offer, source }: { offer: string; source: string }) {
  useEffect(() => {
    track("offer_viewed", { offer, source })
  }, [offer, source])
  return null
}
