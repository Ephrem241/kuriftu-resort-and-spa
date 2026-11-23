import { ButtonLink } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import { SectionHeading } from "@/components/ui/section-heading"
import { FINAL_RATES_NOTE, packagePriceParts } from "@/lib/content/events"
import { pathForDocument } from "@/lib/content/routes"
import type { EventsPage } from "@/lib/content/types"

/** "Our Event Packages": one card per kind, each opening the package the editor linked. */
export function EventPackages({ id, content }: { id: string; content: EventsPage["packages"] }) {
  if (content.cards.length === 0) return null
  return (
    <section aria-labelledby={`${id}-title`} className="container-site py-12 lg:py-14">
      <SectionHeading id={`${id}-title`} title={content.title} subtitle={content.subtitle || undefined} />
      <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-6">
        {content.cards.map((card) => {
          const price = packagePriceParts(card.package.price)
          const href = pathForDocument({ _type: "eventPackage", slug: card.package.slug }) ?? "/event"
          return (
            <li key={card.key} className="flex animate-slide-up">
              <article className="flex w-full flex-col overflow-hidden rounded-lg border border-line bg-card shadow-sm">
                <div className="relative aspect-[16/5.5] overflow-hidden bg-beige">
                  <MediaImage image={card.image} sizes="(min-width: 1025px) 30vw, (min-width: 768px) 45vw, 90vw" />
                </div>
                <div className="flex flex-1 flex-col px-5 pt-5 pb-5 text-center lg:px-6">
                  <h3 className="text-h4">{card.title}</h3>
                  {card.text ? <p className="mx-auto mt-2 max-w-xs text-small text-muted">{card.text}</p> : null}
                  <div className="mt-auto flex items-end justify-between gap-4 pt-6 text-left">
                    {price ? (
                      <div>
                        <p className="text-caption text-charcoal">Starting from</p>
                        <p className="font-heading text-h4 whitespace-nowrap text-charcoal">{price.amount}</p>
                        {price.unit ? <p className="text-caption text-charcoal">{price.unit}</p> : null}
                      </div>
                    ) : (
                      <span />
                    )}
                    <ButtonLink href={href} variant="primary" size="pill" shape="pill" arrow className="shrink-0">
                      View Details
                      <span className="sr-only">: {card.title}</span>
                    </ButtonLink>
                  </div>
                  {price ? <p className="mt-3 text-left text-caption text-muted">{FINAL_RATES_NOTE}</p> : null}
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
