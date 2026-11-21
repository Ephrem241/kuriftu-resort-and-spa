import "server-only"

import { cacheLife } from "next/cache"

import { seedHomePage, seedSiteSettings } from "./seed"
import type { HomePage, SiteSettings } from "./types"

/**
 * Server-only content access. Backed by seed data for now; the Sanity step
 * swaps these bodies for GROQ fetches with the same return types.
 */

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache"
  cacheLife("hours")
  return { ...seedSiteSettings, copyrightYear: new Date().getFullYear() }
}

export async function getHomePage(): Promise<HomePage> {
  "use cache"
  cacheLife("hours")
  return seedHomePage
}

export type * from "./types"
