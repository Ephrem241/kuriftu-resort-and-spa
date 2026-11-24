import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PackageDetail } from "@/components/events/package-detail"
import { getEventPackagePage, getEventPackageSlugs, getSiteSettings } from "@/lib/content"
import { pathForDocument } from "@/lib/content/routes"
import { pageMetadata } from "@/lib/seo/metadata"
import { PageContentFallback } from "@/components/ui/page-content-fallback"

/** Cache Components needs at least one param, so a placeholder (which 404s) stands in when there are none. */
export async function generateStaticParams() {
  const slugs = await getEventPackageSlugs()
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "__placeholder__" }]
}

export async function generateMetadata({ params }: PageProps<"/event/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const [pkg, settings] = await Promise.all([getEventPackagePage(slug), getSiteSettings()])
  if (!pkg) notFound()

  return pageMetadata({
    title: pkg.seo.title,
    description: pkg.seo.description,
    path: pathForDocument({ _type: "eventPackage", slug: pkg.slug }) ?? "/event",
    siteName: settings.brandName,
    image: pkg.seo.image ?? pkg.images[0],
    noIndex: pkg.seo.noIndex,
  })
}

export default function Page({ params }: PageProps<"/event/[slug]">) {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      {/* params are read inside the boundary so the route keeps one App Shell. */}
      <Suspense fallback={<PageContentFallback />}>
        <PackageContent params={params} />
      </Suspense>
    </main>
  )
}

async function PackageContent({ params }: Pick<PageProps<"/event/[slug]">, "params">) {
  const { slug } = await params
  const pkg = await getEventPackagePage(slug)
  if (!pkg) notFound()
  return <PackageDetail pkg={pkg} />
}
