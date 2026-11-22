import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

import { BookStayLink } from "@/components/booking/book-stay-link"
import { analyticsEnabled } from "@/lib/analytics/posthog"
import { getSiteSettings } from "@/lib/content"

import { ContactLink } from "./contact-link"
import { CookieSettingsButton } from "./cookie-settings-button"
import { Wordmark } from "./wordmark"

const headingClass = "border-b border-ivory/15 pb-3 font-sans text-small font-bold text-ivory"
const linkClass = "text-small text-ivory/85 transition-colors duration-hover hover:text-gold"

export async function SiteFooter() {
  const settings = await getSiteSettings()

  const columns = [
    ...settings.footerColumns,
    {
      title: "Our Resorts",
      links: settings.navResorts.map((r) => ({ label: r.name, href: `/resorts/${r.slug}` })),
    },
  ]

  return (
    <footer className="bg-forest text-ivory">
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.3fr_auto] lg:gap-0 lg:py-12">
        <div className="lg:border-r lg:border-ivory/15 lg:pr-10">
          <Link href="/" aria-label={`${settings.brandName}, home`} className="inline-block">
            <Wordmark tone="ivory" size="lg" />
          </Link>
          <p className="accent mt-4 text-small text-ivory">{settings.footerTagline}</p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="lg:px-8">
            <h2 className={headingClass}>{col.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="lg:border-l lg:border-ivory/15 lg:px-8">
          <h2 className={headingClass}>Contact Us</h2>
          <ul className="mt-4 space-y-3 text-small">
            {settings.reservationPhone && (
              <li>
                <ContactLink
                  method="phone"
                  href={`tel:${settings.reservationPhone.tel}`}
                  className={`${linkClass} inline-flex items-center gap-3`}
                >
                  <Phone aria-hidden="true" strokeWidth={1.5} className="size-4 text-ivory" />
                  {settings.reservationPhone.display}
                </ContactLink>
              </li>
            )}
            {settings.reservationEmail && (
              <li>
                <ContactLink
                  method="email"
                  href={`mailto:${settings.reservationEmail}`}
                  className={`${linkClass} inline-flex items-center gap-3`}
                >
                  <Mail aria-hidden="true" strokeWidth={1.5} className="size-4 text-ivory" />
                  {settings.reservationEmail}
                </ContactLink>
              </li>
            )}
            {settings.address && (
              <li className="flex items-center gap-3 text-ivory/85">
                <MapPin aria-hidden="true" strokeWidth={1.5} className="size-4 text-ivory" />
                {settings.address}
              </li>
            )}
          </ul>
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <BookStayLink
            source="footer"
            variant="accent"
            className="w-full text-charcoal hover:bg-ivory hover:text-forest md:w-auto"
          />
        </div>
      </div>

      <div className="border-t border-ivory/15">
        <div className="container-site flex flex-col gap-3 py-5 text-caption md:flex-row md:items-center md:justify-between">
          <p className="text-ivory/85">
            © {settings.copyrightYear} Kuriftu Resorts. All rights reserved.
          </p>
          <ul className="flex items-center gap-3">
            {settings.legalLinks.map((link, i) => (
              <li key={link.href} className="flex items-center gap-3">
                {i > 0 ? <span aria-hidden="true" className="h-3 w-px bg-gold/60" /> : null}
                <Link href={link.href} className="text-gold hover:text-ivory">
                  {link.label}
                </Link>
              </li>
            ))}
            {analyticsEnabled() ? (
              <li className="flex items-center gap-3">
                {settings.legalLinks.length > 0 ? (
                  <span aria-hidden="true" className="h-3 w-px bg-gold/60" />
                ) : null}
                <CookieSettingsButton className="cursor-pointer text-gold hover:text-ivory" />
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </footer>
  )
}
