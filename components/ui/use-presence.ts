"use client"

import { useEffect, useRef, useState } from "react"

type Phase = "starting" | "open" | "ending"

/** Longest we wait for an exit transition before unmounting anyway. */
const EXIT_TIMEOUT_MS = 1000

/**
 * Keeps an element mounted through its exit transition and sets the same
 * `data-starting-style` / `data-ending-style` attributes Base UI used, so the
 * existing Tailwind classes (`data-starting-style:opacity-0` …) work as-is.
 * Reduced motion shortens every transition, so exit is then near-instant.
 */
export function usePresence<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T>(null)
  const [mounted, setMounted] = useState(open)
  const [phase, setPhase] = useState<Phase>("open")
  const [prevOpen, setPrevOpen] = useState(open)

  // Adjust state while rendering (not in an effect) when `open` flips.
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setMounted(true)
      setPhase("starting")
    } else {
      setPhase("ending")
    }
  }

  useEffect(() => {
    if (!mounted) return
    if (phase === "starting") {
      // Two frames: the start style must be painted before it is removed.
      let second = 0
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setPhase("open"))
      })
      return () => {
        cancelAnimationFrame(first)
        cancelAnimationFrame(second)
      }
    }
    if (phase === "ending") {
      let live = true
      // getAnimations() flushes styles, so the exit transition already exists.
      const running = ref.current?.getAnimations({ subtree: true }) ?? []
      const finished = Promise.all(running.map((a) => a.finished.catch(() => undefined)))
      const timeout = new Promise((resolve) => setTimeout(resolve, EXIT_TIMEOUT_MS))
      void Promise.race([finished, timeout]).then(() => {
        if (live) setMounted(false)
      })
      return () => {
        live = false
      }
    }
  }, [mounted, phase])

  const presenceProps = {
    "data-starting-style": phase === "starting" ? "" : undefined,
    "data-ending-style": phase === "ending" ? "" : undefined,
  }

  return { ref, mounted, presenceProps }
}
