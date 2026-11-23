import { Suspense } from "react"

import { MediaImage } from "@/components/ui/media-image"
import type { EventsPage } from "@/lib/content/types"

import { EventEnquiryForm, EventEnquiryFormFromUrl } from "./event-enquiry-form"

type EventEnquiryProps = {
  id: string
  content: EventsPage["enquiry"]
  packages: EventsPage["packageOptions"]
  resorts: EventsPage["venueResorts"]
  reservationPhone: { display: string; tel: string } | null
}

/** "Event Enquiry": copy on forest at left, the enquiry form on a white card at right. */
export function EventEnquiry({ id, content, packages, resorts, reservationPhone }: EventEnquiryProps) {
  const form = { packages, resorts, reservationPhone }
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto w-[97%] max-w-[1440px] scroll-mt-8 py-6 lg:py-8">
      <div className="relative isolate grid overflow-hidden rounded-2xl bg-beige lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)] lg:rounded-3xl">
        <div className="relative overflow-hidden bg-forest px-6 pt-10 pb-8 md:px-10 lg:flex lg:flex-col lg:justify-center lg:px-12 lg:py-14">
          {content.image ? (
            <div aria-hidden="true" className="absolute inset-0 -z-0 opacity-25">
              <MediaImage image={{ ...content.image, alt: "" }} sizes="(min-width: 1025px) 35vw, 100vw" />
              <div className="absolute inset-0 bg-linear-to-r from-forest via-forest/80 to-forest/40" />
            </div>
          ) : null}
          <div className="relative">
            <h2 id={`${id}-title`} className="text-h2 text-ivory lg:text-[2.5rem] lg:leading-[1.15]">
              {content.title}
            </h2>
            {content.text ? <p className="mt-4 max-w-sm text-body text-ivory/90">{content.text}</p> : null}
          </div>
        </div>

        <div className="p-3 md:p-6 lg:p-5">
          <div className="h-full rounded-xl bg-white p-5 shadow-lg shadow-charcoal/10 md:p-6 lg:p-7">
            {/* `?type=`, `?package=` and `?resort=` are read in the browser; the static HTML renders the empty form. */}
            <Suspense fallback={<EventEnquiryForm {...form} />}>
              <EventEnquiryFormFromUrl {...form} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}
