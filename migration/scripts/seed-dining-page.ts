/**
 * Create the Dining page singleton (step 22) with the design's copy.
 *
 *   npm run seed:dining-page
 *
 * Idempotent: createIfNotExists, so an edited page is never overwritten.
 * Every image is a real Kuriftu dining photo already in the dataset (a dining
 * venue's first image). Two get descriptive alt text written after viewing
 * the photo; the rest keep the venue image's own alt. The dataset has no
 * plated-dish photography yet, so "Menu highlights" uses venue photos until
 * the client provides dish shots. Uses SANITY_API_WRITE_TOKEN from the web
 * app's .env.local; never logged.
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

const key = () => randomUUID().replace(/-/g, "").slice(0, 12)

/** A dining venue's first image, by document id. */
async function venueImage(id: string, alt?: string) {
  const source = await client.fetch<SourceImage>(`*[_id == $id][0].images[0]{ alt, asset }`, { id })
  if (!source?.asset?._ref || !source.alt) throw new Error(`No image with alt text for ${id}`)
  return { _type: "accessibleImage", alt: alt ?? source.alt, asset: { _type: "reference", _ref: source.asset._ref } }
}

const feature = (icon: string, title: string) => ({ _type: "feature", _key: key(), icon, title })

async function main() {
  const highlights = await Promise.all(
    [
      "diningVenue.african-village.1963-restaurant",
      "diningVenue.entoto.entoto-peak-restaurant",
      "diningVenue.awash.the-falls-restaurant-and-bar",
      "diningVenue.bishoftu.lakefront-restaurant",
    ].map(async (id) => ({ ...(await venueImage(id)), _key: key() }))
  )

  const page = await client.createIfNotExists({
    _id: "diningPage",
    _type: "diningPage",
    hero: {
      eyebrow: "Dining",
      title: "Exceptional Dining in Unforgettable Settings",
      intro: "Savor exquisite cuisine, crafted with the finest ingredients, while enjoying breathtaking views.",
      image: await venueImage(
        "diningVenue.laketana.tana-lakefront-restaurant",
        "Sunlit Tana Lakefront Restaurant at Kuriftu Lake Tana, carved wooden tables set before windows onto the lake"
      ),
    },
    experience: {
      title: "Our Dining Experience",
      text: "At Kuriftu Resorts, dining is more than a meal—it's an experience. From local Ethiopian flavors to international cuisine, enjoy a culinary journey in elegant settings across our resorts.",
      features: [
        feature("concierge-bell", "Fine Cuisine"),
        feature("leaf", "Fresh Ingredients"),
        feature("utensils", "Scenic Settings"),
        feature("star", "Exceptional Service"),
      ],
      image: await venueImage(
        "diningVenue.arba-minch.evenings-beneath-the-southern-sky",
        "A guest cutting into a plated dish by warm candlelight at Kuriftu Arba Minch"
      ),
    },
    restaurants: { title: "Our Restaurants", subtitle: "Discover our unique dining venues" },
    highlights: {
      title: "Menu Highlights",
      text: "Indulge in a diverse menu featuring Ethiopian specialities, international favorites, and freshly prepared local dishes.",
      images: highlights,
    },
    events: {
      title: "Special Dining Events",
      text: "From romantic dinners to themed nights, our dining experiences are perfect for every occasion.",
      image: await venueImage("diningVenue.arba-minch.breakfast-overlooking-the-lake"),
    },
    reserve: {
      eyebrow: "Reserve a Table",
      title: "Dine in Paradise",
      text: "Book your dining experience today and enjoy an unforgettable culinary journey at Kuriftu.",
      image: await venueImage("diningVenue.arba-minch.private-poolside-dining"),
    },
  })
  console.log(`diningPage ready (${page._rev}).`)
}

main().catch((error) => {
  console.error((error as Error).message)
  process.exit(1)
})
