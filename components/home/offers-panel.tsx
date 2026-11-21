import { ButtonLink } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import type { HomePage } from "@/lib/content/types"

/** "Special Offers" link panel. Dated offers and the popup are a later step. */
export function OffersPanel({ content }: { content: HomePage["offersPanel"] }) {
  return (
    <aside
      aria-labelledby="offers-title"
      className="relative isolate flex min-h-80 overflow-hidden rounded-xl bg-beige lg:min-h-[26rem] lg:rounded-r-none"
    >
      <div className="absolute inset-y-0 right-0 -z-10 w-[70%]">
        <MediaImage image={content.image} sizes="(min-width: 1025px) 28vw, 70vw" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-beige via-beige/90 to-sage/10"
      />
      <div className="flex flex-col justify-center p-8 lg:p-10">
        <h2 id="offers-title" className="text-h3">
          {content.title}
        </h2>
        <p className="mt-2 max-w-56 text-small text-charcoal">{content.text}</p>
        <ButtonLink
          href="/offers"
          variant="primary"
          size="pill"
          shape="pill"
          arrow
          className="mt-6 self-start"
        >
          {content.ctaLabel}
        </ButtonLink>
      </div>
    </aside>
  )
}
