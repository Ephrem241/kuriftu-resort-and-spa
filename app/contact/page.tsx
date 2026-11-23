import type { Metadata } from "next"

import { ContactDetails } from "@/components/contact/contact-details"
import { ContactEnquiry } from "@/components/contact/contact-enquiry"
import { ResortDirectory } from "@/components/contact/resort-directory"
import { PageHero } from "@/components/ui/page-hero"
import { getContactPage, getSiteSettings } from "@/lib/content"
import { pageMetadata } from "@/lib/seo/metadata"

const FORM_ID = "contact-form"
const DIRECTORY_ID = "resort-contacts"

function fallbackDescription(brandName: string) {
  return `Contact ${brandName}: reservations, head office and every resort's own phone and email.`
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const page = await getContactPage(fallbackDescription(settings.brandName))
  return pageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/contact",
    siteName: settings.brandName,
    image: page.seo.image ?? page.hero.image ?? settings.seo.image,
    noIndex: page.seo.noIndex,
  })
}

/** Contact: site contacts, the general contact form, and each resort's own contacts. */
export default async function ContactPage() {
  const settings = await getSiteSettings()
  const page = await getContactPage(fallbackDescription(settings.brandName))

  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <PageHero
        titleId="contact-hero-title"
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        intro={page.hero.intro}
        image={page.hero.image}
        cta={{ label: "Send a Message", href: `#${FORM_ID}` }}
      />

      <ContactDetails reservations={page.reservations} headOffice={page.headOffice} social={settings.social} />

      <ContactEnquiry
        id={FORM_ID}
        content={page.form}
        resorts={page.resorts.map((r) => ({ slug: r.slug, heading: r.heading }))}
        reservationPhone={settings.reservationPhone}
      />

      <ResortDirectory id={DIRECTORY_ID} title={page.directoryTitle} resorts={page.resorts} />
    </main>
  )
}
