import { ButtonLink } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import type { DiningPage } from "@/lib/content/types"

type Events = NonNullable<DiningPage["events"]>

/** "Special Dining Events": a wide photo fading into ivory, copy and "Explore Events" at right. */
export function DiningEvents({ content }: { content: Events }) {
  return (
    <section aria-labelledby="dining-events-title" className="mx-auto w-[97%] max-w-[1440px] py-4 lg:py-3">
      <div className="relative isolate grid overflow-hidden rounded-2xl bg-ivory lg:min-h-[9rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,36%)] lg:items-center">
        <div className="relative aspect-[16/9] md:aspect-[21/9] lg:absolute lg:inset-y-0 lg:left-0 lg:aspect-auto lg:w-[66%]">
          <MediaImage image={content.image} sizes="(min-width: 1025px) 64vw, 100vw" />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 hidden w-1/2 bg-linear-to-r from-transparent to-ivory lg:block"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-ivory lg:hidden" />
        </div>

        <div className="relative z-10 px-6 pt-4 pb-8 md:px-10 lg:col-start-2 lg:py-8 lg:pr-12 lg:pl-0">
          <span aria-hidden="true" className="mb-3 hidden h-px w-full bg-gold/60 lg:block" />
          <h2 id="dining-events-title" className="text-h3 lg:text-[2rem] lg:leading-[1.15]">
            {content.title}
          </h2>
          {content.text ? <p className="mt-3 max-w-xs text-small text-charcoal">{content.text}</p> : null}
          <ButtonLink href="/event" variant="primary" size="pill" shape="pill" arrow className="mt-5">
            Explore Events
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
