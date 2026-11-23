import { SOCIAL_LABELS, SocialIcon } from "@/components/ui/social-icon"
import { hasChannels } from "@/lib/content/contact"
import type { ContactPage, SocialLink } from "@/lib/content/types"

import { ChannelList } from "./contact-channels"

type ContactDetailsProps = {
  reservations: ContactPage["reservations"]
  headOffice: ContactPage["headOffice"]
  social: SocialLink[]
}

/** Reservations and head-office cards from Site settings, then the social links. Empty cards are hidden. */
export function ContactDetails({ reservations, headOffice, social }: ContactDetailsProps) {
  const cards = [
    { id: "contact-reservations", title: "Reservations", channels: reservations, address: null },
    { id: "contact-head-office", title: "Head Office", channels: headOffice, address: headOffice.address },
  ].filter((c) => hasChannels(c.channels) || c.address)

  if (cards.length === 0 && social.length === 0) return null

  return (
    <div className="container-site pt-12 lg:pt-16">
      {cards.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2 lg:gap-6">
          {cards.map((card) => (
            <li key={card.id}>
              <section aria-labelledby={card.id} className="h-full rounded-xl bg-beige p-6 lg:p-8">
                <h2 id={card.id} className="text-h4">
                  {card.title}
                </h2>
                <span aria-hidden="true" className="mt-3 block h-px w-12 bg-gold" />
                <ChannelList channels={card.channels} address={card.address} className="mt-5" />
              </section>
            </li>
          ))}
        </ul>
      ) : null}

      {social.length > 0 ? (
        <section aria-labelledby="contact-social" className="mt-8 flex flex-col items-center gap-3 text-center">
          <h2 id="contact-social" className="eyebrow text-forest">
            Follow Us
          </h2>
          <ul className="flex items-center gap-4">
            {social.map((s) => (
              <li key={s.platform}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${SOCIAL_LABELS[s.platform]} (opens in a new tab)`}
                  className="flex size-11 items-center justify-center text-forest transition-colors duration-hover hover:text-gold"
                >
                  <SocialIcon platform={s.platform} className="size-6" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
