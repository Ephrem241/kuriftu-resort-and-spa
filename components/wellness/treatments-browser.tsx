"use client"

import type { CSSProperties } from "react"
import { useSearchParams } from "next/navigation"
import { Droplets, Gift, Hand, LayoutGrid, Scissors, Sparkles, type LucideIcon } from "lucide-react"

import { SectionHeading } from "@/components/ui/section-heading"
import type { TreatmentGroup, TreatmentSummary } from "@/lib/content/types"
import {
  filterTreatments,
  groupLabel,
  groupsIn,
  parseTreatmentFilters,
  treatmentFiltersQuery,
  treatmentResorts,
  type TreatmentFilters,
} from "@/lib/content/wellness"
import { cn } from "@/lib/utils"

import { TreatmentCard } from "./treatment-card"

const ICONS: Record<TreatmentGroup, LucideIcon> = {
  massage: Hand,
  facial: Sparkles,
  body: Droplets,
  packages: Gift,
  beauty: Scissors,
}

const NO_FILTERS: TreatmentFilters = { group: null, resort: null }

type BrowserProps = { treatments: TreatmentSummary[]; id: string }

/**
 * Group strip, destination select and grid, driven by `?category=` and
 * `?resort=` so the wellness cards and resort pages can deep-link. Render
 * inside <Suspense> with `TreatmentsBrowserFallback`, so the static HTML
 * lists every treatment.
 */
export function TreatmentsBrowser(props: BrowserProps) {
  const searchParams = useSearchParams()
  const slugs = treatmentResorts(props.treatments).map((r) => r.slug)
  const filters = parseTreatmentFilters(searchParams, slugs)

  // The native History API keeps the static page (no server round trip) and
  // Next syncs useSearchParams with it.
  const onChange = (next: TreatmentFilters) =>
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${treatmentFiltersQuery(next)}${window.location.hash}`
    )

  return <TreatmentsView {...props} filters={filters} onChange={onChange} />
}

/** Unfiltered view for the prerendered HTML, before the URL is read. */
export function TreatmentsBrowserFallback(props: BrowserProps) {
  return <TreatmentsView {...props} filters={NO_FILTERS} onChange={() => {}} />
}

type ViewProps = BrowserProps & { filters: TreatmentFilters; onChange: (next: TreatmentFilters) => void }

function TreatmentsView({ treatments, id, filters, onChange }: ViewProps) {
  const resorts = treatmentResorts(treatments)
  const shown = filterTreatments(treatments, filters)
  const tiles: { value: TreatmentGroup | null; label: string; icon: LucideIcon }[] = [
    { value: null, label: "All", icon: LayoutGrid },
    ...groupsIn(treatments).map(({ value, label }) => ({ value, label, icon: ICONS[value] })),
  ]
  const filtered = filters.group !== null || filters.resort !== null

  return (
    <>
      <div className="container-site">
        <h2 className="sr-only">Filter treatments by type</h2>
        <ul
          style={{ "--tiles": tiles.length } as CSSProperties}
          className="-mx-[5.5%] flex snap-x snap-mandatory scroll-px-[5%] gap-2 overflow-x-auto px-[5.5%] pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-[repeat(var(--tiles),minmax(0,1fr))] md:gap-0 md:overflow-visible md:rounded-xl md:bg-beige md:px-4 md:py-3 md:pb-3 md:shadow-sm"
        >
          {tiles.map(({ value, label, icon: Icon }, i) => {
            const active = filters.group === value
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
                  onClick={() => onChange({ ...filters, group: active ? null : value })}
                  className={cn(
                    "flex min-h-11 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-beige px-3 py-4 text-center text-small text-charcoal transition-colors duration-hover ease-soft hover:text-forest md:w-full md:bg-transparent",
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
            title={filters.group ? groupLabel(filters.group) : "All Treatments"}
            subtitle="Request a treatment and our spa team will call you to confirm"
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
              className="h-11 w-full cursor-pointer rounded-md border border-line bg-ivory px-3 text-small text-charcoal focus-visible:border-forest md:min-w-64"
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
            {shown.length} {shown.length === 1 ? "treatment" : "treatments"} shown
          </p>
          {shown.length > 0 ? (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shown.map((treatment) => (
                <li key={treatment.slug} className="flex animate-slide-up">
                  <TreatmentCard treatment={treatment} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-body text-charcoal">No treatments match these filters.</p>
              {filtered ? (
                <button
                  type="button"
                  onClick={() => onChange(NO_FILTERS)}
                  className="cursor-pointer text-small font-bold text-forest underline-offset-4 hover:underline"
                >
                  Show all treatments
                </button>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
