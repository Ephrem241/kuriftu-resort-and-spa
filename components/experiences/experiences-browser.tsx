"use client"

import type { CSSProperties } from "react"
import { useSearchParams } from "next/navigation"
import { Landmark, LayoutGrid, Mountain, Trees, UsersRound, UtensilsCrossed, Waves, type LucideIcon } from "lucide-react"

import { ExperienceCard } from "@/components/experiences/experience-card"
import { SectionHeading } from "@/components/ui/section-heading"
import {
  categoriesIn,
  categoryLabel,
  filterExperiences,
  filtersQuery,
  parseExperienceFilters,
  resortsIn,
  type ExperienceFilters,
} from "@/lib/content/experiences"
import type { ExperienceCategory, ExperienceSummary } from "@/lib/content/types"
import { cn } from "@/lib/utils"

const ICONS: Record<ExperienceCategory, LucideIcon> = {
  adventure: Mountain,
  culture: Landmark,
  nature: Trees,
  water: Waves,
  family: UsersRound,
  dining: UtensilsCrossed,
}

const NO_FILTERS: ExperienceFilters = { category: null, resort: null }

type BrowserProps = {
  experiences: ExperienceSummary[]
  /** Anchor for the hero's call to action. */
  id: string
}

/**
 * Filters and grid, driven by `?category=` and `?resort=` so resort pages can
 * deep-link and filtered views can be shared. Render inside <Suspense> with
 * `ExperiencesBrowserFallback`, so the static HTML lists every experience.
 */
export function ExperiencesBrowser(props: BrowserProps) {
  const searchParams = useSearchParams()
  const slugs = resortsIn(props.experiences).map((r) => r.slug)
  const filters = parseExperienceFilters(searchParams, slugs)

  // The native History API keeps the static page (no server round trip) and
  // Next syncs useSearchParams with it.
  const onChange = (next: ExperienceFilters) =>
    window.history.replaceState(null, "", `${window.location.pathname}${filtersQuery(next)}${window.location.hash}`)

  return <ExperiencesView {...props} filters={filters} onChange={onChange} />
}

/** Unfiltered view for the prerendered HTML, before the URL is read. */
export function ExperiencesBrowserFallback(props: BrowserProps) {
  return <ExperiencesView {...props} filters={NO_FILTERS} onChange={() => {}} />
}

type ViewProps = BrowserProps & {
  filters: ExperienceFilters
  onChange: (next: ExperienceFilters) => void
}

function ExperiencesView({ experiences, id, filters, onChange }: ViewProps) {
  const categories = categoriesIn(experiences)
  const resorts = resortsIn(experiences)
  const shown = filterExperiences(experiences, filters)
  const tiles: { value: ExperienceCategory | null; label: string; icon: LucideIcon }[] = [
    { value: null, label: "All", icon: LayoutGrid },
    ...categories.map(({ value, label }) => ({ value, label, icon: ICONS[value] })),
  ]
  const filtered = filters.category !== null || filters.resort !== null

  return (
    <>
      <div className="relative z-20 container-site lg:-mt-16">
        <h2 className="sr-only">Filter experiences by type</h2>
        <ul
          style={{ "--tiles": tiles.length } as CSSProperties}
          className="-mx-[5.5%] flex snap-x snap-mandatory scroll-px-[5%] gap-2 overflow-x-auto px-[5.5%] pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-[repeat(var(--tiles),minmax(0,1fr))] md:gap-0 md:overflow-visible md:rounded-xl md:bg-beige md:px-4 md:py-3 md:pb-3 md:shadow-sm"
        >
          {tiles.map(({ value, label, icon: Icon }, i) => {
            const active = filters.category === value
            return (
              <li
                key={value ?? "all"}
                className={cn(
                  "shrink-0 snap-start md:relative",
                  i > 0 && "md:before:absolute md:before:inset-y-3 md:before:left-0 md:before:w-px md:before:bg-line"
                )}
              >
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ ...filters, category: active ? null : value })}
                  className={cn(
                    "flex min-h-11 w-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-beige px-3 py-4 text-small text-charcoal transition-colors duration-hover ease-soft hover:text-forest md:w-full md:bg-transparent",
                    active && "bg-forest text-ivory hover:text-ivory md:bg-forest"
                  )}
                >
                  <Icon aria-hidden="true" strokeWidth={1.5} className={cn("size-7", active ? "text-ivory" : "text-forest")} />
                  {label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <section id={id} aria-labelledby={`${id}-title`} className="container-site scroll-mt-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id={`${id}-title`}
            align="start"
            title={filters.category ? `${categoryLabel(filters.category)} Experiences` : "All Experiences"}
            subtitle="Discover what to do across our destinations"
            className="md:min-w-0 md:flex-1"
          />
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-resort`} className="eyebrow text-charcoal">
              Destination
            </label>
            <select
              id={`${id}-resort`}
              value={filters.resort ?? ""}
              onChange={(e) => onChange({ ...filters, resort: e.target.value || null })}
              className="h-11 w-full cursor-pointer md:min-w-64 rounded-md border border-line bg-ivory px-3 text-small text-charcoal focus-visible:border-forest"
            >
              <option value="">All destinations</option>
              {resorts.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.heading}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div aria-live="polite" className="mt-8 lg:mt-10">
          <p className="sr-only">
            {shown.length} {shown.length === 1 ? "experience" : "experiences"} shown
          </p>
          {shown.length > 0 ? (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shown.map((experience) => (
                <li key={experience.slug} className="flex animate-slide-up">
                  <ExperienceCard experience={experience} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-body text-charcoal">No experiences match these filters.</p>
              {filtered ? (
                <button
                  type="button"
                  onClick={() => onChange(NO_FILTERS)}
                  className="cursor-pointer text-small font-bold text-forest underline-offset-4 hover:underline"
                >
                  Show all experiences
                </button>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
