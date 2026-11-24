"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type HeroVideoProps = {
  src: string
  /** True while the slide this video belongs to is showing. */
  active: boolean
}

/**
 * Decorative, muted background loop for the first hero slide. The slide's
 * image stays underneath as poster and LCP element; the video is only
 * attached after the window `load` event, and never with reduced motion or
 * Save-Data, so it costs nothing on the critical path.
 */
export function HeroVideo({ src, active }: HeroVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData
    if (reduceMotion || saveData) return

    const start = () => setEnabled(true)
    if (document.readyState === "complete") {
      const id = window.setTimeout(start, 0)
      return () => window.clearTimeout(id)
    }
    window.addEventListener("load", start, { once: true })
    return () => window.removeEventListener("load", start)
  }, [])

  useEffect(() => {
    const video = ref.current
    if (!enabled || !video) return
    // React doesn't reliably reflect `muted` to the DOM; autoplay needs it.
    video.muted = true
    if (active) video.play().catch(() => {})
    else video.pause()
  }, [enabled, active])

  if (!enabled) return null

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      className={cn(
        "absolute inset-0 size-full object-cover transition-opacity duration-fade ease-soft",
        active && playing ? "opacity-100" : "opacity-0"
      )}
    />
  )
}
