import type { ImageLoaderProps } from "next/image"

const SANITY_IMAGE_HOST = "cdn.sanity.io"
const DEFAULT_QUALITY = 75

/**
 * next/image loader (registered in next.config.ts). Sanity's image CDN
 * resizes, crops and converts on its own, so images are requested from it
 * directly rather than through Vercel's optimiser. Only `w` and `q` change;
 * the crop (`rect`), `fit` and `auto=format` set by `toContentImage` are kept.
 * Any other src is returned unchanged.
 */
export default function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  let url: URL
  try {
    url = new URL(src)
  } catch {
    return src
  }
  if (url.protocol !== "https:" || url.hostname !== SANITY_IMAGE_HOST) return src

  url.searchParams.set("w", String(width))
  url.searchParams.set("q", String(quality ?? DEFAULT_QUALITY))
  return url.toString()
}
