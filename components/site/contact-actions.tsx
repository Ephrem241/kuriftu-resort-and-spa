import { Mail, Phone } from "lucide-react"

import { ContactLink } from "@/components/site/contact-link"
import { buttonVariants } from "@/components/ui/button"
import type { PropertyContact } from "@/lib/content/types"
import { cn } from "@/lib/utils"

/**
 * "Call …" and "Email Us" pills on a forest panel, for properties that take
 * enquiries instead of online bookings. Renders nothing without contacts.
 */
export function ContactActions({
  phone,
  email,
  source,
  className,
}: PropertyContact & { source: string; className?: string }) {
  if (!phone && !email) return null

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {phone ? (
        <ContactLink
          method="phone"
          source={source}
          href={`tel:${phone.tel}`}
          className={cn(
            buttonVariants({ variant: "accent", size: "pill", shape: "pill" }),
            "text-forest hover:text-ivory"
          )}
        >
          <Phone aria-hidden="true" strokeWidth={1.5} />
          Call {phone.display}
        </ContactLink>
      ) : null}
      {email ? (
        <ContactLink
          method="email"
          source={source}
          href={`mailto:${email}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "pill", shape: "pill" }),
            "border-ivory text-ivory hover:bg-ivory hover:text-forest"
          )}
        >
          <Mail aria-hidden="true" strokeWidth={1.5} />
          Email Us
        </ContactLink>
      ) : null}
    </div>
  )
}
