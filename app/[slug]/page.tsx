import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageHeader } from "@/components/page/page-header"
import { PageSections } from "@/components/page/page-sections"
import { getPage, getPageSlugs, getSiteSettings } from "@/lib/content"
import { pathForDocument } from "@/lib/content/routes"
import { pageMetadata } from "@/lib/seo/metadata"
import { PageContentFallback } from "@/components/ui/page-content-fallback"

/**
 * Flexible marketing pages (About, Sustainability, Training, Privacy, …).
 * Static routes such as /offers take precedence over this segment.
 */

/** Cache Components needs at least one param, so a placeholder (which 404s) stands in when there are none. */
export async function generateStaticParams() {
  const slugs = await getPageSlugs()
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "__placeholder__" }]
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const [page, settings] = await Promise.all([getPage(slug), getSiteSettings()])
  if (!page) notFound()

  return pageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: pathForDocument({ _type: "page", slug: page.slug }) ?? "/",
    siteName: settings.brandName,
    image: page.seo.image ?? page.hero.image ?? settings.seo.image,
    noIndex: page.seo.noIndex,
  })
}

export default function Page({ params }: PageProps<"/[slug]">) {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      {/* params are read inside the boundary so the route keeps one App Shell. */}
      <Suspense fallback={<PageContentFallback />}>
        <MarketingPageContent params={params} />
      </Suspense>
    </main>
  )
}

async function MarketingPageContent({ params }: Pick<PageProps<"/[slug]">, "params">) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <>
      <PageHeader hero={page.hero} />
      <PageSections sections={page.sections} />
    </>
  )
}
