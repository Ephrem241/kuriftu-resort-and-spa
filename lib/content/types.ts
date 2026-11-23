import type { BookingProperty } from "@/lib/booking/handoff"
import type { EventType } from "@/lib/enquiry/schema"

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
  /** Can be booked online: bookable in Studio and carried by TravelBook. */
  bookable: boolean
  /** TravelBook property; null exactly when `bookable` is false. */
  bookingProperty: BookingProperty | null
}

/** One sitemap row: a site path and when its content last changed. */
export type SitemapEntry = { path: string; lastModified?: string }

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
  bookableResorts: Pick<ResortSummary, "name" | "slug" | "bookingProperty">[]
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
    bookingProperty: BookingProperty | null
  } & PropertyContact
  related: RoomSummary[]
}

/** A dated offer; shown only while live (see lib/content/offers.ts). */
export type OfferCategory = "deals" | "stay" | "wellness" | "dining" | "family"

export type OfferSummary = {
  title: string
  slug: string
  shortLine: string
  category: OfferCategory
  /** Editor's image label, e.g. "20% OFF"; empty for none. */
  badge: string
  /** ISO datetimes; live from start (inclusive) to end (exclusive). */
  startDate: string
  endDate: string
  showAsPopup: boolean
  image: ContentImage
  /** Empty when the offer applies to every resort. */
  resorts: OfferResort[]
  noIndex: boolean
  lastModified: string
}

/** Copy and photography for /offers. */
export type OffersPage = {
  hero: { eyebrow: string; title: string; intro: string; image: ContentImage | null }
  /** Null when the editor left out its title or image. */
  banner: { eyebrow: string; title: string; text: string; image: ContentImage; link: NavLink | null } | null
  seo: PageSeo
}

export type DestinationsPage = {
  hero: { eyebrow: string; title: string; intro: string; image: ContentImage | null }
  /** Resorts in page order, split into the page's groups. Empty groups are left out. */
  groups: {
    id: string
    title: string
    subtitle: string
    resorts: ResortSummary[]
  }[]
  seo: PageSeo
}

export type OfferResort = {
  name: string
  heading: string
  slug: string
  bookable: boolean
  bookingProperty: BookingProperty | null
} & PropertyContact

export type OfferPage = Omit<OfferSummary, "resorts" | "noIndex" | "lastModified"> & {
  description: RichText
  terms: RichText
  promoCode: string
  seo: PageSeo
  resorts: OfferResort[]
}

export type ResortType ="resortAndSpa" | "adventurePark" | "waterPark" | "daySpa"

export type ExperienceCategory = "water" | "adventure" | "nature" | "culture" | "family" | "dining"

/** A resort an experience is offered at, as shown on cards and used by the filters. */
export type ExperienceResort = { name: string; heading: string; slug: string }

export type ExperienceSummary = {
  title: string
  slug: string
  category: ExperienceCategory
  summary: string
  /** Editor's duration, e.g. "2 hours"; empty when not set. */
  duration: string
  image: ContentImage
  resorts: ExperienceResort[]
}

/** Copy and photography for /experience, with every experience. */
export type ExperiencesPage = {
  hero: { eyebrow: string; title: string; intro: string; image: ContentImage | null }
  experiences: ExperienceSummary[]
  seo: PageSeo
}

export type ExperiencePage = Omit<ExperienceSummary, "image" | "resorts"> & {
  /** At least one; the first is the hero. */
  images: ContentImage[]
  /** Falls back to the summary as one paragraph when empty. */
  description: RichText
  /** "book" hands off to the booking engine; "enquire" shows contact actions. */
  action: "book" | "enquire"
  seo: PageSeo
  resorts: OfferResort[]
  related: ExperienceSummary[]
}

export type SpaCategory = "massage" | "facial" | "body" | "hammam" | "handsFeet" | "hair" | "package"

/** The design's five treatment cards; each covers one or more spa categories. */
export type TreatmentGroup = "massage" | "facial" | "body" | "packages" | "beauty"

export type TreatmentSummary = {
  title: string
  slug: string
  category: SpaCategory
  /** Plain-text description, trimmed to a card-length excerpt; empty when none. */
  excerpt: string
  /** Editor's duration, e.g. "60 minutes"; empty when not set. */
  duration: string
  /** Display-only, entered by an editor. */
  price: { amount: number; currency: string; unit: string } | null
  image: ContentImage
  resorts: ExperienceResort[]
}

export type IconFeature = { key: string; icon: IconName | null; title: string }

/** Copy and photography for /wellness, with every treatment (cards and form options). */
export type WellnessPage = {
  hero: { eyebrow: string; title: string; intro: string; image: ContentImage | null }
  /** Null when the editor left out its title or image. */
  daySpa: {
    eyebrow: string
    title: string
    text: string
    image: ContentImage
    features: IconFeature[]
  } | null
  treatments: {
    title: string
    subtitle: string
    cards: { key: string; group: TreatmentGroup; title: string; subtitle: string; image: ContentImage }[]
  }
  /** Copy beside the booking form; the form shows even without it. */
  booking: { eyebrow: string; title: string; text: string; tagline: string; image: ContentImage | null }
  /** Null when the editor left out its title or image. */
  whyChoose: { title: string; features: IconFeature[]; image: ContentImage } | null
  treatmentList: TreatmentSummary[]
  seo: PageSeo
}

