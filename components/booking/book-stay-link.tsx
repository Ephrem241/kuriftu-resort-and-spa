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
  /** Resort slug, for analytics. */
  resort?: string
  /** TravelBook property id; sent only once its param is verified. */
  propertyId?: string | null
  label?: string
  className?: string
}

/** "Book Your Stay" hand-off to the booking engine, optionally for one resort. */
export function BookStayLink({
  source,
  resort,
  propertyId,
  label = "Book Your Stay",
  variant = "primary",
  size = "pill",
  shape = "pill",
  className,
}: BookStayLinkProps) {
  const href = buildBookingUrl({ propertyId }) || "/contact"

  return (
    <a
      href={href}
      onClick={() => track("booking_handoff_clicked", { source, ...(resort && { resort }) })}
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
