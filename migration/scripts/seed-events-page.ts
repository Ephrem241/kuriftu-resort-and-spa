/**
 * Seed the "Events page" singleton (step 17).
 *
 *   npm run seed:events-page
 *
 * Idempotent and safe after editors start working: the singleton is only
 * created if missing. Uses SANITY_API_WRITE_TOKEN from the web app's
 * .env.local; never logged.
 *
 * Copy comes from the Celebrations & Events design. Every photo is a real
 * Kuriftu image already in the dataset (a venue's or package's first image),
 * reused with its own alt text.
 */
import { randomUUID } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { createClient } from "@sanity/client"

import { REPO_ROOT } from "./lib/paths"

const envFile = join(REPO_ROOT, ".env.local")
if (!existsSync(envFile)) {
  console.error("No .env.local in the repo root.")
  process.exit(1)
}
const env = Object.fromEntries(
  readFileSync(envFile, "utf8")
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const i = line.indexOf("=")
      return [line.slice(0, i), line.slice(i + 1).trim().replace(/^["']|["']$/g, "")]
    })
)
for (const key of ["NEXT_PUBLIC_SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_DATASET", "SANITY_API_WRITE_TOKEN"]) {
  if (!env[key]) {
    console.error(`${key} is not set in .env.local`)
    process.exit(1)
  }
}

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-11-21",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

type SourceImage = { alt: string; asset: { _ref: string } } | null

type SourceImage = { alt: string; asset: { _ref: string } } | null

const key = () => randomUUID().replace(/-/g, "").slice(0, 12)
const ref = (_ref: string) => ({ _type: "reference", _ref })

async function packageDoc(slug: string): Promise<{ _id: string; image: SourceImage }> {
  const doc = await client.fetch<{ _id: string; image: SourceImage } | null>(
    `*[_type == "eventPackage" && slug.current == $slug][0]{ _id, "image": images[0]{ alt, asset } }`,
    { slug }
  )
  if (!doc) throw new Error(`No event package "${slug}"`)
  return doc
}

async function venueDoc(id: string): Promise<{ _id: string; image: SourceImage }> {
  const doc = await client.fetch<{ _id: string; image: SourceImage } | null>(
    `*[_type == "eventVenue" && _id == $id][0]{ _id, "image": images[0]{ alt, asset } }`,
    { id }
  )
  if (!doc) throw new Error(`No event venue "${id}"`)
  return doc
}

function image(source: SourceImage, label: string) {
  if (!source?.asset?._ref || !source.alt) throw new Error(`No image with alt text for ${label}`)
  return { _type: "accessibleImage", alt: source.alt, asset: { _type: "reference", _ref: source.asset._ref } }
}

async function main() {
  const tiles = [
    { eventType: "wedding", title: "Weddings", icon: "gem", from: await packageDoc("weddings-laketana") },
    { eventType: "corporate", title: "Corporate Events", icon: "briefcase", from: await packageDoc("corporate-retreat-entoto") },
    { eventType: "social", title: "Social Events", icon: "users", from: await packageDoc("social-events") },
    { eventType: "private-party", title: "Private Parties", icon: "wine", from: await packageDoc("private-gatherings") },
    { eventType: "conference", title: "Conferences", icon: "presentation", from: await packageDoc("host-a-meeting-or-conference-bishoftu") },
  ]
  const cards = [
    {
      kind: "wedding",
      title: "Wedding Package",
      text: "A perfect blend of romance and luxury for your dream wedding.",
      pkg: await packageDoc("weddings-bishoftu"),
    },
    {
      kind: "meeting",
      title: "Corporate Packages",
      text: "Professional events with premium services and facilities.",
      pkg: await packageDoc("host-a-meeting-or-conference-bishoftu"),
    },
    {
      kind: "celebration",
      title: "Celebration Package",
      text: "Make your special moments even more memorable.",
      pkg: await packageDoc("african-village-birthday-package-1963-summit-restaurant"),
    },
  ]
  const heroVenue = await venueDoc("eventVenue.bishoftu.wedding-venue")
  const featured = await venueDoc("eventVenue.bishoftu.lake-side")
  const highlights = [
    "eventVenue.bishoftu.lake-side",
    "eventVenue.bishoftu.girum-hall",
    "eventVenue.entoto.open-air-spaces",
    "eventVenue.laketana.the-council-chamber",
  ]
  for (const id of highlights) await venueDoc(id)

  const page = await client.createIfNotExists({
    _id: "eventsPage",
    _type: "eventsPage",
    hero: {
      eyebrow: "Celebrations & Events",
      title: "Celebrate Life’s Special Moments",
      intro:
        "From dream weddings to unforgettable corporate events, Kuriftu Resorts provides the perfect setting.",
      image: image(heroVenue.image, "Bishoftu wedding venue"),
    },
    eventTypes: {
      title: "Event Types",
      subtitle: "Make every occasion extraordinary",
      tiles: tiles.map((t) => ({
        _type: "eventTypeTile",
        _key: key(),
        eventType: t.eventType,
        title: t.title,
        icon: t.icon,
        image: image(t.from.image, t.title),
      })),
    },
    venues: {
      title: "Our Venues",
      subtitle: "Stunning venues for your unforgettable events",
      text: "Choose from our breathtaking venues, each offering unique ambiance and world-class service.",
      featured: ref(featured._id),
      highlights: highlights.map((id) => ({ ...ref(id), _key: key() })),
    },
    packages: {
      title: "Our Event Packages",
      subtitle: "Tailored packages for every celebration",
      cards: cards.map((c) => ({
        _type: "packageCard",
        _key: key(),
        kind: c.kind,
        title: c.title,
        text: c.text,
        image: image(c.pkg.image, c.title),
        package: ref(c.pkg._id),
      })),
    },
    enquiry: {
      title: "Event Enquiry",
      text: "Let us help you plan the perfect event. Fill out the form and our team will get back to you soon.",
    },
    venuesIndex: {
      eyebrow: "Celebrations & Events",
      title: "Our Event Venues",
      intro: "Halls, lakeside lawns and open-air spaces across Kuriftu's resorts, for gatherings of every size.",
    },
  })
  console.log(`eventsPage: ready (${page._id})`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
