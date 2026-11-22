import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { client } from "@/sanity/lib/client"
import { sanityFetch } from "@/sanity/lib/fetch"
import {
  HOME_PAGE_QUERY,
  RESORT_PAGE_QUERY,
  RESORT_SLUGS_QUERY,
  ROOM_PAGE_QUERY,
  ROOM_PARAMS_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/queries"

import { mapHomePage, mapResortPage, mapRoomPage, mapSiteSettings } from "./map"
import type { HomePage, ResortPage, RoomPage, SiteSettings } from "./types"

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

/** Every { slug, room } pair, read from the API (not the CDN) for static params. */
export async function getRoomParams(): Promise<{ slug: string; room: string }[]> {
  "use cache"
  cacheTag("room", "resort")
  cacheLife("days")
  const rows = await client.withConfig({ useCdn: false }).fetch(ROOM_PARAMS_QUERY)
  return rows.flatMap((r) => (r.slug && r.room ? [{ slug: r.slug, room: r.room }] : []))
}

/** One room of one resort, with sibling rooms; null if unknown or at another resort. */
export async function getRoomPage(resort: string, room: string): Promise<RoomPage | null> {
  "use cache"
  const tags = ["room", `room:${room}`, "resort", `resort:${resort}`]
  cacheTag(...tags)
  cacheLife("days")

  const doc = await sanityFetch({ query: ROOM_PAGE_QUERY, params: { resort, room }, tags })
  return doc ? mapRoomPage(doc) : null
}

function missing(type: string) {
  return new Error(`Missing published "${type}" document in Sanity`)
}

export type * from "./types"
