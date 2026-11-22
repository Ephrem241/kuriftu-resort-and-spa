import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { sanityFetch } from "@/sanity/lib/fetch"
import { HOME_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries"

import { mapHomePage, mapSiteSettings } from "./map"
import type { HomePage, SiteSettings } from "./types"

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

function missing(type: string) {
  return new Error(`Missing published "${type}" document in Sanity`)
}

export type * from "./types"
