"use client"

import { useSearchParams } from "next/navigation"
import { MapPin, Users } from "lucide-react"

import { ContentCard, type CardMeta } from "@/components/ui/content-card"
import { MediaImage } from "@/components/ui/media-image"
import { SectionHeading } from "@/components/ui/section-heading"
import {
  eventEnquiryHref,
  filterVenues,
  formatCapacity,
  parseVenueResort,
  venueResorts,
  venuesHref,
} from "@/lib/content/events"
import type { VenueSummary } from "@/lib/content/types"

type BrowserProps = { venues: VenueSummary[]; id: string }

/**
 * Destination select and venue grid, driven by `?resort=` so the events page
 * can deep-link. Render inside <Suspense> with `VenuesBrowserFallback`, so the
 * static HTML lists every venue.
 */
export function VenuesBrowser(props: BrowserProps) {
  const searchParams = useSearchParams()
  const resort = parseVenueResort(searchParams, venueResorts(props.venues).map((r) => r.slug))

  // The native History API keeps the static page; Next syncs useSearchParams with it.
  const onChange = (next: string | null) =>
    window.history.replaceState(null, "", `${venuesHref(next)}${window.location.hash}`)

  return <VenuesView {...props} resort={resort} onChange={onChange} />
}

/** Unfiltered view for the prerendered HTML, before the URL is read. */
export function VenuesBrowserFallback(props: BrowserProps) {
  return <VenuesView {...props} resort={null} onChange={() => {}} />
}

type ViewProps = BrowserProps & { resort: string | null; onChange: (next: string | null) => void }

function VenuesView({ venues, id, resort, onChange }: ViewProps) {
  const resorts = venueResorts(venues)
  const shown = filterVenues(venues, resort)
  const heading = resorts.find((r) => r.slug === resort)?.heading

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="container-site scroll-mt-8 pb-16 lg:pb-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id={`${id}-title`}
          align="start"
          title={heading ? `Venues at ${heading}` : "All Venues"}
          subtitle="Enquire and our events team will call you to plan the details"
          className="md:min-w-0 md:flex-1"
        />
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-resort`} className="eyebrow text-charcoal">
            Destination
          </label>
          <select
            id={`${id}-resort`}
            value={resort ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
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
          {shown.length} {shown.length === 1 ? "venue" : "venues"} shown
        </p>
        {shown.length > 0 ? (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((venue) => (
              <li key={venue.id} className="flex animate-slide-up">
                <VenueCard venue={venue} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-body text-charcoal">No venues match this destination.</p>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="cursor-pointer text-small font-bold text-forest underline-offset-4 hover:underline"
            >
              Show all venues
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

/** One venue: photo, name, excerpt, where, and capacity when entered. */
function VenueCard({ venue }: { venue: VenueSummary }) {
  const meta: CardMeta[] = [{ icon: MapPin, label: venue.resort.heading }]
  const capacity = formatCapacity(venue.capacity)
  if (capacity) meta.push({ icon: Users, label: capacity })

  return (
    <ContentCard
      className="w-full"
      image={<MediaImage image={venue.image} sizes="(min-width: 1025px) 30vw, (min-width: 768px) 45vw, 90vw" />}
      title={venue.name}
      subtitle={venue.excerpt || undefined}
      subtitleClassName="line-clamp-3"
      meta={meta}
      href={eventEnquiryHref({ resort: venue.resort.slug })}
      action="Enquire"
    />
  )
}
