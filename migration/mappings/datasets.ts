/**
 * Locates each dataset in the extracted bundle literals by its shape. Every
 * picker must match exactly one literal, so a changed bundle fails the
 * transform loudly instead of importing partial content.
 */
import type { Json, Literal } from "../scripts/lib/literals"
import { textOf } from "../scripts/lib/jsx"

export const RESORT_SLUGS = ["arba-minch", "entoto", "bishoftu", "laketana", "awash", "thepalm", "africanVillage", "waterpark", "boston"] as const
export type LegacySlug = (typeof RESORT_SLUGS)[number]

type Obj = Record<string, Json>
const isObj = (v: Json | undefined): v is Obj => !!v && typeof v === "object" && !Array.isArray(v)
const isArr = (v: Json | undefined): v is Json[] => Array.isArray(v)

/** Literal keyed by resort slug, where at least `minResorts` values satisfy `test`. */
function perResort(literals: Literal[], label: string, test: (value: Obj) => boolean, minResorts: number): Record<string, Obj> {
  const matches = literals.filter(({ value }) => {
    if (!isObj(value)) return false
    const keys = Object.keys(value)
    if (!keys.every((k) => (RESORT_SLUGS as readonly string[]).includes(k))) return false
    return keys.filter((k) => isObj(value[k]) && test(value[k] as Obj)).length >= minResorts
  })
  if (matches.length !== 1) throw new Error(`Dataset "${label}": expected 1 match, found ${matches.length}`)
  return matches[0].value as Record<string, Obj>
}

function one<T extends Json>(literals: Literal[], label: string, test: (value: Json) => boolean): T {
  const matches = literals.filter(({ value }) => test(value))
  if (matches.length !== 1) throw new Error(`Dataset "${label}": expected 1 match, found ${matches.length}`)
  return matches[0].value as T
}

const has = (o: Obj, ...keys: string[]) => keys.every((k) => k in o)
const jsxContaining = (needle: string, rootClass: string) => (v: Json) =>
  isObj(v) && typeof v.$el === "string" && String((v.props as Obj | undefined)?.className ?? "").includes(rootClass) && textOf(v).includes(needle)

export function pickDatasets(literals: Literal[]) {
  const resorts = perResort(literals, "resorts", (v) => has(v, "latitude", "longitude", "phone", "cover_image"), 9)
  const locationLabels = one<Record<string, string>>(
    literals,
    "location labels",
    (v) => isObj(v) && RESORT_SLUGS.every((s) => typeof v[s] === "string") && Object.keys(v).length === RESORT_SLUGS.length,
  )
  const galleries = one<Record<string, string[]>>(
    literals,
    "galleries",
    (v) => isObj(v) && RESORT_SLUGS.every((s) => isArr(v[s])) && isArr(v.bishoftu) && typeof (v.bishoftu as Json[])[0] === "string",
  )
  const destinations = one<Obj[]>(literals, "destinations list", (v) => isArr(v) && v.length >= 8 && v.every((d) => isObj(d) && has(d, "isShow", "slug", "name", "coordinates")))
  const featured = one<Obj>(
    literals,
    "featured destinations",
    (v) => isObj(v) && isArr(v.featured) && v.featured.length >= 6 && v.featured.every((d) => isObj(d) && has(d, "slug", "distance")),
  )
  const accommodation = perResort(literals, "accommodation", (v) => isArr(v.accomodations), 6)
  const rooms = perResort(literals, "rooms", (v) => Object.values(v).some((r) => isObj(r) && has(r, "title", "carouselImages", "amenities")), 6)
  const dining = perResort(literals, "dining", (v) => isArr(v.diningOptions), 7)
  const wellness = perResort(literals, "wellness", (v) => isArr(v.wellness) && isArr(v.facilities), 7)
  const celebrations = perResort(literals, "celebrations", (v) => isArr(v.events) && isArr(v.venus), 7)
  const corporate = perResort(literals, "corporate", (v) => isArr(v.celebrations) && isArr(v.venus), 7)
  const experiences = perResort(literals, "experiences", (v) => isArr(v.items) && isArr(v.experiences), 6)
  const adventures = perResort(literals, "adventures", (v) => isArr(v.adventures), 4)
  const boston = one<Obj>(literals, "boston details", (v) => isObj(v) && v.name === "Boston Day Spa" && isArr(v.items) && isObj(v.art))
  const packages = one<Obj[]>(literals, "celebration packages", (v) => isArr(v) && v.length > 0 && v.every((p) => isObj(p) && has(p, "id", "basePackage", "includes")))
  const about = one<Obj>(literals, "about", (v) => isObj(v) && has(v, "hero", "story", "discover"))
  const privacy = one<Obj[]>(
    literals,
    "privacy policy",
    (v) => isArr(v) && v.length > 5 && v.every((s) => isObj(s) && has(s, "title", "body")) && /kurifturesorts\.com/.test(JSON.stringify(v)),
  )
  const offerPopup = one<Json>(literals, "offer popup", jsxContaining("November stay", "popup"))
  const footer = one<Json>(literals, "site footer", jsxContaining("Follow for exclusive updates", "site-footer"))
  const instagram = one<Record<string, string>>(
    literals,
    "instagram accounts",
    (v) => isObj(v) && typeof v.default === "string" && Object.values(v).every((u) => typeof u === "string" && u.includes("instagram.com")),
  )
  const pages = {
    sustainability: one<Json>(literals, "sustainability page", jsxContaining("Sustainability", "sust-page")),
    ceo: one<Json>(literals, "ceo page", jsxContaining("Founder & Chief Executive Officer", "sust-page")),
    "coming-soon": one<Json>(literals, "coming soon page", jsxContaining("A New Chapter of Experiences", "sust-page")),
    training: one<Json>(literals, "training page", jsxContaining("Investing in People", "sust-page")),
    "pan-african-roadshow": one<Json>(literals, "roadshow page", jsxContaining("Roadshow", "par-page")),
  }

  return { resorts, locationLabels, galleries, destinations, featured, accommodation, rooms, dining, wellness, celebrations, corporate, experiences, adventures, boston, packages, about, privacy, offerPopup, footer, instagram, pages }
}

export type Datasets = ReturnType<typeof pickDatasets>
