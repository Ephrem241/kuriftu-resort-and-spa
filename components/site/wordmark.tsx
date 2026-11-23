import { cn } from "@/lib/utils"

/**
 * TEMPORARY text wordmark. Replace with the supplied Kuriftu logo SVG (with
 * leaf mark) once provided; the brand mark is never redrawn here.
 */
export function Wordmark({
  tone = "forest",
  size = "md",
  className,
}: {
  tone?: "forest" | "ivory"
  size?: "md" | "lg"
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-col items-center leading-none",
        tone === "forest" ? "text-forest" : "text-ivory",
        className
      )}
    >
      <span
        className={cn(
          "font-heading tracking-[0.12em]",
          size === "md" ? "text-[1.625rem]" : "text-[2.5rem]"
        )}
      >
        KURIFTU
      </span>{" "}
      <span className="mt-1.5 flex items-center gap-2">
        <span aria-hidden="true" className="h-px w-4 bg-gold" />
        <span
          className={cn(
            "font-sans tracking-[0.28em]",
            size === "md" ? "text-[0.5625rem]" : "text-[0.75rem]"
          )}
        >
          RESORTS &amp; SPA
        </span>
        <span aria-hidden="true" className="h-px w-4 bg-gold" />
      </span>
    </span>
  )
}
