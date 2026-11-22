import type { MetadataRoute } from "next"

import { getSitemapEntries } from "@/lib/content"
import { absoluteUrl } from "@/lib/seo/site-url"

/**
 * Built pages only (home, resorts, rooms). Each new page type adds itself to
 * SITEMAP_QUERY when it ships. Revalidated by the Sanity webhook tags.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSitemapEntries()
  return entries.map((e) => ({ url: absoluteUrl(e.path), lastModified: e.lastModified }))
}
