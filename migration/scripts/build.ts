/**
 * Pure mapping from the picked source datasets to Sanity documents. No I/O:
 * images come from the registry (which knows which URLs are reachable) and
 * every judgement call is logged on the report.
 */
import type { Datasets, LegacySlug } from "../mappings/datasets"
import { RESORT_SLUGS } from "../mappings/datasets"
import { clean, kebab, stableKey, summary, truncate } from "./lib/ids"
import type { SanityImage } from "./lib/images"
import { ImageRegistry } from "./lib/images"
import { groupPage, linearize, textOf, type PageContent } from "./lib/jsx"
import type { Json } from "./lib/literals"
import { parsePhones } from "./lib/phone"
import { listToBlocks, textToBlocks, toBlocks, type Block, type TextPart } from "./lib/portable-text"
import type { Report } from "./lib/report"

export type Doc = { _id: string; _type: string } & Record<string, unknown>
export interface Redirect {
  source: string
  destination: string
}

interface Hints {
  types: Record<string, string>
  notBookable: string[]
  taglines: Record<string, string>
  address: Record<string, { streetAddress?: string; region?: string }>
  footerOrder: string[]
  notVenues: Record<string, string[]>
  notDiningVenues: string[]
  wellnessFacilities: Record<string, string[]>
  packageResorts: Record<string, string[]>
  offer: { resort: string; startDate: string; endDate: string }
}

interface Categories {
  experience: { default: string; rules: [string, string][] }
  spaTreatment: { default: string; rules: [string, string][] }
  amenityIcon: { rules: [string, string][] }
}

interface HomeMapping {
  heroSlides: { image: string; eyebrow: string; title: string; text: string }[]
  destinations: { title: string; subtitle: string; resorts: string[] }
  experience: { title: string; pillars: { icon: string; title: string; subtitle: string; path: string }[]; image: string }
  rooms: { title: string; subtitle: string; items: { resort: string; legacyId: string }[] }
  offersPanel: { title: string; text: string; ctaLabel: string; image: string }
  testimonials: { title: string; subtitle: string; backgroundImage: string }
  stayConnected: { title: string; subtitle: string }
}

export interface BuildInput {
  ds: Datasets
  hints: Hints
  categories: Categories
  home: HomeMapping
  meta: { siteDescription: string; brandName: string; footerTagline: string }
}

type Obj = Record<string, Json>
const str = (v: Json | undefined): string => (typeof v === "string" ? clean(v) : "")
const arr = (v: Json | undefined): Json[] => (Array.isArray(v) ? v : [])
const objs = (v: Json | undefined): Obj[] => arr(v).filter((x): x is Obj => !!x && typeof x === "object" && !Array.isArray(x))
const norm = (s: string) => clean(s).toLowerCase().replace(/^the\s+/, "").replace(/[^a-z0-9]+/g, "")
const ref = (id: string, key?: string) => ({ _type: "reference", _ref: id, ...(key ? { _key: stableKey("ref", id, key) } : {}) })

/** Removes undefined values and empty arrays/objects so they stay unset in Sanity. */
export function compact<T>(value: T): T {
  if (Array.isArray(value)) return value.map(compact).filter((v) => v !== undefined) as T
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      const c = compact(v)
      if (c === undefined || c === null || c === "") continue
      // Portable Text expects these even when empty.
      if (Array.isArray(c) && c.length === 0 && k !== "markDefs" && k !== "marks") continue
      if (typeof c === "object" && !Array.isArray(c) && Object.keys(c).length === 0) continue
      out[k] = c
    }
    return out as T
  }
  return value
}

/** Words that stay upper case when an ALL CAPS label is sentence-cased. */
const ACRONYMS = new Set(["TV", "HDTV", "PBX", "COVID", "USB", "AC", "A/C", "WIFI", "WI-FI"])
/** Place names that keep a capital ("RIFT VALLEY VIEWS" → "Rift Valley views"). */
const PROPER_NOUNS = new Set(["NECHISAR", "RIFT", "VALLEY", "ABAYA", "CHAMO", "TANA", "ENTOTO", "AWASH", "BISHOFTU", "ETHIOPIAN", "AFRICAN"])

/** "PRIVATE POOL" → "Private pool". Labels with any lower case are kept as written. */
export function sentenceCase(label: string): string {
  if (label !== label.toUpperCase()) return label
  const words = label.split(" ").map((w) => {
    const bare = w.replace(/[^A-Z/-]/g, "")
    if (ACRONYMS.has(bare)) return w
    const lower = w.toLowerCase()
    return PROPER_NOUNS.has(bare) ? lower.replace(/[a-z]/, (c) => c.toUpperCase()) : lower
  })
  const text = words.join(" ")
  const first = text.search(/[a-zA-Z]/)
  return first < 0 ? text : text.slice(0, first) + text.charAt(first).toUpperCase() + text.slice(first + 1)
}

