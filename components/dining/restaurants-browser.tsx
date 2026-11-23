"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, ArrowUpRight, Clock, MapPin } from "lucide-react"

import { ContactLink } from "@/components/site/contact-link"
import { buttonVariants } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import { SectionHeading } from "@/components/ui/section-heading"
import { diningQuery, diningResortsIn, filterVenues, parseDiningResort, reservationContact } from "@/lib/content/dining"
import type { DiningPage, DiningVenueSummary, SiteSettings } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type BrowserProps = {
  /** Anchor for the hero and "View Our Menu". */
  id: string
  heading: DiningPage["restaurants"]
  venues: DiningVenueSummary[]
  reserve: DiningPage["reserve"]
  settings: Pick<SiteSettings, "reservationPhone" | "reservationEmail">
  /** Sections between the restaurants and the reserve band (menu highlights, events). */
  children?: ReactNode
}

/**
 * "Our Restaurants" and "Reserve a Table", driven by `?resort=` so resort
 * pages can deep-link. The band calls the filtered resort's desk. Render
 * inside <Suspense> with `RestaurantsBrowserFallback`, so the static HTML
 * lists every venue with the site-wide reservation contact.
 */
export function RestaurantsBrowser(props: BrowserProps) {
  const searchParams = useSearchParams()
  const slugs = diningResortsIn(props.venues).map((r) => r.slug)
  const resort = parseDiningResort(searchParams, slugs)

  // The native History API keeps the static page; Next syncs useSearchParams with it.
  const onChange = (next: string | null) =>
    window.history.replaceState(null, "", `${window.location.pathname}${diningQuery(next)}${window.location.hash}`)

  return <DiningView {...props} resort={resort} onChange={onChange} />
}

/** Unfiltered view for the prerendered HTML, before the URL is read. */
export function RestaurantsBrowserFallback(props: BrowserProps) {
  return <DiningView {...props} resort={null} onChange={() => {}} />
}

type ViewProps = BrowserProps & { resort: string | null; onChange: (resort: string | null) => void }

