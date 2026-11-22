/**
 * Seed the "Offers page" singleton and the new offer fields (step 13).
 *
 *   npm run seed:offers-page
 *
 * Idempotent and safe after editors start working: the singleton is only
 * created if missing, and offer fields are only set where empty.
 * Uses SANITY_API_WRITE_TOKEN from the web app's .env.local; never logged.
 *
 * Photography is reused from resort heroes already in the dataset (real
 * Kuriftu images), with their own alt text.
 */
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

type HeroImage = { alt: string; asset: { _ref: string } } | null

/** A resort's hero image (asset reference and alt), or null. */
async function resortHero(slug: string): Promise<HeroImage> {
  return client.fetch(`*[_type == "resort" && slug.current == $slug][0].heroImage{ alt, asset }`, { slug })
}

function image(hero: HeroImage, label: string) {
  if (!hero?.asset?._ref || !hero.alt) throw new Error(`No hero image with alt text on ${label}`)
  return { _type: "accessibleImage", alt: hero.alt, asset: { _type: "reference", _ref: hero.asset._ref } }
}

async function main() {
  // Lakeside villas at dusk (hero) and a plunge pool over green hills (banner).
  const [palm, arbaMinch] = await Promise.all([resortHero("thepalm"), resortHero("arba-minch")])

  const page = await client.createIfNotExists({
    _id: "offersPage",
    _type: "offersPage",
    hero: {
      eyebrow: "Special Offers",
      title: "Offers & Packages",
      intro: "Discover our exclusive offers and packages, designed to make your stay more memorable and rewarding.",
      image: image(palm, "thepalm"),
    },
    banner: {
      eyebrow: "Limited Time Offer",
      title: "Experience More, Save More",
      // No percentage: only state discounts a live offer actually gives.
      text: "Book now and enjoy seasonal savings on select resorts and packages.",
      image: image(arbaMinch, "arba-minch"),
      link: { _type: "link", label: "View All Offers", linkType: "path", path: "/offers" },
    },
  })
  console.log(`offersPage: ${page._rev ? "ready" : "unchanged"} (${page._id})`)

  // The November offer: category and a badge taken from its own short line.
  const offerId = "offer.up-to-25-off-your-november-stay"
  const offer = await client.getDocument(offerId)
  if (offer) {
    await client.patch(offerId).setIfMissing({ category: "deals", badge: "UP TO 25% OFF" }).commit()
    console.log(`${offerId}: category and badge set where empty`)
  } else {
    console.log(`${offerId}: not found, skipped`)
  }

  // Any other offer without a category gets the schema's default.
  const uncategorised: string[] = await client.fetch(`*[_type == "offer" && !defined(category)]._id`)
  for (const id of uncategorised) {
    await client.patch(id).setIfMissing({ category: "deals" }).commit()
    console.log(`${id}: category defaulted to deals`)
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
