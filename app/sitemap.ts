import type { MetadataRoute } from "next"

import { getOffers, getSitemapEntries } from "@/lib/content"
import { offerSitemapEntries } from "@/lib/content/map"
import { absoluteUrl } from "@/lib/seo/site-url"

/**
 * Built pages only (home, destinations, resorts, rooms, experiences, wellness, offers). Each new page type adds
 * itself when it ships. Revalidated by the Sanity webhook tags; offers also
 * drop out on their own when they end (see getOffers).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [entries, offers] = await Promise.all([getSitemapEntries(), getOffers()])
  return [
    ...entries.map((e) => ({ url: absoluteUrl(e.path), lastModified: e.lastModified })),
    { url: absoluteUrl("/destinations") },
    { url: absoluteUrl("/experience") },
    { url: absoluteUrl("/offers") },
    ...offerSitemapEntries(offers).map((e) => ({ url: absoluteUrl(e.path), lastModified: e.lastModified })),
  ]
}
