import { BookStayLink } from "@/components/booking/book-stay-link"
import { MediaImage } from "@/components/ui/media-image"
import { ContactActions } from "@/components/site/contact-actions"
import type { ResortPage } from "@/lib/content/types"
import { cn } from "@/lib/utils"

const goldPill = "text-charcoal hover:text-ivory"

/**
 * Forest panel that ends the page. Bookable resorts hand off to the booking
 * engine; the water park and day spa show their own phone and email.
 */
export function ResortCta({ resort }: { resort: ResortPage }) {
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
        ) : (
          <ContactActions phone={resort.phone} email={resort.email} source="resort-cta" className="mt-6" />
        )}
      </div>
    </aside>
  )
}
