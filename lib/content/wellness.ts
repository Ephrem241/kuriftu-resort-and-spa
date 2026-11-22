import type { ExperienceResort, SpaCategory, TreatmentGroup, TreatmentSummary } from "./types"

/**
 * The design's five treatment cards, in card order, and the spa categories
 * each covers. Keep in sync with TREATMENT_GROUPS in the Studio wellnessPage
 * schema and the `spaTreatment` category list.
 */
export const TREATMENT_GROUPS: { value: TreatmentGroup; label: string; categories: SpaCategory[] }[] = [
  { value: "massage", label: "Massage Therapy", categories: ["massage"] },
  { value: "facial", label: "Facial Treatments", categories: ["facial"] },
  { value: "body", label: "Body Treatments", categories: ["body", "hammam"] },
  { value: "packages", label: "Wellness Packages", categories: ["package"] },
  { value: "beauty", label: "Beauty Services", categories: ["handsFeet", "hair"] },
]

export function isTreatmentGroup(value: unknown): value is TreatmentGroup {
  return TREATMENT_GROUPS.some((g) => g.value === value)
}

export function groupLabel(group: TreatmentGroup): string {
  return TREATMENT_GROUPS.find((g) => g.value === group)?.label ?? group
}

/** The group a spa category belongs to. */
export function groupOf(category: SpaCategory): TreatmentGroup | null {
  return TREATMENT_GROUPS.find((g) => g.categories.includes(category))?.value ?? null
}

type Filterable = Pick<TreatmentSummary, "category" | "resorts">

export type TreatmentFilters = { group: TreatmentGroup | null; resort: string | null }

/**
 * Filters from the URL (`?category=` holds a group, `?resort=` a resort slug).
 * Only known values are kept; anything else means "all".
 */
export function parseTreatmentFilters(
  params: { get(name: string): string | null },
  resortSlugs: readonly string[]
): TreatmentFilters {
  const group = params.get("category")
  const resort = params.get("resort")
  return {
    group: isTreatmentGroup(group) ? group : null,
    resort: resort && resortSlugs.includes(resort) ? resort : null,
  }
}

/** Query string for the filters ("" when none), resort first as on resort-page links. */
export function treatmentFiltersQuery({ group, resort }: TreatmentFilters): string {
  const params = new URLSearchParams()
  if (resort) params.set("resort", resort)
  if (group) params.set("category", group)
  const query = params.toString()
  return query ? `?${query}` : ""
}

export function filterTreatments<T extends Filterable>(treatments: T[], { group, resort }: TreatmentFilters): T[] {
  return treatments.filter(
    (t) => (!group || groupOf(t.category) === group) && (!resort || t.resorts.some((r) => r.slug === resort))
  )
}

/** Groups that at least one treatment belongs to, in card order. */
export function groupsIn(treatments: Filterable[]): typeof TREATMENT_GROUPS {
  return TREATMENT_GROUPS.filter((g) => treatments.some((t) => g.categories.includes(t.category)))
}

/** Resorts that offer at least one treatment, once each, sorted by heading. */
export function treatmentResorts(treatments: Filterable[]): ExperienceResort[] {
  const bySlug = new Map<string, ExperienceResort>()
  for (const t of treatments) for (const r of t.resorts) if (!bySlug.has(r.slug)) bySlug.set(r.slug, r)
  return [...bySlug.values()].sort((a, b) => a.heading.localeCompare(b.heading))
}

/** Where a treatment card's "Learn More" goes. */
export function treatmentGroupHref(group: TreatmentGroup): string {
  return `/wellness/treatments${treatmentFiltersQuery({ group, resort: null })}`
}

/** The booking form on /wellness, with this treatment preselected. */
export function treatmentRequestHref(slug: string): string {
  return `/wellness?treatment=${encodeURIComponent(slug)}#spa-booking`
}

/** Form options: one group per resort (sorted by heading), treatments by title. */
export function treatmentOptions(
  treatments: Pick<TreatmentSummary, "title" | "slug" | "resorts">[]
): { resort: ExperienceResort; treatments: { slug: string; title: string }[] }[] {
  const byResort = new Map<string, { resort: ExperienceResort; treatments: { slug: string; title: string }[] }>()
  for (const t of treatments) {
    for (const r of t.resorts) {
      const entry = byResort.get(r.slug) ?? { resort: r, treatments: [] }
      entry.treatments.push({ slug: t.slug, title: t.title })
      byResort.set(r.slug, entry)
    }
  }
  return [...byResort.values()]
    .sort((a, b) => a.resort.heading.localeCompare(b.resort.heading))
    .map((e) => ({ ...e, treatments: e.treatments.sort((a, b) => a.title.localeCompare(b.title)) }))
}

/** "From ETB 2,500 per person", or null when no price was entered. */
export function formatTreatmentPrice(price: TreatmentSummary["price"]): string | null {
  if (!price || !(price.amount > 0)) return null
  const amount = price.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })
  return `From ${price.currency} ${amount}${price.unit ? ` ${price.unit}` : ""}`
}

/** Plain text cut at a word boundary, with an ellipsis when shortened. */
export function excerpt(text: string | null | undefined, max = 160): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const space = cut.lastIndexOf(" ")
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s.,;:!?-]+$/, "")}…`
}
