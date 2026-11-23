/**
 * Seed the "Gallery page" singleton (step 19).
 *
 *   npm run seed:gallery-page
 *
 * Idempotent and safe after editors start working: the singleton is only
 * created if missing. Uses SANITY_API_WRITE_TOKEN from the web app's
 * .env.local; never logged.
 *
 * The hero photo is Arba Minch's resort hero (a real Kuriftu image), reused
 * with its own alt text.
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
  const arbaMinch = await resortHero("arba-minch")

  const page = await client.createIfNotExists({
    _id: "galleryPage",
    _type: "galleryPage",
    hero: {
      eyebrow: "Gallery",
      title: "Moments Across Ethiopia",
      intro: "Lakes, highlands and rift valley views from every Kuriftu destination.",
      image: image(arbaMinch, "arba-minch"),
    },
  })
  console.log(`galleryPage: ready (${page._id})`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
