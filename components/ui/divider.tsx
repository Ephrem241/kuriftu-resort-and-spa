import { cn } from "@/lib/utils"

type DividerProps = {
  /** Short centered rule (default) or full-width line. */
  variant?: "short" | "full"
  className?: string
}

/** Thin champagne-gold line divider. Decorative. */
export function Divider({ variant = "short", className }: DividerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block h-px bg-gold",
        variant === "short" ? "w-12" : "w-full",
        className
      )}
    />
  )
}
