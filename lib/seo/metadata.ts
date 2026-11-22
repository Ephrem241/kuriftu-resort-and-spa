import type { Metadata } from "next"

import { ogImage } from "@/lib/content/og"
import type { ContentImage } from "@/lib/content/types"

/** Shared by every page: a page's openGraph replaces the layout's (shallow merge). */
export const OG_LOCALE = "en_US"

type PageMetadataInput = {
  title: string
  description: string
  /** Site path, e.g. "/resorts/bishoftu"; resolved against metadataBase. */
  path: string
  siteName: string
  /** Share image: the editor's override first, then the page's hero. */
  image: ContentImage | null | undefined
  noIndex?: boolean
  /** Use the title as is, without the layout's "%s | brand" template. */
  titleAbsolute?: boolean
}

/** Title, description, canonical, Open Graph, Twitter and robots for one page. */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const description = input.description || undefined
  const images = input.image ? ogImage(input.image) : undefined

  return {
    title: input.titleAbsolute ? { absolute: input.title } : input.title,
    description,
    alternates: { canonical: input.path },
    openGraph: {
      type: "website",
      locale: OG_LOCALE,
      siteName: input.siteName,
      url: input.path,
      title: input.title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: images?.map((i) => i.url),
    },
    ...(input.noIndex && { robots: { index: false, follow: true } }),
  }
}
