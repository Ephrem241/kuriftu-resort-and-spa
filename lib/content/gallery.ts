import type { GalleryPhoto } from "./types"

/** `?resort=` from the URL, kept only when it names a resort with photos; otherwise null ("all"). */
export function parseGalleryResort(params: { get(name: string): string | null }, slugs: readonly string[]): string | null {
  const resort = params.get("resort")
  return resort && slugs.includes(resort) ? resort : null
}

/** Query string for the filter ("" for all). */
export function galleryQuery(resort: string | null): string {
  return resort ? `?${new URLSearchParams({ resort })}` : ""
}

export function filterPhotos<T extends Pick<GalleryPhoto, "resortSlug">>(photos: T[], resort: string | null): T[] {
  return resort ? photos.filter((p) => p.resortSlug === resort) : photos
}

/** Index after a step of +1/-1, wrapping at both ends. */
export function stepIndex(index: number, step: 1 | -1, count: number): number {
  if (count <= 0) return 0
  return (index + step + count) % count
}