/** Bed configuration from a room's own amenity line, e.g. "KING OR TWIN BED" → "King or twin bed". */
export function bedFromAmenities(labels: string[]): string | undefined {
  const line = labels.map(clean).find((l) => /\bbeds?\b/i.test(l))
  if (!line) return undefined
  // "KING SIZE BED / ELECTRIC BED WARMER" → keep only the part naming the bed.
  const part = line.split("/").map((p) => p.trim()).find((p) => /\bbeds?\b/i.test(p) && !/warmer/i.test(p)) ?? line
  return sentenceCase(part)
}

function categorize(rules: [string, string][], fallback: string, title: string): { value: string; matched: boolean } {
  for (const [pattern, value] of rules) if (new RegExp(pattern, "i").test(title)) return { value, matched: true }
  return { value: fallback, matched: false }
}

export function build({ ds, hints, categories, home, meta }: BuildInput, images: ImageRegistry, report: Report) {
  const docs: Doc[] = []
  const redirects: Redirect[] = []
  const camelRedirects: Redirect[] = []

  const slugOf = (legacy: string) => kebab(legacy)
  const resortId = (legacy: string) => `resort.${slugOf(legacy)}`
  const resortName = new Map<string, string>()
  const resortHero = new Map<string, SanityImage>()
  const bookable = (legacy: string) => !hints.notBookable.includes(legacy)

  const amenity = (label: string, where: string) => {
    const icon = categorize(categories.amenityIcon.rules, "", label)
    return compact({ _type: "amenity", _key: stableKey(where, label), icon: icon.matched ? icon.value : undefined, label: sentenceCase(clean(label)) })
  }

  // ---------------------------------------------------------------- resorts
  for (const legacy of RESORT_SLUGS) {
    const r = ds.resorts[legacy]
    const slug = slugOf(legacy)
    const name = str(r.name)
    resortName.set(legacy, name)
    const fullName = str(ds.destinations.find((d) => d.slug === legacy)?.name) || name
    const where = `resort ${slug}`

    const gallery = images.images(arr(ds.galleries[legacy]), `${where} gallery`, (n) => `${fullName}, photo ${n}`)
    let heroImage = images.image(r.cover_image, `${where} hero`, `${fullName}`)
    if (!heroImage && gallery[0]) {
      heroImage = { ...gallery[0], _key: undefined }
      report.flag("resort hero", name, "Cover image unavailable; used the first gallery photo")
    }
    if (heroImage) {
      delete heroImage._key
      resortHero.set(legacy, heroImage)
    } else report.flag("resort hero", name, "No usable hero image (required)")

    const coverVideo = str(r.cover_video)
    let heroVideoUrl: string | undefined
    const youtube = coverVideo.match(/youtube\.com\/embed\/([\w-]{11})/)
    if (youtube) heroVideoUrl = `https://www.youtube.com/watch?v=${youtube[1]}`
    else if (coverVideo) report.skip("hero video", name, `Self-hosted video not allowed (${coverVideo})`)

    const { phones, rejected } = parsePhones(str(r.phone))
    for (const bad of rejected) report.flag("phone", name, `"${bad}" isn't a full number; not imported`)

    const dining = ds.dining[legacy]
    const wellness = ds.wellness[legacy]
    const celebrations = ds.celebrations[legacy]
    const corporate = ds.corporate[legacy]
    const highlights = [
      dining && { icon: "utensils", title: str(dining.title), text: str(dining.description) },
      wellness && { icon: "spa", title: str(wellness.title), text: str(wellness.description) },
      celebrations && { icon: "party-popper", title: str(celebrations.title), text: str(celebrations.description) },
      corporate && { icon: "presentation", title: str(corporate.title), text: str(corporate.description) },
      legacy === "boston" && { icon: "landmark", title: str((ds.boston.art as Obj).title), text: str((ds.boston.art as Obj).description) },
    ]
      .filter((h): h is { icon: string; title: string; text: string } => !!h && !!h.title)
      .map((h) => ({ _type: "feature", _key: stableKey(where, "highlight", h.title), ...h }))

    const amenityLabels = [
      ...arr(ds.accommodation[legacy]?.includes).map((x) => str(x)),
      ...arr(wellness?.facilities).map((x) => str(x)),
      ...(hints.wellnessFacilities[legacy] ?? []),
      ...(legacy === "boston" ? arr(ds.boston.facilities).map((x) => str(x)) : []),
    ].filter(Boolean)
    const amenities = [...new Map(amenityLabels.map((l) => [norm(l), l])).values()].map((l) => amenity(l, where))

    const addressHint = hints.address[legacy] ?? {}
    const description = str(r.description)

    // "Getting here": the destinations list's distance line, else the resort's
    // own direction line when it states a distance.
    const featuredEntry = arr(ds.featured.featured).find((d) => (d as Obj).slug === legacy) as Obj | undefined
    const direction = str(r.direction)
    const gettingHere = str(featuredEntry?.distance) || (/\bkm\b/.test(direction) ? direction : "")
    if (!gettingHere) report.flag("getting here", name, "No distance or directions line in source")

    // Map pin: the Google Maps place link's pin (!3d<lat>!4d<lng>) is the
    // place itself; the bundle's latitude/longitude are copied between resorts.
    const place = str(r.location).match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
    let geo: { _type: "geopoint"; lat: number; lng: number } | undefined
    if (place) geo = { _type: "geopoint", lat: Number(place[1]), lng: Number(place[2]) }
    else if (typeof r.latitude === "number" && typeof r.longitude === "number") geo = { _type: "geopoint", lat: r.latitude, lng: r.longitude }
    if (place && typeof r.latitude === "number" && (Math.abs(Number(place[1]) - r.latitude) > 0.01 || Math.abs(Number(place[2]) - (r.longitude as number)) > 0.01)) {
      report.flag("map pin", name, `Bundle lat/lng ${r.latitude}, ${r.longitude} differ from its Google Maps place pin; used the place pin ${place[1]}, ${place[2]}`)
    }

    docs.push(
      compact({
        _id: resortId(legacy),
        _type: "resort",
        name,
        fullName: fullName !== name ? fullName : undefined,
        slug: { _type: "slug", current: slug },
        type: hints.types[legacy],
        locationLabel: ds.locationLabels[legacy],
        tagline: hints.taglines[legacy],
        intro: textToBlocks(`${where} intro`, description),
        highlights,
        amenities,
        address: { _type: "address", ...addressHint, locality: str(r.city), country: "Ethiopia" },
        gettingHere: gettingHere || undefined,
        geo,
        heroImage,
        heroVideoUrl,
        gallery,
        bookable: bookable(legacy),
        reservationContact: {
          _type: "contactDetails",
          phones: phones.map((p) => ({ _type: "phone", _key: stableKey(where, p.tel), label: "Reservations", ...p })),
          emails: str(r.email) ? [{ _type: "emailAddress", _key: stableKey(where, "email"), label: "Reservations", address: str(r.email) }] : [],
        },
        seo: { _type: "seo", title: truncate(fullName, 60), description: truncate(description, 160) },
      }),
    )
    if (bookable(legacy)) report.flag("booking", name, "Booking engine property id not in source; add it when the deep-link params are confirmed")
  }

  // Camel-case resort slug: the old path keeps working through a 301.
  for (const legacy of RESORT_SLUGS) {
    if (slugOf(legacy) !== legacy) {
      camelRedirects.push({ source: `/resorts/${legacy}`, destination: `/resorts/${slugOf(legacy)}` })
      camelRedirects.push({ source: `/resorts/${legacy}/:path*`, destination: `/resorts/${slugOf(legacy)}/:path*` })
    }
  }

  // ------------------------------------------------------------------ rooms
  const roomIds = new Map<string, string>() // `${legacy}:${legacyId}` → _id
  // Room slugs are unique across all rooms (Studio rule), so a title used at
  // more than one resort gets the resort in its slug.
  const roomTitleResorts = new Map<string, Set<string>>()
  for (const [legacy, rooms] of Object.entries(ds.rooms)) {
    for (const raw of Object.values(rooms)) {
      const key = kebab(str((raw as Obj).title))
      roomTitleResorts.set(key, (roomTitleResorts.get(key) ?? new Set()).add(legacy))
    }
  }
  for (const [legacy, rooms] of Object.entries(ds.rooms)) {
    const name = resortName.get(legacy)!
    const tiles = objs(ds.accommodation[legacy]?.accomodations)
    const usedSlugs = new Set<string>()
    redirects.push({ source: `/resorts/${legacy}/acc`, destination: `/resorts/${slugOf(legacy)}` })
    for (const [legacyId, raw] of Object.entries(rooms)) {
      const room = raw as Obj
      const title = str(room.title)
      const where = `room ${slugOf(legacy)}/${legacyId}`
      const booking = (room.booking ?? {}) as Obj
      const tile = tiles.find((t) => norm(str(t.title)) === norm(title))
      const sourceSummary = str(tile?.description) || str(booking.description)
      let slug = kebab(title)
      if (roomTitleResorts.get(slug)!.size > 1) slug = `${slug}-${slugOf(legacy)}`
      if (usedSlugs.has(slug)) slug = `${slug}-${legacyId}`
      usedSlugs.add(slug)

      const roomImages = images.images([...arr(room.carouselImages), ...arr(booking.images)], where, (n) => `${name}, ${title}, photo ${n}`)
      if (roomImages.length === 0) {
        report.skip("room", `${name} / ${title}`, "No usable images (required)")
        continue
      }
      if (!sourceSummary) report.flag("room", `${name} / ${title}`, "No description in source")
      const id = `room.${slugOf(legacy)}.${legacyId}`
      roomIds.set(`${legacy}:${legacyId}`, id)
      docs.push(
        compact({
          _id: id,
          _type: "room",
          title,
          slug: { _type: "slug", current: slug },
          resort: ref(resortId(legacy)),
          images: roomImages,
          summary: summary(sourceSummary, 200),
          description: textToBlocks(`${where} description`, str(booking.description)),
          amenities: arr(room.amenities).map((a) => amenity(str(a), where)),
          bedConfiguration: bedFromAmenities(arr(room.amenities).map(str)),
        }),
      )
      report.flag(
        "room details",
        `${name} / ${title}`,
        bedFromAmenities(arr(room.amenities).map(str))
          ? "Max guests (required), size, view and special features aren't in the source"
          : "Max guests (required), bed configuration, size, view and special features aren't in the source",
      )
      if (typeof room.video === "string") report.skip("room video", `${name} / ${title}`, `Self-hosted video not allowed (${room.video})`)
      redirects.push({ source: `/resorts/${legacy}/acc/${legacyId}`, destination: `/resorts/${slugOf(legacy)}/rooms/${slug}` })
    }
  }

  // ------------------------------------------- experiences & spa treatments
  interface Offering {
    legacy: string
    title: string
    description: string
    image: Json | undefined
  }

  /**
   * One document per title when every resort uses the same copy; otherwise
   * one document per resort so no copy is lost.
   */
  function grouped(items: Offering[]) {
    const byTitle = new Map<string, Offering[]>()
    for (const item of items) byTitle.set(norm(item.title), [...(byTitle.get(norm(item.title)) ?? []), item])
    const out: { slug: string; title: string; description: string; legacies: string[]; images: Json[] }[] = []
    for (const group of byTitle.values()) {
      const copies = new Map<string, Offering[]>()
      for (const item of group) copies.set(norm(item.description), [...(copies.get(norm(item.description)) ?? []), item])
      const split = copies.size > 1
      for (const same of copies.values()) {
        const legacies = [...new Set(same.map((s) => s.legacy))]
        const base = kebab(same[0].title)
        out.push({
          slug: split ? `${base}-${slugOf(legacies[0])}` : base,
          title: same[0].title,
          description: same[0].description,
          legacies,
          images: same.map((s) => s.image).filter((x): x is Json => !!x),
        })
      }
    }
    return out
  }

  const experienceItems: Offering[] = []
  for (const [legacy, data] of Object.entries(ds.experiences)) {
    const seen = new Set<string>()
    for (const item of [...objs(data.items), ...objs(data.experiences)]) {
      const title = str(item.title)
      if (!title || seen.has(norm(title))) continue
      seen.add(norm(title))
      experienceItems.push({ legacy, title, description: str(item.description), image: item.image })
    }
  }
  for (const [legacy, data] of Object.entries(ds.adventures)) {
    for (const item of objs(data.adventures)) {
      experienceItems.push({ legacy, title: str(item.title), description: str(item.description), image: item.image })
    }
  }
  for (const exp of grouped(experienceItems)) {
    const where = `experience ${exp.slug}`
    const expImages = images.images(exp.images, where, (n) => `${exp.title} at ${exp.legacies.map((l) => resortName.get(l)).join(" and ")}, photo ${n}`)
    if (!exp.description) {
      report.skip("experience", exp.title, "No description (summary is required)")
      continue
    }
    if (expImages.length === 0) {
      report.skip("experience", exp.title, "No usable image (required)")
      continue
    }
    const category = categorize(categories.experience.rules, categories.experience.default, exp.title)
    if (!category.matched) report.flag("experience category", exp.title, `Defaulted to "${category.value}"`)
    else report.flag("experience category", exp.title, `Guessed "${category.value}" from the title`)
    docs.push(
      compact({
        _id: `experience.${exp.slug}`,
        _type: "experience",
        title: exp.title,
        slug: { _type: "slug", current: exp.slug },
        category: category.value,
        images: expImages,
        summary: summary(exp.description, 200),
        description: textToBlocks(`${where} description`, exp.description),
        resorts: exp.legacies.map((l) => ref(resortId(l), l)),
        action: exp.legacies.every(bookable) ? "book" : "enquire",
      }),
    )
  }

  const spaItems: Offering[] = []
  for (const [legacy, data] of Object.entries(ds.wellness)) {
    const facilities = hints.wellnessFacilities[legacy] ?? []
    for (const item of objs(data.wellness)) {
      const title = str(item.title)
      if (facilities.includes(title)) continue
      spaItems.push({ legacy, title, description: str(item.description), image: item.image })
    }
    const menu = str(data.spaMenuLink)
    if (menu) report.skip("spa menu PDF", resortName.get(legacy)!, `No menu field in the schema (${menu})`)
  }
  for (const item of objs(ds.boston.items)) {
    spaItems.push({ legacy: "boston", title: str(item.title), description: str(item.description), image: item.image })
  }
  for (const t of grouped(spaItems)) {
    const where = `spa treatment ${t.slug}`
    const category = categorize(categories.spaTreatment.rules, categories.spaTreatment.default, t.title)
    report.flag("spa category", t.title, `${category.matched ? "Guessed" : "Defaulted to"} "${category.value}"`)
    const [image] = images.images(t.images, where, () => `${t.title} at ${t.legacies.map((l) => resortName.get(l)).join(" and ")}`)
    if (image) delete image._key
    docs.push(
      compact({
        _id: `spaTreatment.${t.slug}`,
        _type: "spaTreatment",
        title: t.title,
        slug: { _type: "slug", current: t.slug },
        category: category.value,
        description: textToBlocks(`${where} description`, t.description),
        image,
        resorts: t.legacies.map((l) => ref(resortId(l), l)),
      }),
    )
  }

  // ------------------------------------------------------------ dining venues
  for (const [legacy, data] of Object.entries(ds.dining)) {
    const name = resortName.get(legacy)!
    const used = new Set<string>()
    for (const option of objs(data.diningOptions)) {
      const title = str(option.title)
      if (hints.notDiningVenues.includes(title)) {
        report.skip("dining venue", `${name} / ${title}`, "A booking prompt, not a venue")
        continue
      }
      const slug = kebab(title)
      if (used.has(slug)) continue
      used.add(slug)
      const where = `dining ${slugOf(legacy)}/${slug}`
      if (str(option.menuLink)) report.skip("dining menu PDF", `${name} / ${title}`, `No menu field in the schema (${str(option.menuLink)})`)
      docs.push(
        compact({
          _id: `diningVenue.${slugOf(legacy)}.${slug}`,
          _type: "diningVenue",
          name: title,
          resort: ref(resortId(legacy)),
          description: textToBlocks(`${where} description`, str(option.description)),
          images: images.images([option.image], where, () => `${title} at ${name}`),
        }),
      )
    }
  }

  // ------------------------------------------------------------ event venues
  const venueIds = new Map<string, { celebration: string[]; corporate: string[] }>()
  for (const legacy of RESORT_SLUGS) {
    const name = resortName.get(legacy)!
    const lists = { celebration: objs(ds.celebrations[legacy]?.venus), corporate: objs(ds.corporate[legacy]?.venus) }
    const ids = { celebration: [] as string[], corporate: [] as string[] }
    const created = new Set<string>()
    for (const kind of ["celebration", "corporate"] as const) {
      for (const venue of lists[kind]) {
        const title = str(venue.title)
        if ((hints.notVenues[legacy] ?? []).includes(title)) {
          report.skip("event venue", `${name} / ${title}`, "Listed as a venue on the old site but is a package or event type")
          continue
        }
        const slug = kebab(title)
        const id = `eventVenue.${slugOf(legacy)}.${slug}`
        ids[kind].push(id)
        if (created.has(id)) continue
        created.add(id)
        const where = `venue ${slugOf(legacy)}/${slug}`
        docs.push(
          compact({
            _id: id,
            _type: "eventVenue",
            name: title,
            resort: ref(resortId(legacy)),
            description: textToBlocks(`${where} description`, str(venue.description)),
            images: images.images([venue.image], where, () => `${title} at ${name}`),
          }),
        )
      }
    }
    venueIds.set(legacy, ids)
  }

  // ---------------------------------------------------------- event packages
  interface PackageItem extends Offering {
    kind: "wedding" | "meeting" | "celebration"
    inclusions?: string[]
  }
  const packageItems: PackageItem[] = []
  for (const [legacy, data] of Object.entries(ds.celebrations)) {
    for (const event of objs(data.events)) {
      const title = str(event.title)
      packageItems.push({ legacy, title, description: str(event.description), image: event.image, kind: /wedding/i.test(title) ? "wedding" : "celebration" })
    }
  }
  for (const [legacy, data] of Object.entries(ds.corporate)) {
    const facilities = arr(data.facilities).map((x) => str(x)).filter(Boolean)
    for (const item of objs(data.celebrations)) {
      const title = str(item.title)
      packageItems.push({
        legacy,
        title,
        description: str(item.description),
        image: item.image,
        kind: "meeting",
        inclusions: /meeting|conference/i.test(title) ? facilities : undefined,
      })
    }
  }
  for (const pkg of groupedPackages(packageItems)) {
    const where = `event package ${pkg.slug}`
    const venues = pkg.legacies.flatMap((l) => (pkg.kind === "meeting" ? venueIds.get(l)!.corporate : venueIds.get(l)!.celebration))
    docs.push(
      compact({
        _id: `eventPackage.${pkg.slug}`,
        _type: "eventPackage",
        title: pkg.title,
        slug: { _type: "slug", current: pkg.slug },
        kind: pkg.kind,
        summary: summary(pkg.description, 200),
        description: textToBlocks(`${where} description`, pkg.description),
        inclusions: pkg.inclusions,
        resorts: pkg.legacies.map((l) => ref(resortId(l), l)),
        venues: [...new Set(venues)].map((id) => ref(id, "venue")),
        images: images.images(pkg.images, where, () => `${pkg.title} at ${pkg.legacies.map((l) => resortName.get(l)).join(" and ")}`),
      }),
    )
  }

  function groupedPackages(items: PackageItem[]) {
    return grouped(items).map((g) => {
      const source = items.find((i) => norm(i.title) === norm(g.title) && norm(i.description) === norm(g.description))!
      return { ...g, kind: source.kind, inclusions: source.inclusions }
    })
  }

  // Priced celebration packages (/celebrate/package/:id). A title used by more
  // than one package gets the resort in its slug.
  const titleCount = new Map<string, number>()
  for (const pkg of ds.packages) titleCount.set(norm(str(pkg.title)), (titleCount.get(norm(str(pkg.title))) ?? 0) + 1)
  for (const pkg of ds.packages) {
    const legacyId = str(pkg.id)
    const legacies = hints.packageResorts[legacyId]
    if (!legacies) throw new Error(`No resort mapping for package "${legacyId}" in resort-hints.json`)
    const title = str(pkg.title)
    const slug = titleCount.get(norm(title))! > 1 ? `${kebab(title)}-${slugOf(legacies[0])}` : kebab(title)
    const where = `event package ${slug}`
    const base = pkg.basePackage as Obj
    const addOns = objs(pkg.optionalAddOns).map((a) => {
      const price = typeof a.price === "number" ? `: ETB ${a.price.toLocaleString("en-US")}${a.unit ? ` ${str(a.unit)}` : ""}` : ""
      return `${str(a.item)}${price}`
    })
    const themes = arr(pkg.themeColors).map((x) => str(x)).filter(Boolean)
    const description: Block[] = [
      ...textToBlocks(`${where} intro`, str(pkg.description)),
      ...(addOns.length ? toBlocks(`${where} addons-h`, [{ kind: "h3", text: "Optional add-ons" }]) : []),
      ...listToBlocks(`${where} addons`, addOns),
      ...(themes.length ? textToBlocks(`${where} themes`, `Theme colours: ${themes.join(", ")}.`) : []),
    ]
    const guests = typeof base?.guests === "number" ? base.guests : undefined
    docs.push(
      compact({
        _id: `eventPackage.${slug}`,
        _type: "eventPackage",
        title,
        slug: { _type: "slug", current: slug },
        kind: "celebration",
        summary: summary(str(pkg.description), 200),
        description,
        inclusions: [...arr(pkg.includes), ...arr(pkg.decorAndExtras)].map((x) => str(x)).filter(Boolean),
        resorts: legacies.map((l) => ref(resortId(l), l)),
        venues: legacies.flatMap((l) => venueIds.get(l)!.celebration).map((id) => ref(id, "venue")),
        fromPrice:
          typeof base?.price === "number"
            ? { _type: "price", amount: base.price, currency: "ETB", unit: guests ? `for ${guests} guests` : undefined }
            : undefined,
        images: images.images([pkg.image], where, () => `${title}`),
      }),
    )
    redirects.push({ source: `/celebrate/package/${legacyId}`, destination: `/event/${slug}` })
  }

  // ------------------------------------------------------------------ offer
  const popup = linearize(ds.offerPopup)
  const shortLine = popup.find((i) => i.kind === "loose" && /% off/i.test(i.text)) as { text: string } | undefined
  if (!shortLine) throw new Error("Offer popup: no discount line found")
  const offerTitle = shortLine.text.replace(/^enjoy\s+/i, "").replace(/^./, (c) => c.toUpperCase())
  const offerImg = popup.find((i) => i.kind === "img") as { src: string; alt?: string } | undefined
  const offerImage = offerImg ? images.image(offerImg.src, "offer", offerTitle, offerImg.alt) : undefined
  const offerHeading = popup.find((i) => i.kind === "h2") as { text: string } | undefined
  const offerParas = popup.filter((i) => i.kind === "p" && !/dismiss/i.test(i.text)).map((i) => (i as { text: string }).text)
  docs.push(
    compact({
      _id: `offer.${kebab(offerTitle)}`,
      _type: "offer",
      title: offerTitle,
      slug: { _type: "slug", current: kebab(offerTitle) },
      shortLine: shortLine.text,
      description: toBlocks("offer description", [
        ...(offerHeading ? [{ kind: "h3" as const, text: offerHeading.text }] : []),
        ...offerParas.slice(1).map((text) => ({ kind: "p" as const, text })),
      ]),
      image: offerImage,
      resorts: [ref(resortId(hints.offer.resort), hints.offer.resort)],
      startDate: hints.offer.startDate,
      endDate: hints.offer.endDate,
      showAsPopup: true,
    }),
  )
  report.flag("offer", offerTitle, `Dates ${hints.offer.startDate} → ${hints.offer.endDate} read from "November stay"; confirm with Kuriftu`)

  // ------------------------------------------------------------------ pages
  const pageDoc = (slug: string, title: string, content: PageContent, description?: string) => {
    const where = `page ${slug}`
    const heroImage = content.heroImage ? images.image(content.heroImage.src, `${where} hero`, `${title}`, content.heroImage.alt) : undefined
    let imageSide: "start" | "end" = "end"
    const sections: Record<string, unknown>[] = []
    content.sections.forEach((section, index) => {
      const key = stableKey(where, index, section.heading ?? "")
      const body = toBlocks(`${where} ${index}`, section.parts)
      const sectionImages = images.images(
        section.images.map((i) => i.src),
        `${where} section ${index + 1}`,
        (n) => `${title}${section.heading ? `: ${section.heading}` : ""}, photo ${n}`,
        section.images.map((i) => i.alt),
      )
      if (body.length === 0 && sectionImages.length === 0) {
        if (section.heading) report.skip("page section", `${title} / ${section.heading}`, "Heading only; its items were rendered from data the bundle builds at runtime")
        return
      }
      if (sectionImages.length === 1 && section.heading) {
        const [image] = sectionImages
        delete image._key
        imageSide = imageSide === "end" ? "start" : "end"
        sections.push({ _type: "mediaText", _key: key, eyebrow: section.eyebrow, heading: section.heading, body, image, imagePosition: imageSide })
        return
      }
      if (body.length) sections.push({ _type: "textSection", _key: key, eyebrow: section.eyebrow, heading: section.heading, body })
      if (sectionImages.length) sections.push({ _type: "imageGallery", _key: `${key}g`, heading: body.length ? undefined : section.heading, images: sectionImages })
    })
    return compact({
      _id: `page.${slug}`,
      _type: "page",
      title,
      slug: { _type: "slug", current: slug },
      hero: { eyebrow: content.eyebrow, title: content.title && content.title !== title ? content.title : undefined, intro: content.intro, image: heroImage },
      sections,
      seo: { _type: "seo", title: truncate(`${title} | Kuriftu Resorts`, 60), description: description ? truncate(description, 160) : undefined },
    })
  }

  // Short page titles for navigation; the CEO page uses its own heading (the founder's name).
  const pageTitles: Record<string, string> = {
    sustainability: "Sustainability",
    "coming-soon": "Coming Soon",
    training: "Training & Development",
    "pan-african-roadshow": "Pan-African Roadshow",
  }
  for (const [slug, tree] of Object.entries(ds.pages)) {
    const content = groupPage(linearize(tree))
    const title = pageTitles[slug] ?? content.title
    if (!title) throw new Error(`Page "${slug}" has no title`)
    docs.push(pageDoc(slug, title, content, content.intro))
  }
  redirects.push({ source: "/about/sustainability", destination: "/sustainability" })
  redirects.push({ source: "/about/ceo", destination: "/ceo" })

  // About: structured data rather than JSX.
  const about = ds.about
  const story = about.story as Obj
  const aboutContent: PageContent = {
    title: "About Us",
    intro: str(story.subText),
    heroImage: { src: str((about.hero as Obj).backgroundImage) },
    sections: [
      { parts: [{ kind: "p", text: str(story.mainText) }], images: [] },
      ...objs(story.sections).map((s) => ({
        parts: [{ kind: "p" as const, text: str(s.text) }],
        images: [s.image, s.smallImage].filter((x): x is string => typeof x === "string").map((src) => ({ src })),
      })),
    ],
  }
  docs.push(pageDoc("about", "About Us", aboutContent, str(story.mainText)))
  report.skip("page section", "About / Discover more", "Generic category cards illustrated with Unsplash stock photos")

  // Privacy policy: [{ title, body: JSX }].
  const privacy: PageContent = {
    title: "Privacy Policy",
    sections: ds.privacy.map((s) => {
      const items = linearize(s.body)
      return {
        heading: str(s.title),
        parts: items.flatMap((i): TextPart[] => (i.kind === "li" ? [{ kind: "li", text: i.text }] : "text" in i ? [{ kind: "p", text: i.text }] : [])),
        images: [],
      }
    }),
  }
  docs.push(pageDoc("privacy-policy", "Privacy Policy", privacy))

  // ------------------------------------------------------------ site settings
  const footerLinks: string[] = []
  ;(function collect(node: Json | undefined) {
    if (Array.isArray(node)) return node.forEach(collect)
    if (!node || typeof node !== "object") return
    const props = (node as Obj).props as Obj | undefined
    if (props && typeof props.href === "string") footerLinks.push(props.href)
    if (props) collect(props.children)
  })(ds.footer)
  const social = (["instagram", "youtube", "linkedin", "facebook", "tiktok", "x"] as const)
    .map((platform) => {
      const host = platform === "x" ? /\/\/(www\.)?(x|twitter)\.com\// : new RegExp(`//(www\\.)?${platform}\\.com/`)
      const href = platform === "instagram" ? ds.instagram.default : footerLinks.find((h) => host.test(h))
      if (!href) return undefined
      const url = new URL(href)
      url.hash = ""
      if (platform === "linkedin") {
        url.search = ""
        url.pathname = url.pathname.replace(/\/posts\/?$/, "/")
      }
      return { _type: "socialLink", _key: stableKey("social", platform), platform, url: url.toString() }
    })
    .filter(Boolean)

  for (const [legacy, url] of Object.entries(ds.instagram)) {
    if (legacy !== "default" && url !== ds.instagram.default) report.skip("resort Instagram", resortName.get(legacy) ?? legacy, `No per-resort social field in the schema (${url})`)
  }

  const footerTel = footerLinks.find((h) => h.startsWith("tel:"))
  const footerEmail = footerLinks.find((h) => h.startsWith("mailto:"))
  const popupText = popup.filter((i) => "text" in i).map((i) => (i as { text: string }).text)
  const reservationPhone = parsePhones(popupText.find((t) => /^\+\d[\d\s]+$/.test(t)) ?? "").phones
  const reservationEmail = popupText.find((t) => /@/.test(t))
  const path = (label: string, p: string) => ({ _type: "link", _key: stableKey("link", label, p), label, linkType: "path", path: p })

  docs.push(
    compact({
      _id: "siteSettings",
      _type: "siteSettings",
      brandName: meta.brandName,
      footerTagline: meta.footerTagline,
      reservations: {
        _type: "contactDetails",
        phones: reservationPhone.map((p) => ({ _type: "phone", _key: stableKey("reservations", p.tel), label: "Reservations", ...p })),
        emails: reservationEmail ? [{ _type: "emailAddress", _key: stableKey("reservations", "email"), label: "Reservations", address: reservationEmail }] : [],
      },
      headOffice: {
        _type: "contactDetails",
        phones: parsePhones(footerTel?.replace("tel:", "") ?? "").phones.map((p) => ({ _type: "phone", _key: stableKey("head", p.tel), label: "Head office", ...p })),
        emails: footerEmail ? [{ _type: "emailAddress", _key: stableKey("head", "email"), label: "General", address: footerEmail.replace("mailto:", "") }] : [],
      },
      headOfficeAddress: { _type: "address", locality: "Addis Ababa", country: "Ethiopia" },
      social,
      navResorts: hints.footerOrder.map((l) => ref(resortId(l), l)),
      experienceLinks: [path("Experiences", "/experience"), path("Wellness & Spa", "/wellness"), path("Celebrations & Events", "/event"), path("Offers", "/offers")],
      footerColumns: [
        {
          _type: "footerColumn",
          _key: stableKey("footer", "quick"),
          title: "Quick Links",
          links: [path("Home", "/"), path("Destinations", "/destinations"), path("Experiences", "/experience"), path("Dining", "/dining")],
        },
        {
          _type: "footerColumn",
          _key: stableKey("footer", "about"),
          title: "About Kuriftu",
          links: [path("Our Story", "/about"), path("Offers", "/offers"), path("Gallery", "/gallery"), path("Contact", "/contact")],
        },
      ],
      legalLinks: [path("Privacy Policy", "/privacy-policy")],
      seo: { _type: "seo", title: meta.brandName, description: truncate(meta.siteDescription, 160) },
    }),
  )

  // ---------------------------------------------------------------- home page
  const homeImage = (spec: string, where: string, context: string) => {
    if (spec.startsWith("resort:")) {
      const hero = resortHero.get(spec.slice(7))
      if (!hero) throw new Error(`home.json: no hero image for ${spec}`)
      return { ...hero }
    }
    const img = images.image(spec, where, context)
    return img
  }
  const roomRefs = home.rooms.items.map((i) => {
    const id = roomIds.get(`${i.resort}:${i.legacyId}`)
    if (!id) throw new Error(`home.json: no room ${i.resort}:${i.legacyId}`)
    return ref(id, "home")
  })
  docs.push(
    compact({
      _id: "homePage",
      _type: "homePage",
      heroSlides: home.heroSlides.map((s, i) => ({
        _type: "heroSlide",
        _key: stableKey("hero", i),
        eyebrow: s.eyebrow,
        title: s.title,
        text: s.text,
        image: homeImage(s.image, "home hero", s.title),
      })),
      destinations: { title: home.destinations.title, subtitle: home.destinations.subtitle, resorts: home.destinations.resorts.map((l) => ref(resortId(l), l)) },
      experience: {
        title: home.experience.title,
        pillars: home.experience.pillars.map((p) => ({
          _type: "pillar",
          _key: stableKey("pillar", p.title),
          icon: p.icon,
          title: p.title,
          subtitle: p.subtitle,
          link: { _type: "link", label: p.title, linkType: "path", path: p.path },
        })),
        image: homeImage(home.experience.image, "home experience", "Massage treatment at Kuriftu Boston Day Spa"),
      },
      rooms: { title: home.rooms.title, subtitle: home.rooms.subtitle, items: roomRefs },
      offersPanel: { ...home.offersPanel, image: homeImage(home.offersPanel.image, "home offers", home.offersPanel.title) },
      testimonials: {
        title: home.testimonials.title,
        subtitle: home.testimonials.subtitle,
        backgroundImage: homeImage(home.testimonials.backgroundImage, "home testimonials", home.testimonials.title),
      },
      stayConnected: home.stayConnected,
      seo: { _type: "seo", title: meta.brandName, description: truncate(meta.siteDescription, 160) },
    }),
  )
  report.flag("home", "Testimonials", "No real guest review in the source; the section stays empty until one is added")

  // Old top-level shortcuts.
  redirects.push({ source: "/entoto", destination: "/resorts/entoto" })
  redirects.push({ source: "/arba-minch", destination: "/resorts/arba-minch" })

  // Specific rules first, the camel-case catch-all last, so nothing chains.
  return { docs, redirects: [...redirects, ...camelRedirects] }
}
