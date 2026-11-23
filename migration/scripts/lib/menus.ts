import { ORIGIN } from "./paths"

/** Hosts the old site served menu PDFs from. Nothing else is fetched. */
const MENU_HOSTS = new Set([
  "www.kurifturesorts.com",
  "kuriftu-media.s3.amazonaws.com",
  "kuriftu-media.s3.us-east-1.amazonaws.com",
])

export type MenuSource = { url: string; label: string }

/**
 * A dining venue's menu PDF from the old site's `menuLink`: made absolute,
 * restricted to the known hosts and `.pdf`, and skipped when listed in
 * `notDiningMenus` (links that are not menus). The label comes from the file
 * name ("Beverage menu", "À la carte menu", or "Menu").
 */
export function menuSource(raw: string | undefined, notMenus: readonly string[]): MenuSource | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  let url: URL
  try {
    url = new URL(trimmed.startsWith("/") ? `${ORIGIN}${trimmed}` : trimmed)
  } catch {
    return null
  }
  if (url.protocol !== "https:" || !MENU_HOSTS.has(url.hostname) || !/\.pdf$/i.test(url.pathname)) return null
  const href = url.toString()
  if (notMenus.includes(href) || notMenus.includes(trimmed)) return null

  const name = decodeURIComponent(url.pathname).replace(/\+/g, " ").toLowerCase()
  const label = name.includes("beverage") ? "Beverage menu" : name.includes("carte") ? "À la carte menu" : "Menu"
  return { url: href, label }
}
