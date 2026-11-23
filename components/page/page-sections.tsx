import { Play } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import { MediaImage } from "@/components/ui/media-image"
import { PortableText } from "@/components/ui/portable-text"
import { SectionHeading } from "@/components/ui/section-heading"
import { VideoLightbox } from "@/components/ui/video-lightbox"
import { IconFeatures } from "@/components/wellness/icon-features"
import type { PageSection } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type TextBlock = Extract<PageSection, { type: "text" }>

/** Consecutive text blocks share one reading column (so Privacy reads as one document). */
type Run = { kind: "text"; key: string; blocks: TextBlock[] } | { kind: "block"; key: string; section: PageSection }

function toRuns(sections: PageSection[]): Run[] {
  const runs: Run[] = []
  for (const section of sections) {
    const last = runs.at(-1)
    if (section.type === "text" && last?.kind === "text") last.blocks.push(section)
    else if (section.type === "text") runs.push({ kind: "text", key: section.key, blocks: [section] })
    else runs.push({ kind: "block", key: section.key, section })
  }
  return runs
}

const headingId = (key: string) => `section-${key}`

/** The section blocks of a marketing page, in editor order. */
export function PageSections({ sections }: { sections: PageSection[] }) {
  if (sections.length === 0) return null
  return (
    <div className="space-y-16 pt-12 pb-24 lg:space-y-24 lg:pt-16 lg:pb-32">
      {toRuns(sections).map((run) =>
        run.kind === "text" ? (
          <div key={run.key} className="container-site">
            <div className="mx-auto max-w-3xl space-y-12">
              {run.blocks.map((block) => (
                <TextSection key={block.key} block={block} />
              ))}
            </div>
          </div>
        ) : (
          <Block key={run.key} section={run.section} />
        )
      )}
    </div>
  )
}

function Block({ section }: { section: PageSection }) {
  switch (section.type) {
    case "mediaText":
      return <MediaTextSection section={section} />
    case "gallery":
      return <GallerySection section={section} />
    case "features":
      return <FeaturesSection section={section} />
    case "cta":
      return <CtaSection section={section} />
    case "video":
      return <VideoSection section={section} />
    case "text":
      return <TextSection block={section} />
  }
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="eyebrow flex items-center gap-3 text-forest">
      <span aria-hidden="true" className="h-px w-8 bg-gold" />
      {children}
    </p>
  )
}

function TextSection({ block }: { block: TextBlock }) {
  const id = headingId(block.key)
  const content = (
    <>
      {block.eyebrow ? <Eyebrow>{block.eyebrow}</Eyebrow> : null}
      {block.heading ? (
        <h2 id={id} className={cn("text-h3 lg:text-[2.125rem] lg:leading-[1.2]", block.eyebrow && "mt-3")}>
          {block.heading}
        </h2>
      ) : null}
      <PortableText
        value={block.body}
        className={cn("text-small text-charcoal md:text-body", (block.eyebrow || block.heading) && "mt-5")}
      />
    </>
  )
  return block.heading ? <section aria-labelledby={id}>{content}</section> : <div>{content}</div>
}

