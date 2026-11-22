import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { client } from "@/sanity/lib/client"
import { sanityFetch } from "@/sanity/lib/fetch"
import {
  HOME_PAGE_QUERY,
  RESORT_PAGE_QUERY,
  RESORT_SLUGS_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/queries"

import { mapHomePage, mapResortPage, mapSiteSettings } from "./map"
import type { HomePage, ResortPage, SiteSettings } from "./types"

/**
 * Server-only content access. Each getter is cached and tagged with the
 * document types it reads; the revalidate webhook expires those tags.
 *
 * A missing singleton is an error: the build fails loudly rather than
 * rendering placeholder content.
 */

/** Types any link or card on a page can point at. */
const LINKED_TYPES = ["resort", "room", "experience", "spaTreatment", "eventPackage", "offer", "page"]

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache"
  const tags = ["siteSettings", ...LINKED_TYPES]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: SITE_SETTINGS_QUERY, tags })
  const year = new Date().getFullYear()
  if (!doc) throw missing("siteSettings")
  return mapSiteSettings(doc, year)
}

export async function getHomePage(): Promise<HomePage> {
  "use cache"
  const tags = ["homePage", ...LINKED_TYPES]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: HOME_PAGE_QUERY, tags })
  if (!doc) throw missing("homePage")
  return mapHomePage(doc)
}

/** Every resort slug, read from the API (not the CDN) for static params. */
export async function getResortSlugs(): Promise<string[]> {
  "use cache"
  cacheTag("resort")
  cacheLife("days")
  return client.withConfig({ useCdn: false }).fetch(RESORT_SLUGS_QUERY)
}

/** One resort with its rooms, experiences, spa and dining; null if unknown. */
export async function getResortPage(slug: string): Promise<ResortPage | null> {
  "use cache"
  const tags = ["resort", `resort:${slug}`, "room", "experience", "spaTreatment", "diningVenue"]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: RESORT_PAGE_QUERY, params: { slug }, tags })
  return doc ? mapResortPage(doc) : null
}

function missing(type: string) {
  return new Error(`Missing published "${type}" document in Sanity`)
}

export type * from "./types"
