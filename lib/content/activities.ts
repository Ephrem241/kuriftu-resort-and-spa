import type { ContentImage, ExperienceCategory, ResortPage } from "./types"

export type ActivityTile = {
  key: string
  label: string
  image: ContentImage
  href: string
}

/** Fixed tile order and labels (UI copy from the resort page design). */
const CATEGORY_TILES: { category: ExperienceCategory; label: string }[] = [
  { category: "water", label: "Water Activities" },
  { category: "adventure", label: "Adventure" },
  { category: "nature", label: "Nature Walks" },
  { category: "culture", label: "Culture & Heritage" },
  { category: "family", label: "Family Activities" },
]

/**
 * "Activities & Experiences" tiles for one resort: one per experience
 * category it offers, then spa and dining when it has them. Only content
 * that belongs to the resort produces a tile.
 */
export function activityTiles(
  resort: Pick<ResortPage, "slug" | "experiences" | "spaImage" | "diningImage">
): ActivityTile[] {
  const slug = encodeURIComponent(resort.slug)
  const firstImage = (category: ExperienceCategory) =>
    resort.experiences.find((e) => e.category === category)?.image

  const tiles: ActivityTile[] = CATEGORY_TILES.flatMap(({ category, label }) => {
    const image = firstImage(category)
    return image
      ? [{ key: category, label, image, href: `/experience?resort=${slug}&category=${category}` }]
      : []
  })

  if (resort.spaImage) {
    tiles.push({ key: "spa", label: "Spa Treatments", image: resort.spaImage, href: `/wellness?resort=${slug}` })
  }

  const diningImage = resort.diningImage ?? firstImage("dining")
  if (diningImage) {
    tiles.push({ key: "dining", label: "Dining Experience", image: diningImage, href: `/dining?resort=${slug}` })
  }

  return tiles
}
