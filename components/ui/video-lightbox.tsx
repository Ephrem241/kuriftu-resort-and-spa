"use client"

import { cloneElement, useRef, useState, type ComponentProps, type ReactElement } from "react"
import { X } from "lucide-react"

import { track } from "@/lib/analytics"

import { Modal } from "./modal"

type VideoLightboxProps = {
  /** Already-validated embed URL from toEmbedUrl(). */
  embedUrl: string
  title: string
  /** The trigger element: a `<button>`; it gets the click handler and ARIA state. */
  trigger: ReactElement<ComponentProps<"button">>
  source: string
}

/** Provider-embedded video (YouTube/Vimeo) in an accessible modal. Closing unmounts the iframe. */
export function VideoLightbox({ embedUrl, title, trigger, source }: VideoLightboxProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      {cloneElement(trigger, {
        ref: triggerRef,
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        onClick: () => {
          setOpen(true)
          track("video_played", { source })
        },
      } as ComponentProps<"button">)}
      <Modal
        open={open}
        onOpenChange={setOpen}
        label={title}
        finalFocus={() => triggerRef.current}
        backdropClassName="fixed inset-0 z-50 bg-charcoal/80 transition-opacity duration-fade data-ending-style:opacity-0 data-starting-style:opacity-0"
        popupClassName="fixed top-1/2 left-1/2 z-50 w-[min(90vw,1100px)] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-fade data-ending-style:opacity-0 data-starting-style:opacity-0"
      >
        <div className="relative aspect-video overflow-hidden rounded-md bg-black">
          <iframe
            src={embedUrl}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        </div>
        <button
          type="button"
          aria-label="Close video"
          onClick={() => setOpen(false)}
          className="absolute -top-12 right-0 flex size-10 cursor-pointer items-center justify-center rounded-full text-ivory hover:text-gold"
        >
          <X aria-hidden="true" strokeWidth={1.5} className="size-6" />
        </button>
      </Modal>
    </>
  )
}
