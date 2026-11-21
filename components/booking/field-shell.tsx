import type { ReactNode } from "react"
import { ChevronDown, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Same look as FieldTrigger: icon, small label, value, chevron. */
export const fieldShellClass =
  "relative flex h-14 w-full items-center gap-4 rounded-md border border-line bg-ivory px-4 transition-colors duration-hover ease-soft hover:border-sage focus-within:border-forest has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-gold"

/**
 * Wraps a native control (select or date input) in the design-system field
 * look. The control is stretched invisibly over the shell so the whole field is
 * clickable, while the visible value is rendered by the caller.
 */
export function FieldShell({
  icon: Icon,
  label,
  htmlFor,
  value,
  invalid,
  children,
}: {
  icon: LucideIcon
  label: string
  htmlFor: string
  value: ReactNode
  invalid?: boolean
  children: ReactNode
}) {
  return (
    <div className={cn(fieldShellClass, invalid && "border-error")}>
      <Icon aria-hidden="true" strokeWidth={1.5} className="size-5 shrink-0 text-forest" />
      <span className="flex min-w-0 flex-1 flex-col">
        <label htmlFor={htmlFor} className="text-caption text-muted">
          {label}
        </label>
        <span aria-hidden="true" className="truncate text-small text-charcoal">
          {value}
        </span>
      </span>
      <ChevronDown aria-hidden="true" strokeWidth={1.5} className="size-4 shrink-0 text-charcoal" />
      {children}
    </div>
  )
}
