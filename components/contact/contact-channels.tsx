import { Mail, MapPin, Phone } from "lucide-react"

import { ContactLink } from "@/components/site/contact-link"
import { addressLines } from "@/lib/content/contact"
import type { ContactChannels, PostalAddress } from "@/lib/content/types"
import { cn } from "@/lib/utils"

const SOURCE = "contact"

/** Phones, emails and an address as an icon list, each phone and email tappable. */
export function ChannelList({
  channels,
  address = null,
  className,
}: {
  channels: ContactChannels
  address?: PostalAddress | null
  className?: string
}) {
  const lines = addressLines(address)
  return (
    <ul className={cn("flex flex-col gap-3 text-small text-charcoal", className)}>
      {channels.phones.map((phone) => (
        <li key={phone.tel} className="flex items-start gap-3">
          <Phone aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-forest" />
          <span>
            {phone.label ? <span className="block text-caption text-charcoal">{phone.label}</span> : null}
            <ContactLink
              method="phone"
              source={SOURCE}
              href={`tel:${phone.tel}`}
              className="font-bold text-forest underline-offset-4 hover:underline"
            >
              {phone.display}
            </ContactLink>
          </span>
        </li>
      ))}
      {channels.emails.map((email) => (
        <li key={email.address} className="flex items-start gap-3">
          <Mail aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-forest" />
          <span className="min-w-0">
            {email.label ? <span className="block text-caption text-charcoal">{email.label}</span> : null}
            <ContactLink
              method="email"
              source={SOURCE}
              href={`mailto:${email.address}`}
              className="font-bold break-words text-forest underline-offset-4 hover:underline"
            >
              {email.address}
            </ContactLink>
          </span>
        </li>
      ))}
      {lines.length > 0 ? (
        <li className="flex items-start gap-3">
          <MapPin aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-forest" />
          <address className="not-italic">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        </li>
      ) : null}
    </ul>
  )
}