function MediaTextSection({ section }: { section: Extract<PageSection, { type: "mediaText" }> }) {
  const id = headingId(section.key)
  return (
    <section
      aria-labelledby={id}
      className="container-site grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16"
    >
      <div
        className={cn(
          "relative aspect-[16/11] overflow-hidden rounded-xl bg-beige",
          section.imagePosition === "end" && "lg:order-2"
        )}
      >
        <MediaImage image={section.image} sizes="(min-width: 1025px) 45vw, 90vw" />
      </div>
      <div>
        {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
        <h2 id={id} className={cn("max-w-md text-h3 lg:text-[2.125rem] lg:leading-[1.2]", section.eyebrow && "mt-3")}>
          {section.heading}
        </h2>
        <PortableText value={section.body} className="mt-5 max-w-lg text-small text-charcoal md:text-body" />
        {section.link ? (
          <ButtonLink href={section.link.href} variant="outline" arrow className="mt-8">
            {section.link.label}
          </ButtonLink>
        ) : null}
      </div>
    </section>
  )
}

function GallerySection({ section }: { section: Extract<PageSection, { type: "gallery" }> }) {
  const id = headingId(section.key)
  const count = section.images.length
  const sizes =
    count === 1 ? "(min-width: 1440px) 1296px, 90vw" : count === 2 ? "(min-width: 768px) 45vw, 90vw" : "(min-width: 1025px) 30vw, (min-width: 768px) 45vw, 90vw"

  return (
    <section aria-labelledby={section.heading ? id : undefined} aria-label={section.heading ? undefined : "Photos"} className="container-site">
      {section.heading ? <SectionHeading id={id} title={section.heading} className="mb-8 lg:mb-10" /> : null}
      <ul
        className={cn(
          "grid gap-4 lg:gap-6",
          count === 2 && "md:grid-cols-2",
          count >= 3 && "md:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {section.images.map((image, i) => (
          <li
            key={`${image.src ?? "placeholder"}-${i}`}
            className={cn(
              "relative overflow-hidden rounded-xl bg-beige",
              count === 1 ? "aspect-[16/9] lg:aspect-[16/7]" : "aspect-[4/3]"
            )}
          >
            <MediaImage image={image} sizes={sizes} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function FeaturesSection({ section }: { section: Extract<PageSection, { type: "features" }> }) {
  const id = headingId(section.key)
  return (
    <section aria-labelledby={section.heading ? id : undefined} className="container-site">
      {section.heading ? <SectionHeading id={id} title={section.heading} /> : null}
      {section.intro ? <p className="mx-auto mt-3 max-w-xl text-center text-body text-charcoal">{section.intro}</p> : null}
      <IconFeatures features={section.items} className="mt-10" />
    </section>
  )
}

function CtaSection({ section }: { section: Extract<PageSection, { type: "cta" }> }) {
  const id = headingId(section.key)
  return (
    <aside aria-labelledby={id} className="container-site">
      <div className="relative isolate flex min-h-64 overflow-hidden rounded-xl bg-forest lg:min-h-80">
        {section.image ? (
          <>
            <div className="absolute inset-y-0 right-0 -z-10 w-[65%]">
              <MediaImage image={section.image} sizes="(min-width: 1025px) 60vw, 65vw" />
            </div>
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-forest via-forest/90 to-forest/10" />
          </>
        ) : null}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <h2 id={id} className="max-w-md font-accent text-h3 italic text-ivory lg:text-[1.875rem]">
            {section.heading}
          </h2>
          {section.text ? <p className="mt-3 max-w-sm text-small text-ivory">{section.text}</p> : null}
          <ButtonLink
            href={section.link.href}
            variant="accent"
            arrow
            className="mt-6 self-start text-charcoal hover:text-ivory"
          >
            {section.link.label}
          </ButtonLink>
        </div>
      </div>
    </aside>
  )
}

function VideoSection({ section }: { section: Extract<PageSection, { type: "video" }> }) {
  const id = headingId(section.key)
  return (
    <section aria-labelledby={id} className="container-site">
      <SectionHeading id={id} title={section.title} className="mb-8 lg:mb-10" />
      <VideoLightbox
        embedUrl={section.embedUrl}
        title={section.title}
        source="page-video"
        trigger={
          <button
            type="button"
            aria-label={`Play video: ${section.title}`}
            className="group/video relative block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <div className="relative aspect-video overflow-hidden rounded-xl bg-beige">
              <MediaImage image={section.poster} sizes="(min-width: 1440px) 1296px, 90vw" />
            </div>
            <span className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/30 ring-1 ring-ivory/70 backdrop-blur-sm transition-transform duration-hover ease-soft group-hover/video:scale-105">
              <Play aria-hidden="true" strokeWidth={1.5} className="ml-0.5 size-6 fill-ivory text-ivory" />
            </span>
          </button>
        }
      />
    </section>
  )
}
