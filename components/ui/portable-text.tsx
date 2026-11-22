import { PortableText as PortableTextRenderer, type PortableTextComponents } from "@portabletext/react"

import type { RichText } from "@/lib/content/types"
import { cn } from "@/lib/utils"

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h3 className="text-h4">{children}</h3>,
    h3: ({ children }) => <h4 className="text-body font-bold">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-gold pl-4 italic">{children}</blockquote>
    ),
  },
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

/** Sanity Portable Text rendered as React elements (never raw HTML). */
export function PortableText({ value, className }: { value: RichText; className?: string }) {
  if (value.length === 0) return null
  return (
    <div className={cn("space-y-4", className)}>
      <PortableTextRenderer value={value} components={components} />
    </div>
  )
}
