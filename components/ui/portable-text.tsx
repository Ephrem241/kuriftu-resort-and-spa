import { PortableText as PortableTextRenderer, type PortableTextComponents } from "@portabletext/react"

import type { RichText } from "@/lib/content/types"
import { cn } from "@/lib/utils"

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6"

/** Content heading styles (h2, h3) and the look each keeps at any level. */
const HEADING_CLASS = { h2: "text-h4", h3: "text-body font-bold" } as const

/**
 * Picks the HTML level for each content heading so the outline never skips a
 * level: the highest style used in this text renders at `topLevel`, and the
 * next style one level below it. The look follows the style, not the level.
 */
function headingTags(value: RichText, topLevel: 2 | 3) {
  const usesH2 = value.some((block) => (block as { style?: string }).style === "h2")
  const tag = (offset: number) => `h${Math.min(topLevel + offset, 6)}` as HeadingTag
  return { h2: tag(0), h3: tag(usesH2 ? 1 : 0) }
}

function blockComponents(tags: { h2: HeadingTag; h3: HeadingTag }): PortableTextComponents["block"] {
  return {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => {
      const Tag = tags.h2
      return <Tag className={HEADING_CLASS.h2}>{children}</Tag>
    },
    h3: ({ children }) => {
      const Tag = tags.h3
      return <Tag className={HEADING_CLASS.h3}>{children}</Tag>
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-gold pl-4 italic">{children}</blockquote>
    ),
  }
}

const components: PortableTextComponents = {
  list: {
    bullet: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : ""
      const safe = href.startsWith("/") || /^(https?:|mailto:|tel:)/.test(href)
      if (!safe) return <>{children}</>
      const external = /^https?:/.test(href)
      return (
        <a
          href={href}
          className="text-forest underline underline-offset-2 hover:text-charcoal"
          {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        >
          {children}
        </a>
      )
    },
  },
}

/**
 * Sanity Portable Text rendered as React elements (never raw HTML).
 * `headingLevel` is the HTML level for the text's top heading: 3 (default)
 * when it sits under a section h2, 2 when it sits directly under the page h1.
 */
export function PortableText({
  value,
  className,
  headingLevel = 3,
}: {
  value: RichText
  className?: string
  headingLevel?: 2 | 3
}) {
  if (value.length === 0) return null
  const block = blockComponents(headingTags(value, headingLevel))
  return (
    <div className={cn("space-y-4", className)}>
      <PortableTextRenderer value={value} components={{ ...components, block }} />
    </div>
  )
}
