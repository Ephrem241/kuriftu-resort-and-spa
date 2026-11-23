import { Suspense } from "react"
import type { Metadata } from "next"

import { GalleryBrowser, GalleryBrowserFallback } from "@/components/gallery/gallery-browser"
import { PageHero } from "@/components/ui/page-hero"
import { getGalleryPage, getSiteSettings } from "@/lib/content"
import { pageMetadata } from "@/lib/seo/metadata"

const PHOTOS_ID = "photos"

function fallbackDescription(brandName: string) {
  return `Photos of ${brandName} resorts, spas and adventure parks across Ethiopia.`
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const page = await getGalleryPage(fallbackDescription(settings.brandName))
  return pageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/gallery",
    siteName: settings.brandName,
    image: page.seo.image ?? page.hero.image ?? settings.seo.image,
    noIndex: page.seo.noIndex,
  })
}

/** Gallery: every resort's photos, filterable by resort, with a lightbox. */
export default async function GalleryPage() {
  const settings = await getSiteSettings()
  const page = await getGalleryPage(fallbackDescription(settings.brandName))
  const browser = { id: PHOTOS_ID, resorts: page.resorts, photos: page.photos }

  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <PageHero
        titleId="gallery-hero-title"
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        intro={page.hero.intro}
        image={page.hero.image}
        cta={{ label: "View Photos", href: `#${PHOTOS_ID}` }}
      />

      {/* `?resort=` is read in the browser; the static HTML lists every photo. */}
      <Suspense fallback={<GalleryBrowserFallback {...browser} />}>
        <GalleryBrowser {...browser} />
      </Suspense>
    </main>
  )
}
