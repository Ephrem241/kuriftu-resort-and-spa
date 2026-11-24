import { cn } from "@/lib/utils"

/**
 * The official Kuriftu Resorts logo (from kurifturesorts.com), served as-is
 * from /public/brand. The "light" file only recolours the wordmark and rule
 * to ivory for dark backgrounds; the figure mark is untouched.
 */
const SOURCES = {
  dark: "/brand/kuriftu-logo.svg",
  light: "/brand/kuriftu-logo-light.svg",
} as const

export function Logo({
  tone = "dark",
  priority = false,
  className,
}: {
  /** "dark" text for ivory backgrounds, "light" text for forest backgrounds. */
  tone?: keyof typeof SOURCES
  priority?: boolean
  /** Set the height (e.g. `h-12`); width follows the 130:57 aspect ratio. */
  className?: string
}) {
  return (
    // The global next/image loader is Sanity's CDN, which can't serve local
    // files, and an SVG gains nothing from resizing: a plain <img> is right.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SOURCES[tone]}
      alt="Kuriftu Resorts"
      width={130}
      height={57}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("block h-12 w-auto", className)}
    />
  )
}
