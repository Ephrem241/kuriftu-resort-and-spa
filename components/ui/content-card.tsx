import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type CardMeta = { icon: LucideIcon; label: string }

type ContentCardProps = {
  /** A next/image element (fill) or placeholder, cropped to the card ratio. */
  image: ReactNode
  title: string
  subtitle?: string
  meta?: CardMeta[]
  href: string
  /** Uppercase action label, e.g. "Explore" or "View details". */
  action: string
  className?: string
  /** Extra classes for the subtitle, e.g. a line clamp. */
  subtitleClassName?: string
  /** Extra classes for the action link, e.g. title case where a page design uses it. */
  actionClassName?: string
}

/**
 * Card from the design system: image on top, Playfair title, short subtitle,
 * optional meta row (guests, bed, size), and an uppercase arrow action.
 */
export function ContentCard({
  image,
  title,
  subtitle,
  meta,
  href,
  action,
  className,
  subtitleClassName,
  actionClassName,
}: ContentCardProps) {
  return (
    <article
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-md border border-line bg-card",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-beige">
        <div className="absolute inset-0 transition-transform duration-reveal ease-soft group-hover/card:scale-105">
          {image}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 lg:p-6">
        <h3 className="text-h4">{title}</h3>
        {subtitle ? (
          <p className={cn("mt-1 text-small text-charcoal", subtitleClassName)}>{subtitle}</p>
        ) : null}

        {meta && meta.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {meta.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-caption text-charcoal"
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="size-4 text-forest"
                />
                {label}
              </li>
            ))}
          </ul>
        ) : null}

        <Link
          href={href}
          className={cn(
            "group/action eyebrow mt-auto inline-flex items-center gap-2 self-start pt-6 text-forest after:absolute after:inset-0 hover:text-charcoal",
            actionClassName
          )}
        >
          {action}
          <span className="sr-only">: {title}</span>
          <ArrowRight
            aria-hidden="true"
            strokeWidth={1.5}
            className="size-4 transition-transform duration-hover ease-soft group-hover/action:translate-x-1"
          />
        </Link>
      </div>
    </article>
  )
}
