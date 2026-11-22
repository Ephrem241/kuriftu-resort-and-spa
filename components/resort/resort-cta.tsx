import { Mail, Phone } from "lucide-react"

import { BookStayLink } from "@/components/booking/book-stay-link"
import { buttonVariants } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import { ContactLink } from "@/components/site/contact-link"
import type { ResortPage } from "@/lib/content/types"
import { cn } from "@/lib/utils"

const goldPill = "text-forest hover:text-ivory"

/**
 * Forest panel that ends the page. Bookable resorts hand off to the booking
 * engine; the water park and day spa show their own phone and email.
 */
export function ResortCta({ resort }: { resort: ResortPage }) {
  const contactable = !resort.bookable && (resort.phone || resort.email)

  return (
    <aside
      aria-labelledby="cta-title"
      className="relative isolate flex min-h-64 overflow-hidden rounded-xl bg-forest lg:min-h-80 lg:rounded-r-none"
    >
      <div className="absolute inset-y-0 right-0 -z-10 w-[65%]">
        <MediaImage image={resort.ctaImage} sizes="(min-width: 1025px) 30vw, 65vw" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-forest via-forest/90 to-forest/10" />

      <div className="flex flex-col justify-center p-8 lg:p-10">
        <h2 id="cta-title" className="max-w-64 font-accent text-h3 italic text-ivory lg:text-[1.875rem]">
          {resort.bookable ? "Your Perfect Getaway Awaits" : "Plan Your Visit"}
        </h2>
        <p className="mt-3 max-w-60 text-small text-ivory">
          {resort.bookable
            ? "Book your stay today and experience the magic of Kuriftu Resorts."
            : `Contact ${resort.name} to plan your visit.`}
        </p>

        {resort.bookable ? (
          <BookStayLink
            source="resort-cta"
            resort={resort.slug}
            propertyId={resort.bookingPropertyId}
            variant="accent"
            className={cn("mt-6 self-start", goldPill)}
          />
        ) : contactable ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {resort.phone ? (
              <ContactLink
                method="phone"
                source="resort-cta"
                href={`tel:${resort.phone.tel}`}
                className={cn(buttonVariants({ variant: "accent", size: "pill", shape: "pill" }), goldPill)}
              >
                <Phone aria-hidden="true" strokeWidth={1.5} />
                Call {resort.phone.display}
              </ContactLink>
            ) : null}
            {resort.email ? (
              <ContactLink
                method="email"
                source="resort-cta"
                href={`mailto:${resort.email}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "pill", shape: "pill" }),
                  "border-ivory text-ivory hover:bg-ivory hover:text-forest"
                )}
              >
                <Mail aria-hidden="true" strokeWidth={1.5} />
                Email Us
              </ContactLink>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  )
}
