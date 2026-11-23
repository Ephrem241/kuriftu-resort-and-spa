import type { ComponentProps } from "react"
import { ChevronDown, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type FieldTriggerProps = ComponentProps<"button"> & {
  icon: LucideIcon
  label: string
  value: string
}

/**
 * Form field row from the design system: icon, small label, value, chevron.
 * Presentational trigger; the picker it opens is supplied by the caller.
 */
export function FieldTrigger({
  icon: Icon,
  label,
  value,
  className,
  type = "button",
  ...props
}: FieldTriggerProps) {
  return (
    <button
      type={type}
      className={cn(
        "group flex h-14 w-full cursor-pointer items-center gap-4 rounded-md border border-line bg-ivory px-4 text-left transition-colors duration-hover ease-soft hover:border-sage aria-expanded:border-forest",
        className
      )}
      {...props}
    >
      <Icon
        aria-hidden="true"
        strokeWidth={1.5}
        className="size-5 shrink-0 text-forest"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-caption text-charcoal">{label}</span>
        <span className="truncate text-small text-charcoal">{value}</span>
      </span>
      <ChevronDown
        aria-hidden="true"
        strokeWidth={1.5}
        className="size-4 shrink-0 text-charcoal transition-transform duration-hover ease-soft group-aria-expanded:rotate-180"
      />
    </button>
  )
}
