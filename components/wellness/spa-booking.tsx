import { Suspense } from "react"

import { MediaImage } from "@/components/ui/media-image"
import type { WellnessPage } from "@/lib/content/types"

import { SpaBookingForm, SpaBookingFormFromUrl, type TreatmentOptionGroup } from "./spa-booking-form"

type SpaBookingProps = {
  id: string
  content: WellnessPage["booking"]
  options: TreatmentOptionGroup[]
  reservationPhone: { display: string; tel: string } | null
}

/** "Spa Booking Request": copy on forest at left, the request form on a white card at right. */
export function SpaBooking({ id, content, options, reservationPhone }: SpaBookingProps) {
  const form = { options, reservationPhone }
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto w-[97%] max-w-[1440px] scroll-mt-8 py-6 lg:py-8">
      <div className="relative isolate grid overflow-hidden rounded-2xl bg-forest lg:grid-cols-[minmax(0,1fr)_minmax(0,48%)] lg:items-center lg:rounded-3xl">
        {content.image ? (
          <div className="relative aspect-[16/9] md:aspect-[21/9] lg:absolute lg:inset-y-0 lg:left-0 lg:aspect-auto lg:w-[22%]">
            <MediaImage image={content.image} sizes="(min-width: 1025px) 22vw, 100vw" />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 hidden w-2/3 bg-linear-to-r from-transparent to-forest lg:block"
            />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-forest lg:hidden" />
          </div>
        ) : null}

        <div className="relative z-10 px-6 pt-8 pb-6 md:px-10 lg:py-12 lg:pr-10 lg:pl-[24%]">
          <p className="eyebrow flex items-center gap-3 text-beige">
            <span aria-hidden="true" className="h-px w-6 bg-gold" />
            {content.eyebrow}
          </p>
          <h2 id={`${id}-title`} className="mt-3 text-h2 text-ivory lg:text-[2.5rem] lg:leading-[1.15]">
            {content.title}
          </h2>
          {content.text ? <p className="mt-4 max-w-md text-body text-ivory/90">{content.text}</p> : null}
          {content.tagline ? (
            <p className="accent mt-8 flex items-center gap-4 text-h4 text-ivory">
              <span aria-hidden="true" className="h-px w-12 bg-gold" />
              <span className="max-w-40 leading-snug">{content.tagline}</span>
            </p>
          ) : null}
        </div>

        <div className="relative z-10 p-3 pt-0 md:p-6 md:pt-0 lg:p-4">
          <div className="rounded-xl bg-white p-5 shadow-xl shadow-charcoal/20 md:p-6 lg:p-7">
            {/* `?treatment=` is read in the browser; the static HTML renders the empty form. */}
            <Suspense fallback={<SpaBookingForm {...form} />}>
              <SpaBookingFormFromUrl {...form} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}
