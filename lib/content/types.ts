/**
 * Content shapes, mirroring the GROQ projections Sanity will return.
 * Components depend on these types only, never on where content comes from.
 */

export type ContentImage = {
  /** Image URL. Absent until real photography is in Sanity → placeholder. */
  src?: string
  alt: string
  /** Base64 low-quality placeholder from Sanity's asset metadata. */
  lqip?: string
}

export type SocialPlatform = "facebook" | "instagram" | "youtube" | "x" | "linkedin"

export type SocialLink = { platform: SocialPlatform; url: string }

export type NavLink = { label: string; href: string }

export type ResortSummary = {
  name: string
  slug: string
  /** Short location line shown on tiles, e.g. "Lakeside Retreat". */
  tagline: string
  image: ContentImage
  /** Overnight stays can be booked (water park and day spa cannot). */
  bookable: boolean
  /** TravelBook property id, when known. */
  bookingPropertyId: string | null
}

export type SiteSettings = {
  brandName: string
  footerTagline: string
  reservationPhone: { display: string; tel: string }
  reservationEmail: string
  address: string
  social: SocialLink[]
  /** Resorts listed in the Destinations nav and footer. */
  navResorts: Pick<ResortSummary, "name" | "slug">[]
  /** Resorts offered in the availability search. */
  bookableResorts: Pick<ResortSummary, "name" | "slug" | "bookingPropertyId">[]
  experienceLinks: NavLink[]
  footerColumns: { title: string; links: NavLink[] }[]
  legalLinks: NavLink[]
  /** YouTube or Vimeo URL for "Our Story". */
  storyVideoUrl: string | null
  copyrightYear: number
}

export type HeroSlide = {
  eyebrow: string
  title: string
  text: string
  image: ContentImage
}

export type ExperiencePillar = {
  icon: "stay" | "spa" | "adventure" | "dining"
  title: string
  subtitle: string
  href: string
}

export type RoomSummary = {
  title: string
  slug: string
  resortSlug: string
  summary: string
  maxGuests: number
  sizeSqm: number | null
  image: ContentImage
}

export type Testimonial = {
  quote: string
  name: string
  location: string
  avatar?: ContentImage
}

export type HomePage = {
  heroSlides: HeroSlide[]
  destinations: {
    title: string
    subtitle: string
    resorts: ResortSummary[]
  }
  experience: {
    title: string
    pillars: ExperiencePillar[]
    image: ContentImage
  }
  rooms: {
    title: string
    subtitle: string
    items: RoomSummary[]
  }
  offersPanel: {
    title: string
    text: string
    ctaLabel: string
    image: ContentImage
  }
  testimonials: {
    title: string
    subtitle: string
    items: Testimonial[]
    backgroundImage: ContentImage
  }
  stayConnected: { title: string; subtitle: string }
}
