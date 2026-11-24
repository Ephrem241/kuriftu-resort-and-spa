/**
 * PostHog, loaded only after the guest consents. posthog-js is imported
 * dynamically so guests who decline (or have not chosen) never download it.
 * Browser only; the project key is public by design.
 */
import type { PostHog } from "posthog-js"

import { createEventQueue } from "./queue"

let instance: PostHog | null = null
let loading: Promise<PostHog | null> | null = null
const queue = createEventQueue(20)

export function posthogKey(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ""
}

export function analyticsEnabled(): boolean {
  return posthogKey() !== ""
}

/** Send now if loaded, queue if loading, otherwise report that nothing happened. */
export function captureOrQueue(event: string, props: Record<string, unknown>): boolean {
  if (instance) {
    instance.capture(event, props)
    return true
  }
  if (loading) {
    queue.push({ event, props })
    return true
  }
  return false
}

/** Report an error to PostHog, only when it is loaded (consent given). */
export function captureException(error: unknown): void {
  instance?.captureException(error)
}

/** Resolves when the browser is idle (or after `timeout` ms at most). */
export function whenIdle(timeout = 3000): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => resolve(), { timeout })
    } else if (document.readyState === "complete") {
      setTimeout(resolve, 200)
    } else {
      // No requestIdleCallback (Safari): wait for load, then yield once more.
      window.addEventListener("load", () => setTimeout(resolve, 200), { once: true })
    }
  })
}

/** Idempotent. Call only once the guest has granted consent. */
export function loadPostHog(): Promise<PostHog | null> {
  if (typeof window === "undefined" || !analyticsEnabled()) return Promise.resolve(null)
  if (instance) {
    // Re-granted after a withdrawal on this page.
    if (instance.has_opted_out_capturing()) {
      instance.set_config({ disable_persistence: false })
      instance.opt_in_capturing()
    }
    return Promise.resolve(instance)
  }
  if (loading) return loading

  // `loading` is set now so events queue; the SDK itself waits for idle,
  // keeping it off the page's critical path.
  loading = whenIdle()
    .then(() => import("posthog-js"))
    .then(({ default: posthog }) => {
      posthog.init(posthogKey(), {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
        capture_pageview: "history_change",
        capture_pageleave: true,
        person_profiles: "identified_only",
        persistence: "localStorage+cookie",
        respect_dnt: true,
        // Session replay and autocapture follow the project settings; both
        // run only after consent. Replay masks form inputs by default.
        capture_exceptions: true,
      })
      // A previous withdrawal opts out; a fresh grant opts back in.
      if (posthog.has_opted_out_capturing()) posthog.opt_in_capturing()
      instance = posthog
      for (const e of queue.drain()) posthog.capture(e.event, e.props)
      return posthog
    })
    .catch(() => {
      // Blocked by an ad-blocker or offline: analytics stays off.
      queue.clear()
      loading = null
      return null
    })
  return loading
}

/** Withdraw consent: stop capture and clear PostHog's cookie and storage. */
export function optOut(): void {
  queue.clear()
  if (instance) {
    instance.opt_out_capturing()
    instance.reset()
    // reset() writes fresh ids back; stop persisting so the clear below sticks.
    instance.set_config({ disable_persistence: true })
  }
  clearPostHogStorage()
}

/** Remove PostHog's own keys, also when it was never loaded this page. */
function clearPostHogStorage(): void {
  try {
    const ls = window.localStorage
    for (let i = ls.length - 1; i >= 0; i--) {
      const k = ls.key(i)
      if (k && (k.startsWith("ph_") || k.startsWith("__ph"))) ls.removeItem(k)
    }
  } catch {
    // Storage blocked: nothing to clear.
  }
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0]?.trim()
    if (name?.startsWith("ph_")) {
      document.cookie = `${name}=; Max-Age=0; path=/`
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${location.hostname}`
    }
  }
}
