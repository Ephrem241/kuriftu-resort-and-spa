"use client"

import { useSyncExternalStore } from "react"

import { todayInResortZone } from "@/lib/booking/dates"

const noopSubscribe = () => () => {}

/** Today in Africa/Addis_Ababa, read on the client only (never at build time); "" while prerendering. */
export function useResortToday() {
  return useSyncExternalStore(noopSubscribe, () => todayInResortZone(), () => "")
}
