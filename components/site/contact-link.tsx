"use client"

import type { ReactNode } from "react"

import { track } from "@/lib/analytics"

/** tel:/mailto: link that records an outbound call or email tap. */
export function ContactLink({
  method,
  href,
  className,
  source = "footer",
  children,
}: {
  method: "phone" | "email"
  href: string
  className?: string
  /** Where the tap came from, for analytics. */
  source?: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => track("contact_tap", { method, source })}
    >
      {children}
    </a>
  )
}
