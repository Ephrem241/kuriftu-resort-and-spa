"use client"

import { useEffect, useRef, useState } from "react"

type DeferredMapProps = {
  src: string
  title: string
}

/**
 * The map iframe, mounted only once its box is near the viewport. Chrome's
 * native lazy threshold is large enough on mobile that `loading="lazy"` alone
 * still downloads the provider's ~300 KiB script on page load.
 */
export function DeferredMap({ src, title }: DeferredMapProps) {
  const box = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin: "400px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={box} className="absolute inset-0">
      {show ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full border-0"
        />
      ) : null}
    </div>
  )
}
