import type { ContentImage } from "./types"

/** Open Graph crop (1200×630) of a Sanity CDN image, for page metadata. */
export function ogImage(image: ContentImage) {
  if (!image.src) return undefined
  const url = new URL(image.src)
  url.searchParams.set("w", "1200")
  url.searchParams.set("h", "630")
  url.searchParams.set("fit", "crop")
  return [{ url: url.toString(), width: 1200, height: 630, alt: image.alt }]
}
