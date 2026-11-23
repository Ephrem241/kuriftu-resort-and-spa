import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { SectionHeading } from "@/components/ui/section-heading"
import { pathForDocument } from "@/lib/content/routes"
import type { ResortContact } from "@/lib/content/types"

import { ChannelList } from "./contact-channels"

/** Every resort with its own reservation phone, email and address. */
export function ResortDirectory({ id, title, resorts }: { id: string; title: string; resorts: ResortContact[] }) {
  if (resorts.length === 0) return null

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="container-site pb-16 lg:pb-20">
      <SectionHeading id={`${id}-title`} title={title} subtitle="Reach each destination directly" />
      <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-6">
        {resorts.map((resort) => {
          const href = pathForDocument({ _type: "resort", slug: resort.slug })
          return (
            <li key={resort.slug}>
              <article className="flex h-full flex-col rounded-md border border-line bg-card p-5 lg:p-6">
                <h3 className="text-h4">{resort.heading}</h3>
                {resort.locationLabel ? <p className="eyebrow mt-1 text-forest">{resort.locationLabel}</p> : null}
                <ChannelList
                  channels={{ phones: resort.phones.slice(0, 2), emails: resort.emails.slice(0, 1) }}
                  address={resort.address}
                  className="mt-4 flex-1"
                />
                {href ? (
                  <Link
                    href={href}
                    aria-label={`View ${resort.heading}`}
                    className="eyebrow group/link mt-5 inline-flex items-center gap-2 self-start text-forest hover:text-gold"
                  >
                    View resort
                    <ArrowRight
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="size-4 transition-transform duration-hover ease-soft group-hover/link:translate-x-1"
                    />
                  </Link>
                ) : null}
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
