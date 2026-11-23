import { ContentIcon } from "@/components/ui/content-icon"
import { MediaImage } from "@/components/ui/media-image"
import type { DiningPage } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type Experience = NonNullable<DiningPage["experience"]>

/** "Our Dining Experience": copy and four icon chips at left, a rounded photo at right. */
export function DiningExperience({ content }: { content: Experience }) {
  return (
    <section
      aria-labelledby="dining-experience-title"
      className="container-site grid items-center gap-8 py-12 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12 lg:py-16"
    >
      <div>
        <h2 id="dining-experience-title" className="text-h2 lg:text-[2.5rem] lg:leading-[1.15]">
          {content.title}
        </h2>
        {content.text ? <p className="mt-5 max-w-lg text-body text-charcoal">{content.text}</p> : null}

        {content.features.length > 0 ? (
          <ul className="mt-8 grid grid-cols-2 gap-y-6 md:grid-cols-4 lg:mt-10">
            {content.features.map((f, i) => (
              <li
                key={f.key}
                className={cn(
                  "flex flex-col items-center gap-2 px-2 text-center",
                  i > 0 && "md:border-l md:border-line",
                  i % 2 === 1 && "border-l border-line"
                )}
              >
                {f.icon ? (
                  <span className="flex size-14 items-center justify-center rounded-full bg-beige/70">
                    <ContentIcon name={f.icon} strokeWidth={1.25} className="size-7 text-forest" />
                  </span>
                ) : null}
                <span className="rounded-full bg-beige/70 px-3 py-1.5 text-caption font-bold text-charcoal shadow-sm">
                  {f.title}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl lg:aspect-[16/9.5]">
        <MediaImage image={content.image} sizes="(min-width: 1025px) 50vw, 90vw" className="animate-image-reveal" />
      </div>
    </section>
  )
}
