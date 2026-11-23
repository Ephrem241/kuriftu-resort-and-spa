import { ButtonLink } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import type { DiningPage } from "@/lib/content/types"

type Highlights = NonNullable<DiningPage["highlights"]>

/** "Menu Highlights": copy and "View Our Menu" at left, up to four dish photos at right, on beige. */
export function MenuHighlights({ content, menuHref }: { content: Highlights; menuHref: string }) {
  return (
    <section aria-labelledby="menu-highlights-title" className="bg-beige/60 py-10 lg:py-6">
      <div className="container-site grid items-center gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,2.25fr)] lg:gap-10">
        <div>
          <h2 id="menu-highlights-title" className="text-h2 lg:text-[2.25rem] lg:leading-[1.15]">
            {content.title}
          </h2>
          {content.text ? <p className="mt-4 max-w-xs text-small text-charcoal">{content.text}</p> : null}
          <ButtonLink href={menuHref} variant="primary" size="pill" shape="pill" arrow className="mt-6">
            View Our Menu
          </ButtonLink>
        </div>

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {content.images.map((image) => (
            <li key={image.key} className="relative aspect-[4/3.6] overflow-hidden rounded-xl shadow-sm">
              <MediaImage image={image} sizes="(min-width: 1025px) 17vw, (min-width: 768px) 23vw, 46vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
