import { ContentIcon } from "@/components/ui/content-icon"
import type { IconFeature } from "@/lib/content/types"
import { cn } from "@/lib/utils"

/** A row of outline icons with short titles, split by hairlines (2×2 on mobile). */
export function IconFeatures({ features, className }: { features: IconFeature[]; className?: string }) {
  if (features.length === 0) return null
  return (
    <ul className={cn("grid grid-cols-2 gap-y-8 md:grid-cols-4", className)}>
      {features.map((f, i) => (
        <li
          key={f.key}
          className={cn(
            "flex flex-col items-center gap-3 px-3 text-center",
            i > 0 && "md:border-l md:border-line",
            i % 2 === 1 && "border-l border-line"
          )}
        >
          {f.icon ? <ContentIcon name={f.icon} strokeWidth={1.25} className="size-8 text-forest lg:size-9" /> : null}
          <span className="max-w-40 text-small text-charcoal">{f.title}</span>
        </li>
      ))}
    </ul>
  )
}
