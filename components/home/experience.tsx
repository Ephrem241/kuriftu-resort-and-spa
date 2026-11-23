import Link from "next/link"

import { ContentIcon } from "@/components/ui/content-icon"
import { MediaImage } from "@/components/ui/media-image"
import { SectionHeading } from "@/components/ui/section-heading"
import type { HomePage } from "@/lib/content/types"

export function Experience({ content }: { content: HomePage["experience"] }) {
  return (
    <section
      aria-labelledby="experience-title"
      className="mt-16 grid items-center gap-10 lg:mt-20 lg:grid-cols-[1fr_minmax(0,42%)] lg:gap-12"
    >
      <div className="ml-[5%] mr-[5%] lg:mr-0">
        <SectionHeading id="experience-title" title={content.title} />
        <ul className="mt-10 grid grid-cols-2 gap-y-8 md:grid-cols-4">
          {content.pillars.map((pillar, i) => {
            return (
              <li
                key={pillar.title}
                className={i > 0 ? "md:border-l md:border-line" : undefined}
              >
                <Link
                  href={pillar.href}
                  className="group/pillar flex flex-col items-center px-3 text-center"
                >
                  <ContentIcon
                    name={pillar.icon}
                    strokeWidth={1.25}
                    className="size-10 text-forest transition-transform duration-hover ease-soft group-hover/pillar:-translate-y-0.5"
                  />
                  <span className="mt-4 text-small font-bold text-charcoal">{pillar.title}</span>
                  <span className="mt-1 text-caption text-charcoal">{pillar.subtitle}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="relative ml-[5%] aspect-[16/9] overflow-hidden rounded-l-[2.5rem] lg:ml-0 lg:aspect-[5/2.7] lg:rounded-l-[4rem]">
        <MediaImage image={content.image} sizes="(min-width: 1025px) 42vw, 95vw" />
      </div>
    </section>
  )
}
