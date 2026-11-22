/**
 * Seed the "Wellness page" singleton (step 16).
 *
 *   npm run seed:wellness-page
 *
 * Idempotent and safe after editors start working: the singleton is only
 * created if missing. Uses SANITY_API_WRITE_TOKEN from the web app's
 * .env.local; never logged.
 *
 * Copy comes from the Wellness & Spa design. Every photo is a real Kuriftu
 * image already in the dataset (a treatment's image or Boston Day Spa's hero),
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

const key = () => randomUUID().replace(/-/g, "").slice(0, 12)

/** A treatment's image by slug. */
async function treatmentImage(slug: string): Promise<SourceImage> {
  return client.fetch(`*[_type == "spaTreatment" && slug.current == $slug][0].image{ alt, asset }`, { slug })
}

/** The first treatment image (by title) in any of these categories. */
async function categoryImage(categories: string[]): Promise<SourceImage> {
  return client.fetch(
    `*[_type == "spaTreatment" && category in $categories && defined(image.asset)] | order(title asc)[0].image{ alt, asset }`,
    { categories }
  )
}

function image(source: SourceImage, label: string) {
  if (!source?.asset?._ref || !source.alt) throw new Error(`No image with alt text for ${label}`)  return { _type: "accessibleImage", alt: source.alt, asset: { _type: "reference", _ref: source.asset._ref } }
}

const feature = (icon: string, title: string) => ({ _type: "feature", _key: key(), icon, title })

async function main() {
  const boston = await client.fetch<{ _id: string; heroImage: SourceImage } | null>(
    `*[_type == "resort" && slug.current == "boston"][0]{ _id, heroImage{ alt, asset } }`
  )
  if (!boston) throw new Error('No resort with slug "boston"')

  const cards = [
    { group: "massage", title: "Massage Therapy", subtitle: "Release tension and restore balance.", categories: ["massage"] },
    { group: "facial", title: "Facial Treatments", subtitle: "Reveal your natural glow.", categories: ["facial"] },
    { group: "body", title: "Body Treatments", subtitle: "Nourish and renew your skin.", categories: ["body", "hammam"] },
    { group: "packages", title: "Wellness Packages", subtitle: "A complete journey of relaxation.", categories: ["package"] },
    { group: "beauty", title: "Beauty Services", subtitle: "Look and feel your best.", categories: ["handsFeet", "hair"] },
  ]

  const page = await client.createIfNotExists({
    _id: "wellnessPage",
    _type: "wellnessPage",
    hero: {
      eyebrow: "Wellness & Spa",
      title: "Relax. Rejuvenate. Rediscover Yourself.",
      intro: "Indulge in world-class spa treatments and holistic wellness experiences at Kuriftu Resorts.",
      image: image(await treatmentImage("massage-cave"), "massage-cave"),
    },
    daySpa: {
      resort: { _type: "reference", _ref: boston._id },
      eyebrow: "Boston Day Spa",
      title: "A Premier Spa Experience",
      text: "Step into Boston Day Spa – a serene sanctuary of wellness and beauty at Kuriftu Resorts. Our expert therapists offer rejuvenating treatments designed to refresh your body, calm your mind, and restore your natural balance.",
      image: image(boston.heroImage, "Boston Day Spa"),
      features: [
        feature("spa", "Expert Therapists"),
        feature("leaf", "Premium Products"),
        feature("heart", "Total Relaxation"),
        feature("smile", "Wellness for All"),
      ],
    },
    treatments: {
      title: "Our Spa Treatments",
      subtitle: "A range of luxurious treatments for your complete well-being",
      cards: await Promise.all(
        cards.map(async (c) => ({
          _type: "treatmentGroupCard",
          _key: key(),
          group: c.group,
          title: c.title,
          subtitle: c.subtitle,
          // Body uses Moroccan Bath: the first hammam image is the pool shown in "Why choose".
          image: image(
            c.group === "body" ? await treatmentImage("moroccan-bath") : await categoryImage(c.categories),
            c.title
          ),
        }))
      ),
    },
    booking: {
      eyebrow: "Book a Spa Session",
      title: "Spa Booking Request",
      text: "Fill in the form below to book your spa appointment and let us take care of the rest.",
      tagline: "Your Wellness Our Priority",
      image: image(await treatmentImage("steam-sauna-jacuzzi"), "steam-sauna-jacuzzi"),
    },
    whyChoose: {
      title: "Why Choose Kuriftu Spa?",
      features: [
        feature("spa", "World-Class Facilities in Stunning Locations"),
        feature("gem", "Personalized Care & Expert Therapists"),
        feature("leaf", "Natural & Premium Products"),
        feature("smile", "A Holistic Wellness Experience"),
      ],
      image: image(await treatmentImage("hydrotherapy-pools"), "hydrotherapy-pools"),
    },
    treatmentsIndex: {
      eyebrow: "Wellness & Spa",
      title: "Our Spa Treatments",
      intro: "Massages, facials, body rituals and wellness packages at Kuriftu's resorts and Boston Day Spa.",
    },
  })
  console.log(`wellnessPage: ready (${page._id})`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
