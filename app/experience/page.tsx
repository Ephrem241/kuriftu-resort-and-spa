import { Suspense } from "react"
import type { Metadata } from "next"

import { ExperiencesBrowser, ExperiencesBrowserFallback } from "@/components/experiences/experiences-browser"
import { PageHero } from "@/components/ui/page-hero"
import { getExperiencesPage, getSiteSettings } from "@/lib/content"
import { pageMetadata } from "@/lib/seo/metadata"

const GRID_ID = "experiences"

function fallbackDescription(brandName: string) {
  return `Adventure, culture, nature and water experiences at ${brandName} across Ethiopia.`
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const page = await getExperiencesPage(fallbackDescription(settings.brandName))
  return pageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: "/experience",
    siteName: settings.brandName,
    image: page.seo.image ?? page.hero.image ?? page.experiences[0]?.image ?? settings.seo.image,
    noIndex: page.seo.noIndex,
  })
}

/** Every experience, filterable by type and destination (`?category=`, `?resort=`). */
export default async function ExperiencesPage() {
  const settings = await getSiteSettings()
  const page = await getExperiencesPage(fallbackDescription(settings.brandName))
  const browser = { experiences: page.experiences, id: GRID_ID }

  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <PageHero
        titleId="experiences-hero-title"
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        intro={page.hero.intro}
        image={page.hero.image}
        cta={{ label: "Explore Experiences", href: `#${GRID_ID}` }}
      />

      {/* The URL filters are read in the browser; the static HTML lists every experience. */}
      <Suspense fallback={<ExperiencesBrowserFallback {...browser} />}>
        <ExperiencesBrowser {...browser} />
      </Suspense>
    </main>
  )
}
