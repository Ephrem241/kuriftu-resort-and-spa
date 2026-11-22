import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { sanityFetch } from "@/sanity/lib/fetch"
import { HOME_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries"

import { mapHomePage, mapSiteSettings } from "./map"
import { seedHomePage, seedSiteSettings } from "./seed"
import type { HomePage, SiteSettings } from "./types"

/**
 * Server-only content access. Each getter is cached and tagged with the
 * document types it reads; the revalidate webhook expires those tags.
 *
 * Until content is migrated, a missing singleton falls back to seed data
 * (removed in the migration prompt).
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
  if (!doc) {
    warnFallback("siteSettings")
    return { ...seedSiteSettings, copyrightYear: year }
  }
  return mapSiteSettings(doc, year)
}

export async function getHomePage(): Promise<HomePage> {
  "use cache"
  const tags = ["homePage", ...LINKED_TYPES]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: HOME_PAGE_QUERY, tags })
  if (!doc) {
    warnFallback("homePage")
    return seedHomePage
  }
  return mapHomePage(doc)
}

function warnFallback(type: string) {
  console.warn(`[content] No published "${type}" document in Sanity; using seed content.`)
}

export type * from "./types"
