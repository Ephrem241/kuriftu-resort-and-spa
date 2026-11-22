import type { HOME_PAGE_QUERY_RESULT, SITE_SETTINGS_QUERY_RESULT } from "@/sanity.types"
import { urlFor } from "@/sanity/lib/image"

import { isIconName } from "./icons"
import { hrefFor, type ContentLink } from "./routes"
import type {
  ContentImage,
  HomePage,
  NavLink,
  ResortSummary,
  RoomSummary,
  SiteSettings,
  SocialPlatform,
} from "./types"

/**
 * Query result → component shape. Missing optional content becomes an empty
 * value, never invented copy.
 */

type SanityImage = {
  alt?: string | null
  crop?: { top?: number; bottom?: number; left?: number; right?: number } | null
  hotspot?: { x?: number; y?: number } | null
  asset?: {
    _id: string
    url?: string | null
    metadata?: { lqip?: string | null } | null
  } | null
} | null

/** Largest width we ever request; next/image picks smaller ones from `sizes`. */
const MAX_WIDTH = 2560

export function toContentImage(image: SanityImage | undefined, fallbackAlt = ""): ContentImage {
  const alt = image?.alt?.trim() || fallbackAlt
  if (!image?.asset?._id) return { alt }

  const src = urlFor({
    asset: { _ref: image.asset._id },
    crop: image.crop ?? undefined,
    hotspot: image.hotspot ?? undefined,
  } as Parameters<typeof urlFor>[0])
    .width(MAX_WIDTH)
    .fit("max")
    .auto("format")
    .url()

  const { x, y } = image.hotspot ?? {}
  const objectPosition =
    typeof x === "number" && typeof y === "number"
      ? `${round(x * 100)}% ${round(y * 100)}%`
      : undefined

  return {
    src,
    alt,
    lqip: image.asset.metadata?.lqip ?? undefined,
    ...(objectPosition && { objectPosition }),
  }
}

const round = (n: number) => Math.round(n * 10) / 10

function toNavLinks(links: Array<ContentLink & { label: string }> | null | undefined): NavLink[] {
  return (links ?? []).map((link) => ({ label: link.label, href: hrefFor(link) }))
}

const PLATFORMS: SocialPlatform[] = ["facebook", "instagram", "youtube", "x", "linkedin", "tiktok"]

type SettingsDoc = NonNullable<SITE_SETTINGS_QUERY_RESULT>

export function mapSiteSettings(
  doc: SettingsDoc,
  year: number
): SiteSettings {
  const address = doc.headOfficeAddress
    ? [doc.headOfficeAddress.locality, doc.headOfficeAddress.country].filter(Boolean).join(", ")
    : null

  return {
    brandName: doc.brandName,
    footerTagline: doc.footerTagline ?? "",
    reservationPhone: doc.reservationPhone ?? null,
    reservationEmail: doc.reservationEmail ?? null,
    address: address || null,
    social: (doc.social ?? []).filter((s) => PLATFORMS.includes(s.platform)),
    navResorts: (doc.navResorts ?? []).filter((r) => r.slug),
    bookableResorts: doc.bookableResorts.map((r) => ({
      name: r.name,
      slug: r.slug,
      bookingPropertyId: r.bookingPropertyId ?? null,
    })),
    experienceLinks: toNavLinks(doc.experienceLinks),
    footerColumns: (doc.footerColumns ?? []).map((col) => ({
      title: col.title,
      links: toNavLinks(col.links),
    })),
    legalLinks: toNavLinks(doc.legalLinks),
    storyVideoUrl: doc.storyVideoUrl ?? null,
    copyrightYear: year,
  }
}

type HomeDoc = NonNullable<HOME_PAGE_QUERY_RESULT>
type ResortCard = NonNullable<NonNullable<HomeDoc["destinations"]>["resorts"]>[number]
type RoomCard = NonNullable<NonNullable<HomeDoc["rooms"]>["items"]>[number]

function mapResort(r: ResortCard): ResortSummary {
  return {
    name: r.name,
    slug: r.slug,
    tagline: r.tagline ?? r.locationLabel ?? "",
    image: toContentImage(r.heroImage, r.name),
    bookable: r.bookable ?? true,
    bookingPropertyId: r.bookingPropertyId ?? null,
  }
}

function mapRoom(r: RoomCard): RoomSummary | null {
  if (!r.resortSlug) return null
  return {
    title: r.title,
    slug: r.slug,
    resortSlug: r.resortSlug,
    summary: r.summary,
    maxGuests: r.maxGuests,
    sizeSqm: r.sizeSqm ?? null,
    image: toContentImage(r.image, r.title),
  }
}

export function mapHomePage(doc: HomeDoc): HomePage {
  const { destinations, experience, rooms, offersPanel, testimonials, stayConnected } = doc
  return {
    heroSlides: (doc.heroSlides ?? []).map((s) => ({
      eyebrow: s.eyebrow ?? "",
      title: s.title,
      text: s.text ?? "",
      image: toContentImage(s.image),
    })),
    destinations: {
      title: destinations?.title ?? "",
      subtitle: destinations?.subtitle ?? "",
      resorts: (destinations?.resorts ?? []).filter((r) => r.slug).map(mapResort),
    },
    experience: {
      title: experience?.title ?? "",
      pillars: (experience?.pillars ?? []).flatMap((p) =>
        isIconName(p.icon)
          ? [{ icon: p.icon, title: p.title, subtitle: p.subtitle ?? "", href: hrefFor(p.link) }]
          : []
      ),
      image: toContentImage(experience?.image),
    },
    rooms: {
      title: rooms?.title ?? "",
      subtitle: rooms?.subtitle ?? "",
      items: (rooms?.items ?? []).flatMap((r) => {
        const room = mapRoom(r)
        return room ? [room] : []
      }),
    },
    offersPanel: {
      title: offersPanel?.title ?? "",
      text: offersPanel?.text ?? "",
      ctaLabel: offersPanel?.ctaLabel ?? "",
      image: toContentImage(offersPanel?.image),
    },
    testimonials: {
      title: testimonials?.title ?? "",
      subtitle: testimonials?.subtitle ?? "",
      items: (testimonials?.items ?? []).map((t) => ({
        quote: t.quote,
        name: t.name,
        location: t.location ?? "",
        ...(t.avatar?.asset && { avatar: toContentImage(t.avatar, t.name) }),
      })),
      backgroundImage: toContentImage(testimonials?.backgroundImage),
    },
    stayConnected: {
      title: stayConnected?.title ?? "",
      subtitle: stayConnected?.subtitle ?? "",
    },
  }
}
