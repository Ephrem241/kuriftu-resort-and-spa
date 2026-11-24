import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { OfferDetail } from "@/components/offers/offer-detail"
import { OfferViewed } from "@/components/offers/offer-viewed"
import { getOfferPage, getOffers, getSiteSettings } from "@/lib/content"
import { pathForDocument } from "@/lib/content/routes"
import { pageMetadata } from "@/lib/seo/metadata"
import { PageContentFallback } from "@/components/ui/page-content-fallback"

/**
 * Live offers only. Cache Components needs at least one param to validate
 * the route, so a placeholder (which 404s) stands in when none is live.
 */
export async function generateStaticParams() {
  const offers = await getOffers()
  return offers.length > 0 ? offers.map((o) => ({ slug: o.slug })) : [{ slug: "__placeholder__" }]
}

export async function generateMetadata({ params }: PageProps<"/offers/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const [offer, settings] = await Promise.all([getOfferPage(slug), getSiteSettings()])
  if (!offer) notFound()

  return pageMetadata({
    title: offer.seo.title,
    description: offer.seo.description,
    path: offerPath(offer.slug),
    siteName: settings.brandName,
    image: offer.seo.image ?? offer.image,
    noIndex: offer.seo.noIndex,
  })
}

function offerPath(slug: string) {
  return pathForDocument({ _type: "offer", slug }) ?? `/offers/${encodeURIComponent(slug)}`
}

export default function Page({ params }: PageProps<"/offers/[slug]">) {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      {/* params are read inside the boundary so the route keeps one App Shell. */}
      <Suspense fallback={<PageContentFallback />}>
        <OfferContent params={params} />
      </Suspense>
    </main>
  )
}

async function OfferContent({ params }: Pick<PageProps<"/offers/[slug]">, "params">) {
  const { slug } = await params
  const [offer, settings] = await Promise.all([getOfferPage(slug), getSiteSettings()])
  if (!offer) notFound()

  return (
    <>
      <OfferViewed offer={offer.slug} source="offer_page" />
      <OfferDetail
        offer={offer}
        reservations={{ phone: settings.reservationPhone, email: settings.reservationEmail }}
      />
    </>
  )
}
