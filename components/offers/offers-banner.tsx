import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import type { OffersPage } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type Banner = NonNullable<OffersPage["banner"]>

/** "Limited time offer" panel: copy on forest at left, photo fading in from the right. */
export function OffersBanner({ banner }: { banner: Banner }) {
  return (
    <section aria-labelledby="offers-banner-title" className="mx-auto w-[95%] max-w-[1440px] pb-16 lg:pb-24">
      <div className="relative isolate flex flex-col overflow-hidden rounded-2xl bg-forest md:min-h-[18rem] lg:min-h-[20rem] lg:rounded-3xl">
        <div className="relative order-2 aspect-video md:absolute md:inset-y-0 md:right-0 md:order-none md:aspect-auto md:w-[62%]">
          <MediaImage image={banner.image} sizes="(min-width: 768px) 60vw, 100vw" />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 hidden w-1/2 bg-linear-to-r from-forest via-forest/70 to-transparent md:block"
          />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-forest to-transparent md:hidden" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-8 md:max-w-[50%] md:py-10 lg:px-14 lg:py-12">
          {banner.eyebrow ? <p className="eyebrow text-gold">{banner.eyebrow}</p> : null}
          <h2 id="offers-banner-title" className="mt-2 max-w-md text-h3 text-ivory lg:text-[2.75rem] lg:leading-[1.08]">
            {banner.title}
          </h2>
          {banner.text ? <p className="mt-4 max-w-sm text-body text-ivory/90">{banner.text}</p> : null}
          {banner.link ? (
            <Link
              href={banner.link.href}
              className={cn(
                buttonVariants({ variant: "accent", size: "pill", shape: "pill" }),
                "group/button mt-6 self-start text-charcoal hover:bg-ivory hover:text-forest"
              )}
            >
              {banner.link.label}
              <ArrowRight
                aria-hidden="true"
                strokeWidth={1.5}
                className="transition-transform duration-hover ease-soft group-hover/button:translate-x-1"
              />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