/** Heading and SEO for /wellness/treatments, with every treatment. */
export type TreatmentsPage = {
  eyebrow: string
  title: string
  intro: string
  treatments: TreatmentSummary[]
  /** OG image fallback: the wellness hero. */
  image: ContentImage | null
  seo: PageSeo
}

export type PackageKind = "wedding" | "meeting" | "celebration"

/** Display-only "from" price, entered by an editor. */
export type DisplayPrice = { amount: number; currency: string; unit: string } | null

export type VenueSummary = {
  id: string
  name: string
  /** Editor's maximum capacity; null when not entered. */
  capacity: number | null
  /** Setup styles, e.g. "Theatre"; empty when none entered. */
  setups: string[]
  excerpt: string
  image: ContentImage
  resort: ExperienceResort
}

export type PackageSummary = {
  title: string
  slug: string
  kind: PackageKind
  summary: string
  price: DisplayPrice
  image: ContentImage
  resorts: ExperienceResort[]
}

/** A package the enquiry form can be preset with (`?package=`). */
export type PackageOption = Pick<PackageSummary, "title" | "slug" | "kind" | "resorts">

/** Copy and photography for /event. */
export type EventsPage = {
  hero: { eyebrow: string; title: string; intro: string; image: ContentImage | null }
  eventTypes: {
    title: string
    subtitle: string
    tiles: { key: string; eventType: EventType; title: string; icon: IconName | null; image: ContentImage }[]
  }
  venues: {
    title: string
    subtitle: string
    text: string
    featured: VenueSummary | null
    highlights: { id: string; name: string }[]
  }
  packages: {
    title: string
    subtitle: string
    cards: { key: string; kind: PackageKind; title: string; text: string; image: ContentImage; package: PackageSummary }[]
  }
  enquiry: { title: string; text: string; image: ContentImage | null }
  packageOptions: PackageOption[]
  /** Resorts with at least one venue (the form's `?resort=`). */
  venueResorts: ExperienceResort[]
  seo: PageSeo
}

/** Heading and SEO for /event/venues, with every venue. */
export type VenuesPage = {
  eyebrow: string
  title: string
  intro: string
  venues: VenueSummary[]
  /** OG image fallback: the events hero. */
  image: ContentImage | null
  seo: PageSeo
}

export type EventPackagePage = Omit<PackageSummary, "image"> & {
  /** At least one; the first is the hero (the events hero when the package has none). */
  images: ContentImage[]
  description: RichText
  inclusions: string[]
  resorts: OfferResort[]
  venues: { id: string; name: string; capacity: number | null; resort: ExperienceResort | null }[]
  related: PackageSummary[]
  seo: PageSeo
}

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
  bookingProperty: BookingProperty | null
  phone: { display: string; tel: string } | null
  email: string | null
  seo: PageSeo
  rooms: RoomSummary[]
  experiences: { category: ExperienceCategory; image: ContentImage }[]
  spaImage: ContentImage | null
  diningImage: ContentImage | null
}

/** One block of a flexible marketing page; incomplete blocks are dropped by the mapper. */
export type PageSection =
  | { type: "text"; key: string; eyebrow: string; heading: string; body: RichText }
  | {
      type: "mediaText"
      key: string
      eyebrow: string
      heading: string
      body: RichText
      image: ContentImage
      imagePosition: "start" | "end"
      link: NavLink | null
    }
  | { type: "features"; key: string; heading: string; intro: string; items: IconFeature[] }
  | { type: "gallery"; key: string; heading: string; images: ContentImage[] }
  | { type: "cta"; key: string; heading: string; text: string; link: NavLink; image: ContentImage | null }
  | { type: "video"; key: string; title: string; embedUrl: string; poster: ContentImage }

/** About, Sustainability, Training, Privacy and the other `page` documents. */
export type MarketingPage = {
  title: string
  slug: string
  hero: { eyebrow: string; title: string; intro: string; image: ContentImage | null }
  sections: PageSection[]
  seo: PageSeo
}

export type ContactPhone = { label: string; display: string; tel: string }
export type ContactEmail = { label: string; address: string }
/** Every phone and email of one contactDetails object, in editor order. */
export type ContactChannels = { phones: ContactPhone[]; emails: ContactEmail[] }

/** One resort in the /contact directory, with its own reservation contacts. */
export type ResortContact = ContactChannels & {
  name: string
  heading: string
  slug: string
  locationLabel: string
  address: PostalAddress | null
}

export type ContactPage = {
  hero: { eyebrow: string; title: string; intro: string; image: ContentImage | null }
  form: { eyebrow: string; title: string; text: string; image: ContentImage | null }
  directoryTitle: string
  reservations: ContactChannels
  headOffice: ContactChannels & { address: PostalAddress | null }
  resorts: ResortContact[]
  seo: PageSeo
}

/** A resort that has gallery photos, for the /gallery filter. */
export type GalleryResort = { name: string; heading: string; slug: string; count: number }

export type GalleryPhoto = { image: ContentImage; resortSlug: string; resortName: string }

export type GalleryPage = {
  hero: { eyebrow: string; title: string; intro: string; image: ContentImage | null }
  resorts: GalleryResort[]
  /** Every photo, resort by resort in name order, each in the editor's order. */
  photos: GalleryPhoto[]
  seo: PageSeo
}
