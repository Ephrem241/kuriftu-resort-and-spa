import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  id?: string
  title: string
  subtitle?: string
  /** "center": gold lines on both sides. "start": a gold line trailing right. */
  align?: "center" | "start"
  className?: string
}

/** H2 with champagne-gold hairlines, as in the home page reference. */
export function SectionHeading({
  id,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  const line = <span aria-hidden="true" className="h-px flex-1 bg-gold/70" />

  if (align === "start") {
    return (
      <div className={className}>
        <div className="flex items-center gap-6">
          <h2 id={id} className="text-h3 lg:text-[2.125rem]">
            {title}
          </h2>
          {line}
        </div>
        {subtitle ? <p className="mt-1 text-small text-charcoal">{subtitle}</p> : null}
      </div>
    )
  }

  return (
    <div className={cn("text-center", className)}>
      <div className="flex items-center justify-center gap-6 lg:gap-8">
        <span aria-hidden="true" className="hidden h-px w-24 bg-gold/70 md:block lg:w-40" />
        <h2 id={id} className="text-h3 lg:text-[2.125rem]">
          {title}
        </h2>
        <span aria-hidden="true" className="hidden h-px w-24 bg-gold/70 md:block lg:w-40" />
      </div>
      {subtitle ? <p className="mt-1 text-small text-charcoal">{subtitle}</p> : null}
    </div>
  )
}