function DiningView({ id, heading, venues, reserve, settings, children, resort, onChange }: ViewProps) {
  const resorts = diningResortsIn(venues)
  const shown = filterVenues(venues, resort)
  const contact = reservationContact(resorts.find((r) => r.slug === resort) ?? null, settings)

  return (
    <>
      <section id={id} aria-labelledby={`${id}-title`} className="container-site scroll-mt-8 pt-4 pb-12 lg:pb-14">
        <SectionHeading id={`${id}-title`} title={heading.title} subtitle={heading.subtitle} />

        <div className="mt-6 flex justify-center">
          <div className="flex w-full flex-col gap-1 md:w-auto">
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
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div aria-live="polite" className="mt-8">
          <p className="sr-only">
            {shown.length} {shown.length === 1 ? "restaurant" : "restaurants"} shown
          </p>
          {shown.length > 0 ? (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((venue) => (
                <li key={venue.id} className="animate-slide-up">
                  <RestaurantCard venue={venue} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-body text-charcoal">No restaurants listed for this destination yet.</p>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="cursor-pointer text-small font-bold text-forest underline-offset-4 hover:underline"
              >
                Show all restaurants
              </button>
            </div>
          )}
        </div>
      </section>

      {children}

      <ReserveBand content={reserve} contact={contact} />
    </>
  )
}

function RestaurantCard({ venue }: { venue: DiningVenueSummary }) {
  const subtitle = venue.cuisine || venue.resort.name
  return (
    <article className="relative aspect-[4/3] overflow-hidden rounded-xl bg-forest shadow-sm">
      <MediaImage image={venue.image} sizes="(min-width: 1280px) 22vw, (min-width: 1025px) 30vw, (min-width: 768px) 46vw, 92vw" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-charcoal/90 via-charcoal/45 to-transparent" />

      {venue.menu ? (
        <a
          href={venue.menu.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View the ${venue.name} menu (PDF, opens in a new tab)`}
          className="eyebrow absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full border border-gold bg-charcoal/55 px-3 py-1.5 text-[0.6875rem] text-ivory backdrop-blur-sm transition-colors duration-hover ease-soft hover:bg-gold hover:text-charcoal"
        >
          View Menu
          <ArrowUpRight aria-hidden="true" strokeWidth={1.5} className="size-3.5" />
        </a>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 p-4">
        <h3 className="flex items-center gap-2 font-heading text-h4 leading-tight text-white">
          <MapPin aria-hidden="true" strokeWidth={1.5} className="size-4 shrink-0" />
          {venue.name}
        </h3>
        <p className="mt-1 text-caption text-ivory/90">{subtitle}</p>
        {venue.hours ? (
          <p className="mt-1 flex items-center gap-1.5 text-caption text-ivory/90">
            <Clock aria-hidden="true" strokeWidth={1.5} className="size-3.5" />
            {venue.hours}
          </p>
        ) : null}
      </div>
    </article>
  )
}

type Contact = ReturnType<typeof reservationContact>

/** "Reserve a Table": copy on forest at left, the reservation call at centre, a photo fading in at right. */
function ReserveBand({ content, contact }: { content: DiningPage["reserve"]; contact: Contact }) {
  const pill = cn(
    buttonVariants({ variant: "accent", size: "pill", shape: "pill" }),
    "group/button text-charcoal hover:bg-ivory hover:text-forest"
  )
  const arrow = (
    <ArrowRight
      aria-hidden="true"
      strokeWidth={1.5}
      className="transition-transform duration-hover ease-soft group-hover/button:translate-x-1"
    />
  )
  const email = contact.email

  return (
    <section aria-labelledby="reserve-title" className="mx-auto w-[97%] max-w-[1440px] py-6 lg:py-4">
      <div className="relative isolate grid overflow-hidden rounded-2xl bg-forest lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
        {content.image ? (
          <div className="relative order-last aspect-[16/9] md:aspect-[21/9] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[42%]">
            <MediaImage image={content.image} sizes="(min-width: 1025px) 42vw, 100vw" />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 hidden w-2/3 bg-linear-to-l from-transparent to-forest lg:block"
            />
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-16 bg-linear-to-t from-transparent to-forest lg:hidden" />
          </div>
        ) : null}

        <div className="relative z-10 px-6 pt-8 pb-4 md:px-10 lg:py-10 lg:pl-[3.5%]">
          <p className="eyebrow flex items-center gap-3 text-gold">
            <span aria-hidden="true" className="h-px w-6 bg-gold" />
            {content.eyebrow}
          </p>
          <h2 id="reserve-title" className="mt-2 text-h2 text-ivory lg:text-[2.5rem] lg:leading-[1.15]">
            {content.title}
          </h2>
          {content.text ? <p className="mt-3 max-w-sm text-body text-ivory/90">{content.text}</p> : null}
        </div>

        <div className="relative z-10 flex flex-col items-start gap-2 px-6 pb-8 md:px-10 lg:py-10 lg:pl-0">
          {contact.phone ? (
            <ContactLink method="phone" href={`tel:${contact.phone.tel}`} source="dining" className={pill}>
              Make a Reservation
              {arrow}
            </ContactLink>
          ) : email ? (
            <ContactLink method="email" href={`mailto:${email}`} source="dining" className={pill}>
              Make a Reservation
              {arrow}
            </ContactLink>
          ) : (
            <Link href="/contact" className={pill}>
              Make a Reservation
              {arrow}
            </Link>
          )}
          {contact.phone ? (
            <p className="text-caption text-ivory/85">
              {contact.phone.display}
              {email ? (
                <>
                  {" · or email "}
                  <ContactLink
                    method="email"
                    href={`mailto:${email}`}
                    source="dining"
                    className="underline underline-offset-2 hover:text-gold"
                  >
                    {email}
                  </ContactLink>
                </>
              ) : null}
              {contact.resortName ? ` · ${contact.resortName}` : null}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
