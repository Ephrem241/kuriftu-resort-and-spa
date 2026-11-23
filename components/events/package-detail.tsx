import Link from "next/link"
import { ArrowLeft, CircleCheck, MapPin, Tag, Users } from "lucide-react"

import { ButtonLink, buttonVariants } from "@/components/ui/button"
import { ContentCard } from "@/components/ui/content-card"
import { MediaImage } from "@/components/ui/media-image"
import { PortableText } from "@/components/ui/portable-text"
import { SectionHeading } from "@/components/ui/section-heading"
import {
  FINAL_RATES_NOTE,
  eventEnquiryHref,
  formatCapacity,
  formatPackagePrice,
  packageKindLabel,
  venuesHref,
} from "@/lib/content/events"
import { pathForDocument } from "@/lib/content/routes"
import type { EventPackagePage } from "@/lib/content/types"
import { cn } from "@/lib/utils"

/** One event package: photos, where, what's included, venues, any editor price, and the enquiry action. */
export function PackageDetail({ pkg }: { pkg: EventPackagePage }) {
  const [hero, ...more] = pkg.images
  const price = formatPackagePrice(pkg.price)
  const kind = packageKindLabel(pkg.kind)

  return (
    <>
      <article aria-labelledby="package-title" className="container-site pt-32 pb-16 lg:pt-36 lg:pb-24">
        <Link
          href="/event"
          className={cn(
            buttonVariants({ variant: "secondary", shape: "pill" }),
            "group/back h-9 gap-2 border-forest/60 bg-ivory/70 px-5 font-bold"
          )}
        >
          <ArrowLeft
            aria-hidden="true"
            strokeWidth={1.5}
            className="size-4 transition-transform duration-hover ease-soft group-hover/back:-translate-x-1"
          />
          Celebrations &amp; Events
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
          <div className="order-first flex flex-col gap-3 lg:sticky lg:top-28 lg:order-last">
            <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-beige">
              <MediaImage image={hero} sizes="(min-width: 1025px) 50vw, 100vw" priority className="animate-fade-in" />
            </div>
            {more.length > 0 ? (
              <ul aria-label="More photos" className="grid grid-cols-3 gap-3">
                {more.slice(0, 3).map((image, i) => (
                  <li key={i} className="relative aspect-4/3 overflow-hidden rounded-lg bg-beige">
                    <MediaImage image={image} sizes="(min-width: 1025px) 16vw, 30vw" />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div>
            <p className="eyebrow text-forest">{kind} Package</p>
            <h1 id="package-title" className="mt-3 text-[2.5rem] leading-[1.1] md:text-h1">
              {pkg.title}
            </h1>

            {pkg.resorts.length > 0 ? (
              <p className="mt-6 flex items-start gap-2 text-small text-charcoal">
                <MapPin aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-forest" />
                <span>
                  <span className="sr-only">Offered at </span>
                  {pkg.resorts.map((r, i) => {
                    const href = pathForDocument({ _type: "resort", slug: r.slug })
                    return (
                      <span key={r.slug}>
                        {i > 0 ? ", " : null}
                        {href ? (
                          <Link href={href} className="text-forest underline-offset-4 hover:underline">
                            {r.heading}
                          </Link>
                        ) : (
                          r.heading
                        )}
                      </span>
                    )
                  })}
                </span>
              </p>
            ) : null}

            {pkg.description.length > 0 ? (
              <PortableText value={pkg.description} className="mt-8 text-body text-charcoal" />
            ) : null}

            {pkg.inclusions.length > 0 ? (
              <section aria-labelledby="package-inclusions-title" className="mt-10">
                <h2 id="package-inclusions-title" className="text-h4">
                  What&apos;s Included
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {pkg.inclusions.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-small text-charcoal">
                      <CircleCheck aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-5 shrink-0 fill-forest text-ivory" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {pkg.venues.length > 0 ? (
              <section aria-labelledby="package-venues-title" className="mt-10">
                <h2 id="package-venues-title" className="text-h4">
                  Venues
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {pkg.venues.map((v) => {
                    const capacity = formatCapacity(v.capacity)
                    return (
                      <li key={v.id} className="rounded-lg border border-line bg-card p-4">
                        <p className="font-bold text-small text-charcoal">{v.name}</p>
                        {v.resort ? (
                          <Link
                            href={venuesHref(v.resort.slug)}
                            className="mt-1 flex items-center gap-2 text-caption text-forest underline-offset-4 hover:underline"
                          >
                            <MapPin aria-hidden="true" strokeWidth={1.5} className="size-3.5" />
                            {v.resort.heading}
                          </Link>
                        ) : null}
                        {capacity ? (
                          <p className="mt-1 flex items-center gap-2 text-caption text-charcoal">
                            <Users aria-hidden="true" strokeWidth={1.5} className="size-3.5 text-forest" />
                            {capacity}
                          </p>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              </section>
            ) : null}

            <aside aria-labelledby="package-action-title" className="mt-10 rounded-xl bg-forest p-8 lg:p-10">
              <h2 id="package-action-title" className="text-h4 text-ivory lg:text-[1.75rem]">
                Enquire About This Package
              </h2>
              {price ? (
                <p className="mt-3 text-ivory">
                  <span className="text-small">Starting from </span>
                  <span className="font-heading text-h4">{price}</span>
                </p>
              ) : null}
              <p className="mt-3 max-w-md text-small text-ivory">
                {price ? FINAL_RATES_NOTE : "Tell us about your event and our team will call you with options and rates."}
              </p>
              <ButtonLink
                href={eventEnquiryHref({ package: pkg.slug })}
                variant="accent"
                size="pill"
                shape="pill"
                arrow
                className="mt-6 text-forest hover:text-ivory"
              >
                Enquire Now
              </ButtonLink>
            </aside>
          </div>
        </div>
      </article>

      {pkg.related.length > 0 ? (
        <section aria-labelledby="package-related-title" className="container-site pb-16 lg:pb-24">
          <SectionHeading id="package-related-title" align="start" title={`More ${kind} Packages`} />
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pkg.related.map((related) => {
              const relatedPrice = formatPackagePrice(related.price)
              return (
                <li key={related.slug} className="flex">
                  <ContentCard
                    className="w-full"
                    image={<MediaImage image={related.image} sizes="(min-width: 1025px) 30vw, (min-width: 768px) 45vw, 90vw" />}
                    title={related.title}
                    subtitle={related.summary || undefined}
                    subtitleClassName="line-clamp-3"
                    meta={[
                      ...(related.resorts.length > 0
                        ? [{ icon: MapPin, label: related.resorts.map((r) => r.heading).join(", ") }]
                        : []),
                      ...(relatedPrice ? [{ icon: Tag, label: `From ${relatedPrice}` }] : []),
                    ]}
                    href={pathForDocument({ _type: "eventPackage", slug: related.slug }) ?? "/event"}
                    action="View Details"
                  />
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </>
  )
}
