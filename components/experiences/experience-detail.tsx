import Link from "next/link"
import { ArrowLeft, Clock, MapPin } from "lucide-react"

import { BookStayLink } from "@/components/booking/book-stay-link"
import { ExperienceCard } from "@/components/experiences/experience-card"
import { ContactActions } from "@/components/site/contact-actions"
import { buttonVariants } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import { PortableText } from "@/components/ui/portable-text"
import { SectionHeading } from "@/components/ui/section-heading"
import { categoryLabel, experienceAction } from "@/lib/content/experiences"
import type { ExperiencePage, PropertyContact } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type ExperienceDetailProps = {
  experience: ExperiencePage
  /** Site reservations, when no single resort can be contacted. */
  reservations: PropertyContact
}

/** One experience: photos, where and how long, the story, and how to book or enquire. */
export function ExperienceDetail({ experience, reservations }: ExperienceDetailProps) {
  const [hero, ...more] = experience.images
  const action = experienceAction(experience)
  const where = experience.resorts.map((r) => r.heading).join(", ")
  const relatedTitle =
    experience.resorts.length === 1 ? `More at ${experience.resorts[0].heading}` : "You May Also Like"

  return (
    <>
      <article aria-labelledby="experience-title" className="container-site pt-32 pb-16 lg:pt-36 lg:pb-24">
        <Link
          href="/experience"
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
          All Experiences
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
            <p className="eyebrow text-forest">{categoryLabel(experience.category)}</p>
            <h1 id="experience-title" className="mt-3 text-[2.5rem] leading-[1.1] md:text-h1">
              {experience.title}
            </h1>

            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {where ? (
                <li className="flex items-center gap-2 text-small text-charcoal">
                  <MapPin aria-hidden="true" strokeWidth={1.5} className="size-4 text-forest" />
                  <span>
                    <span className="sr-only">Offered at </span>
                    {where}
                  </span>
                </li>
              ) : null}
              {experience.duration ? (
                <li className="flex items-center gap-2 text-small text-charcoal">
                  <Clock aria-hidden="true" strokeWidth={1.5} className="size-4 text-forest" />
                  <span>
                    <span className="sr-only">Duration </span>
                    {experience.duration}
                  </span>
                </li>
              ) : null}
            </ul>

            {experience.description.length > 0 ? (
              <PortableText value={experience.description} headingLevel={2} className="mt-8 text-body text-charcoal" />
            ) : null}

            <aside aria-labelledby="experience-action-title" className="mt-10 rounded-xl bg-forest p-8 lg:p-10">
              <h2 id="experience-action-title" className="text-h4 text-ivory lg:text-[1.75rem]">
                {action.kind === "book" ? "Book Your Stay" : "Enquire About This Experience"}
              </h2>
              <p className="mt-3 max-w-md text-small text-ivory">
                {action.kind === "book"
                  ? "Experiences are arranged during your stay. Final rates and availability are confirmed in booking."
                  : "Contact our team to arrange this experience."}
              </p>
              {action.kind === "book" ? (
                <BookStayLink
                  source="experience"
                  resort={action.resort?.slug}
                  property={action.resort?.bookingProperty}
                  variant="accent"
                  className="mt-6 text-charcoal hover:text-ivory"
                />
              ) : (
                <ContactActions
                  phone={action.resort?.phone ?? reservations.phone}
                  email={action.resort?.email ?? reservations.email}
                  source="experience"
                  className="mt-6"
                />
              )}
            </aside>
          </div>
        </div>
      </article>

      {experience.related.length > 0 ? (
        <section aria-labelledby="experience-related-title" className="container-site pb-16 lg:pb-24">
          <SectionHeading id="experience-related-title" align="start" title={relatedTitle} />
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experience.related.map((related) => (
              <li key={related.slug} className="flex">
                <ExperienceCard experience={related} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}
