"use client"

import type { ReactElement } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { track } from "@/lib/analytics"

type VideoLightboxProps = {
  /** Already-validated embed URL from toEmbedUrl(). */
  embedUrl: string
  title: string
  /** The trigger element (rendered via base-ui's render prop). */
  trigger: ReactElement
  source: string
}

/** Provider-embedded video (YouTube/Vimeo) in an accessible modal. */
export function VideoLightbox({ embedUrl, title, trigger, source }: VideoLightboxProps) {
  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (open) track("video_played", { source })
      }}
    >
      <Dialog.Trigger render={trigger} />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-charcoal/80 transition-opacity duration-fade data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(90vw,1100px)] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-fade data-ending-style:opacity-0 data-starting-style:opacity-0">
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <div className="relative aspect-video overflow-hidden rounded-md bg-black">
            <iframe
              src={embedUrl}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          </div>
          <Dialog.Close
            aria-label="Close video"
            className="absolute -top-12 right-0 flex size-10 cursor-pointer items-center justify-center rounded-full text-ivory hover:text-gold"
          >
            <X aria-hidden="true" strokeWidth={1.5} className="size-6" />
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
