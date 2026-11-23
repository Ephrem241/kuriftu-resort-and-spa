import { PageHero } from "@/components/ui/page-hero"
import type { MarketingPage } from "@/lib/content/types"

const TITLE_ID = "page-title"

/** Photo hero when the page has one, otherwise the compact heading of the index pages. */
export function PageHeader({ hero }: { hero: MarketingPage["hero"] }) {
  if (hero.image) {
    return (
      <PageHero
        titleId={TITLE_ID}
        eyebrow={hero.eyebrow}
        title={hero.title}
        intro={hero.intro || undefined}
        image={hero.image}
      />
    )
  }

  return (
    <header aria-labelledby={TITLE_ID} className="container-site animate-fade-in pt-32 pb-4 lg:pt-36 lg:pb-6">
      {hero.eyebrow ? (
        <p className="eyebrow mb-3 flex items-center gap-3 text-forest">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          {hero.eyebrow}
        </p>
      ) : null}
      <h1 id={TITLE_ID} className="max-w-2xl">
        {hero.title}
      </h1>
      {hero.intro ? <p className="mt-4 max-w-xl text-body text-charcoal">{hero.intro}</p> : null}
    </header>
  )
}
