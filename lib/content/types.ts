import type { IconName } from "./icons"

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
  /** CSS object-position from the Sanity hotspot, e.g. "40% 60%". */
  objectPosition?: string
}

export type SocialPlatform = "facebook" | "instagram" | "youtube" | "x" | "linkedin" | "tiktok"

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

/** One sitemap row: a site path and when its content last changed. */
export type SitemapEntry = { path: string; lastModified: string }

/** Title, description, share image and indexing for one page. */
export type PageSeo = {
  title: string
  description: string
  /** Editor's Open Graph override; pages fall back to their hero. */
  image: ContentImage | null
  noIndex: boolean
}

/** A postal address; empty strings for parts an editor left blank. */
export type PostalAddress = {
  street: string
  locality: string
  region: string
  postalCode: string
  country: string
}

export type SiteSettings = {
  brandName: string
  footerTagline: string
  reservationPhone: { display: string; tel: string } | null
  reservationEmail: string | null
  address: string | null
  headOfficeAddress: PostalAddress | null
  /** Primary logo, when one is uploaded. */
  logo: ContentImage | null
  /** Default SEO for the site. */
  seo: PageSeo
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
  icon: IconName
  title: string
  subtitle: string
  href: string
}

export type RoomSummary = {
  title: string
  slug: string
  resortSlug: string
  summary: string
  maxGuests: number | null
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
  /** Empty fields fall back to the site's Default SEO. */
  seo: PageSeo
}

export type Amenity = { key: string; icon: IconName | null; label: string }

/** Contact for one property, from its reservation contact in Sanity. */
export type PropertyContact = {
  phone: { display: string; tel: string } | null
  email: string | null
}

export type RoomPage = {
  title: string
  slug: string
  summary: string
  overviewTitle: string
  /** Falls back to the summary as one paragraph when empty. */
  description: RichText
  videoUrl: string | null
  /** At least one; the first is the hero. */
  images: ContentImage[]
  maxGuests: number | null
  bedConfiguration: string
  sizeSqm: number | null
  view: string
  amenities: Amenity[]
  features: string[]
  /** Display-only "from" price, entered by an editor. */
  fromPrice: { amount: number; currency: string; unit: string } | null
  seo: PageSeo
  resort: {
    name: string
    /** "Kuriftu Resort & Spa Bishoftu", or the name. */
    heading: string
    slug: string
    bookable: boolean
    bookingPropertyId: string | null
  } & PropertyContact
  related: RoomSummary[]
}

export type ResortType ="resortAndSpa" | "adventurePark" | "waterPark" | "daySpa"

export type ExperienceCategory = "water" | "adventure" | "nature" | "culture" | "family" | "dining"

/** Portable Text blocks, rendered by components/ui/portable-text.tsx. */
export type RichText = Array<{ _type: string; _key: string; [key: string]: unknown }>

export type ResortPage = {
  name: string
  /** Page heading, e.g. "Kuriftu Resort & Spa Bishoftu". */
  heading: string
  slug: string
  type: ResortType
  locationLabel: string
  country: string
  address: PostalAddress | null
  summary: string
  introTitle: string
  intro: RichText
  amenities: Amenity[]
  geo:{ lat: number; lng: number } | null
  gettingHere: string
  heroImage: ContentImage
  /** Image for the about card. */
  aboutImage: ContentImage
  /** Image for the booking panel. */
  ctaImage: ContentImage
  heroVideoUrl: string | null
  bookable: boolean
  bookingPropertyId: string | null
  phone: { display: string; tel: string } | null
  email: string | null
  seo: PageSeo
  rooms: RoomSummary[]
  experiences: { category: ExperienceCategory; image: ContentImage }[]
  spaImage: ContentImage | null
  diningImage: ContentImage | null
}
