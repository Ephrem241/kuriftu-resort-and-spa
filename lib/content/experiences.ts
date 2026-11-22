import { offerAction, type OfferAction } from "./offers"
import type { ExperienceCategory, ExperiencePage, ExperienceResort, ExperienceSummary } from "./types"

/** Category filters on /experience, in strip order. Keep in sync with the Studio `experience` schema. */
export const EXPERIENCE_CATEGORIES: { value: ExperienceCategory; label: string }[] = [
  { value: "adventure", label: "Adventure" },
  { value: "culture", label: "Culture" },
  { value: "nature", label: "Nature" },
  { value: "water", label: "Water" },
  { value: "family", label: "Family" },
  { value: "dining", label: "Dining" },
]

export function isExperienceCategory(value: unknown): value is ExperienceCategory {
  return EXPERIENCE_CATEGORIES.some((c) => c.value === value)
}

export function categoryLabel(category: ExperienceCategory): string {
  return EXPERIENCE_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

export type ExperienceFilters = { category: ExperienceCategory | null; resort: string | null }

type Filterable = Pick<ExperienceSummary, "category" | "resorts">

/**
 * Filters from the URL (`?category=` and `?resort=`). Only known values are
 * kept; anything else means "all".
 */
export function parseExperienceFilters(
  params: { get(name: string): string | null },
  resortSlugs: readonly string[]
): ExperienceFilters {
  const category = params.get("category")
  const resort = params.get("resort")
  return {
    category: isExperienceCategory(category) ? category : null,
    resort: resort && resortSlugs.includes(resort) ? resort : null,
  }
}

/** Query string for the filters ("" when none), resort first as on resort-page links. */
export function filtersQuery({ category, resort }: ExperienceFilters): string {
  const params = new URLSearchParams()
  if (resort) params.set("resort", resort)
  if (category) params.set("category", category)
  const query = params.toString()
  return query ? `?${query}` : ""
}

export function filterExperiences<T extends Filterable>(experiences: T[], { category, resort }: ExperienceFilters): T[] {
  return experiences.filter(
    (e) => (!category || e.category === category) && (!resort || e.resorts.some((r) => r.slug === resort))
  )
}

/** Categories that at least one experience uses, in strip order. */
export function categoriesIn(experiences: Filterable[]): typeof EXPERIENCE_CATEGORIES {
  return EXPERIENCE_CATEGORIES.filter((c) => experiences.some((e) => e.category === c.value))
}

/** Resorts that offer at least one experience, once each, sorted by heading. */
export function resortsIn(experiences: Filterable[]): ExperienceResort[] {
  const bySlug = new Map<string, ExperienceResort>()
  for (const e of experiences) for (const r of e.resorts) if (!bySlug.has(r.slug)) bySlug.set(r.slug, r)
  return [...bySlug.values()].sort((a, b) => a.heading.localeCompare(b.heading))
}

/**
 * Book or contact for one experience. "Enquire" always contacts (the one
 * resort, or the site reservations); "Book" follows the offer rule, so a
 * resort that can't take stays falls back to contact.
 */
export function experienceAction({ action, resorts }: Pick<ExperiencePage, "action" | "resorts">): OfferAction {
  if (action === "enquire") return { kind: "contact", resort: resorts.length === 1 ? resorts[0] : null }
  return offerAction(resorts)
}
