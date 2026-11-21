"use client"

import type { VariantProps } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/button"
import { track } from "@/lib/analytics"
import { buildBookingUrl } from "@/lib/booking/handoff"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

type BookStayLinkProps = VariantProps<typeof buttonVariants> & {
  /** Where the click came from, for analytics. */
  source: string
  label?: string
  className?: string
}

/** "Book Your Stay" hand-off to the booking engine (no prefill). */
export function BookStayLink({
  source,
  label = "Book Your Stay",
  variant = "primary",
  size = "pill",
  shape = "pill",
  className,
}: BookStayLinkProps) {
  const href = buildBookingUrl() || "/contact"

  return (
    <a
      href={href}
      onClick={() => track("booking_handoff_clicked", { source })}
      className={cn(buttonVariants({ variant, size, shape }), "group/button", className)}
    >
      {label}
      <ArrowRight
        aria-hidden="true"
        strokeWidth={1.5}
        className="transition-transform duration-hover ease-soft group-hover/button:translate-x-1"
      />
    </a>
  )
}
