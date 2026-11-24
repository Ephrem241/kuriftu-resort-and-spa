import Image from "next/image"
import { ImageIcon } from "lucide-react"

import type { ContentImage } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type MediaImageProps = {
  image: ContentImage
  /** Responsive sizes hint for next/image. */
  sizes: string
  /**
   * "high" for the page's LCP (hero) image: fetched eagerly at high priority.
   * Replaces next/image's `priority`, deprecated in Next 16.
   */
  fetchPriority?: "high"
  className?: string
}

/**
 * Fills its positioned parent with a content image. Until real photography
 * exists in Sanity, renders an on-brand placeholder (never stock imagery).
 */
export function MediaImage({ image, sizes, fetchPriority, className }: MediaImageProps) {
  if (image.src) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        fetchPriority={fetchPriority}
        loading={fetchPriority === "high" ? "eager" : undefined}
        placeholder={image.lqip ? "blur" : "empty"}
        blurDataURL={image.lqip}
        className={cn("object-cover", className)}
        style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={image.alt}
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-linear-to-br from-beige via-beige to-sage/40",
        className
      )}
    >
      <ImageIcon aria-hidden="true" strokeWidth={1} className="size-8 text-sage/60" />
    </div>
  )
}
