import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ExperienceDetail } from "@/components/experiences/experience-detail"
import { getExperiencePage, getExperienceSlugs, getSiteSettings } from "@/lib/content"
import { pathForDocument } from "@/lib/content/routes"
import { pageMetadata } from "@/lib/seo/metadata"

/** Cache Components needs at least one param, so a placeholder (which 404s) stands in when there are none. */
export async function generateStaticParams() {
  const slugs = await getExperienceSlugs()
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "__placeholder__" }]
}

export async function generateMetadata({ params }: PageProps<"/experience/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const [experience, settings] = await Promise.all([getExperiencePage(slug), getSiteSettings()])
  if (!experience) notFound()

  return pageMetadata({
    title: experience.seo.title,
    description: experience.seo.description,
    path: pathForDocument({ _type: "experience", slug: experience.slug }) ?? "/experience",
    siteName: settings.brandName,
    image: experience.seo.image ?? experience.images[0],
    noIndex: experience.seo.noIndex,
  })
}

export default function Page({ params }: PageProps<"/experience/[slug]">) {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      {/* params are read inside the boundary so the route keeps one App Shell. */}
      <Suspense fallback={<div aria-busy="true" className="min-h-[40rem]" />}>
        <ExperienceContent params={params} />
      </Suspense>
    </main>
  )
}

async function ExperienceContent({ params }: Pick<PageProps<"/experience/[slug]">, "params">) {
  const { slug } = await params
  const [experience, settings] = await Promise.all([getExperiencePage(slug), getSiteSettings()])
  if (!experience) notFound()

  return (
    <ExperienceDetail
      experience={experience}
      reservations={{ phone: settings.reservationPhone, email: settings.reservationEmail }}
    />
  )
}
