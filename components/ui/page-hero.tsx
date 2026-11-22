import { ButtonLink } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import type { ContentImage } from "@/lib/content/types"

type PageHeroProps = {
  /** Id of the h1, which labels the section. */
  titleId: string
  eyebrow: string
  title: string
  intro?: string
  image: ContentImage | null
  /** Forest pill under the intro, usually an in-page anchor. */
  cta: { label: string; href: string }
}

/** Index page hero: copy on ivory at left, the page photo full bleed behind it on the right. */
export function PageHero({ titleId, eyebrow, title, intro, image, cta }: PageHeroProps) {
  return (
    <section aria-labelledby={titleId} className="relative isolate flex flex-col overflow-hidden lg:block">
      {image ? (
        <div className="relative order-2 aspect-4/3 w-full md:aspect-video lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[72%]">
          <MediaImage image={image} sizes="(min-width: 1025px) 72vw, 100vw" priority className="animate-fade-in" />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 hidden w-3/5 bg-linear-to-r from-ivory via-ivory/75 to-transparent lg:block"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-ivory/90 to-transparent lg:hidden"
          />
        </div>
      ) : null}

      <div className="relative z-10 order-1 container-site animate-fade-in pt-32 pb-10 lg:flex lg:min-h-[32rem] lg:flex-col lg:justify-center lg:pt-36 lg:pb-28">
        <p className="eyebrow flex items-center gap-3 text-forest">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          {eyebrow}
        </p>
        <h1 id={titleId} className="mt-3 max-w-xl text-[2.75rem] leading-[1.1] md:text-h1 lg:text-[4rem]">
          {title}
        </h1>
        {intro ? <p className="mt-5 max-w-sm text-body text-charcoal lg:text-[1.0625rem]">{intro}</p> : null}
        <ButtonLink href={cta.href} variant="primary" size="pill" shape="pill" arrow className="mt-7 self-start">
          {cta.label}
        </ButtonLink>
      </div>
    </section>
  )
}
