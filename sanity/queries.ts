import { defineQuery } from "next-sanity"

/**
 * GROQ queries for the web app. Names are unique (TypeGen keys types by
 * them). `enquiry` documents are never queried here.
 */

const IMAGE = /* groq */ `{
  alt,
  crop,
  hotspot,
  asset->{ _id, url, metadata { lqip, dimensions { width, height } } }
}`

const LINK = /* groq */ `{
  label,
  linkType,
  path,
  url,
  "target": reference->{ _type, "slug": slug.current, "resortSlug": resort->slug.current }
}`

const SEO = /* groq */ `{ title, description, noIndex, ogImage${IMAGE} }`

const ADDRESS = /* groq */ `{ streetAddress, locality, region, postalCode, country }`

export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0]{
  brandName,
  footerTagline,
  storyVideoUrl,
  "reservationPhone": reservations.phones[0]{ display, tel },
  "reservationEmail": reservations.emails[0].address,
  headOfficeAddress${ADDRESS},
  "logo": logos.primary${IMAGE},
  seo${SEO},
  social[]{ platform, url },
  "navResorts": navResorts[]->{ name, "slug": slug.current },
  experienceLinks[]${LINK},
  footerColumns[]{ title, links[]${LINK} },
  legalLinks[]${LINK},
  "bookableResorts": *[_type == "resort" && bookable == true && defined(slug.current)] | order(name asc){
    name, "slug": slug.current, bookingPropertyId
  }
}`)

const RESORT_CARD = /* groq */ `{
  name,
  "slug": slug.current,
  tagline,
  locationLabel,
  bookable,
  bookingPropertyId,
  heroImage${IMAGE}
}`

const ROOM_CARD = /* groq */ `{
  title,
  "slug": slug.current,
  "resortSlug": resort->slug.current,
  summary,
  maxGuests,
  sizeSqm,
  "image": images[0]${IMAGE}
}`

export const HOME_PAGE_QUERY = defineQuery(`*[_type == "homePage"][0]{
  heroSlides[]{ eyebrow, title, text, image${IMAGE} },
  destinations { title, subtitle, "resorts": resorts[]->${RESORT_CARD} },
  experience { title, pillars[]{ icon, title, subtitle, link${LINK} }, image${IMAGE} },
  rooms { title, subtitle, "items": items[]->${ROOM_CARD} },
  offersPanel { title, text, ctaLabel, image${IMAGE} },
  testimonials { title, subtitle, items[]{ quote, name, location, avatar${IMAGE} }, backgroundImage${IMAGE} },
  stayConnected { title, subtitle },
  seo${SEO}
}`)

/** Every resort and room slug pair, for the room page's static params. */
export const ROOM_PARAMS_QUERY = defineQuery(
  `*[_type == "room" && defined(slug.current) && defined(resort->slug.current)]{ "slug": resort->slug.current, "room": slug.current }`
)

/** One room, only when it belongs to the given resort, with up to 3 sibling rooms. */
export const ROOM_PAGE_QUERY = defineQuery(`*[_type == "room" && slug.current == $room && resort->slug.current == $resort][0]{
  _id,
  title,
  "slug": slug.current,
  summary,
  overviewTitle,
  description,
  videoUrl,
  images[]${IMAGE},
  maxGuests,
  bedConfiguration,
  sizeSqm,
  view,
  amenities[]{ _key, icon, label },
  features,
  fromPrice { amount, currency, unit },
  seo${SEO},
  "resort": resort->{
    name,
    fullName,
    "slug": slug.current,
    bookable,
    bookingPropertyId,
    "phone": reservationContact.phones[0]{ display, tel },
    "email": reservationContact.emails[0].address
  },
  "related": *[_type == "room" && resort._ref == ^.resort._ref && _id != ^._id && defined(slug.current)] | order(title asc)[0...3]${ROOM_CARD}
}`)

export const RESORT_SLUGS_QUERY = defineQuery(
  `*[_type == "resort" && defined(slug.current)].slug.current`
)


export const RESORT_PAGE_QUERY = defineQuery(`*[_type == "resort" && slug.current == $slug][0]{
  _id,
  name,
  fullName,
  "slug": slug.current,
  type,
  tagline,
  summary,
  introTitle,
  locationLabel,
  intro,
  amenities[]{ _key, icon, label },
  "country": address.country,
  address${ADDRESS},
  geo { lat, lng },
  gettingHere,
  heroImage${IMAGE},
  heroVideoUrl,
  "gallery": gallery[0...2]${IMAGE},
  bookable,
  bookingPropertyId,
  "phone": reservationContact.phones[0]{ display, tel },
  "email": reservationContact.emails[0].address,
  seo${SEO},
  "rooms": *[_type == "room" && resort._ref == ^._id && defined(slug.current)] | order(title asc)${ROOM_CARD},
  "experiences": *[_type == "experience" && references(^._id) && defined(slug.current)] | order(title asc){
    category,
    "image": images[0]${IMAGE}
  },
  "spaImage": *[_type == "spaTreatment" && references(^._id) && defined(image.asset)] | order(title asc)[0].image${IMAGE},
  "diningImage": *[_type == "diningVenue" && resort._ref == ^._id && defined(images[0].asset)] | order(name asc)[0].images[0]${IMAGE}
}`)

/**
 * Indexable home, resorts and rooms for sitemap.xml. A room is left out when
 * it, or its resort, is hidden from search engines.
 */
export const SITEMAP_QUERY = defineQuery(`{
  "home": *[_type == "homePage"][0]{ _updatedAt, "noIndex": seo.noIndex == true },
  "resorts": *[_type == "resort" && defined(slug.current) && seo.noIndex != true] | order(name asc){
    "slug": slug.current, _updatedAt
  },
  "rooms": *[_type == "room" && defined(slug.current) && defined(resort->slug.current) && seo.noIndex != true && resort->seo.noIndex != true] | order(title asc){
    "slug": slug.current, "resortSlug": resort->slug.current, _updatedAt
  },
  "experiences": *[_type == "experience" && defined(slug.current) && seo.noIndex != true] | order(title asc){
    "slug": slug.current, _updatedAt
  },
  "wellness": *[_type == "wellnessPage"][0]{
    _updatedAt,
    "noIndex": seo.noIndex == true,
    "treatmentsNoIndex": treatmentsSeo.noIndex == true
  },
  "events": *[_type == "eventsPage"][0]{
    _updatedAt,
    "noIndex": seo.noIndex == true,
    "venuesNoIndex": venuesSeo.noIndex == true
  },
  "eventPackages": *[_type == "eventPackage" && defined(slug.current) && seo.noIndex != true] | order(title asc){
    "slug": slug.current, _updatedAt
  }
}`)

const OFFER_FIELDS = /* groq */ `
  _updatedAt,
  title,
  "slug": slug.current,
  shortLine,
  category,
  badge,
  startDate,
  endDate,
  showAsPopup,
  image${IMAGE}`

/** A resort an offer applies to: enough to book it or contact it. */
const OFFER_RESORT = /* groq */ `{
  name,
  fullName,
  "slug": slug.current,
  bookable,
  bookingPropertyId,
  "phone": reservationContact.phones[0]{ display, tel },
  "email": reservationContact.emails[0].address
}`

/**
 * Offers that haven't ended at $now (live or upcoming). Callers drop the
 * upcoming ones and cache until the next start or end.
 */
export const OFFERS_QUERY = defineQuery(`*[_type == "offer" && defined(slug.current) && endDate > $now] | order(endDate asc){
  ${OFFER_FIELDS},
  seo { noIndex },
  "resorts": resorts[]->${OFFER_RESORT}
}`)

/** One offer by slug, whatever its dates; the caller checks it is live. */
export const OFFER_PAGE_QUERY = defineQuery(`*[_type == "offer" && slug.current == $slug][0]{
  ${OFFER_FIELDS},
  description,
  terms,
  promoCode,
  seo${SEO},
  "resorts": resorts[]->${OFFER_RESORT}
}`)

/** Copy and photography for /offers. */
export const OFFERS_PAGE_QUERY = defineQuery(`*[_type == "offersPage"][0]{
  hero { eyebrow, title, intro, image${IMAGE} },
  banner { eyebrow, title, text, image${IMAGE}, link${LINK} },
  seo${SEO}
}`)

/** Copy and photography for /destinations, with every resort that has a slug. */
export const DESTINATIONS_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "destinationsPage"][0]{
    hero { eyebrow, title, intro, image${IMAGE} },
    seo${SEO}
  },
  "resorts": *[_type == "resort" && defined(slug.current)] | order(name asc){
    name,
    "slug": slug.current,
    type,
    tagline,
    locationLabel,
    bookable,
    bookingPropertyId,
    heroImage${IMAGE}
  }
}`)

/** An experience on a card: enough for the grid, its filters and the meta row. */
const EXPERIENCE_CARD = /* groq */ `{
  title,
  "slug": slug.current,
  category,
  summary,
  duration,
  "image": images[0]${IMAGE},
  "resorts": resorts[]->{ name, fullName, "slug": slug.current }
}`

/** Copy and photography for /experience, with every experience that has a slug. */
export const EXPERIENCES_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "experiencesPage"][0]{
    hero { eyebrow, title, intro, image${IMAGE} },
    seo${SEO}
  },
  "experiences": *[_type == "experience" && defined(slug.current)] | order(title asc)${EXPERIENCE_CARD}
}`)

export const EXPERIENCE_SLUGS_QUERY = defineQuery(
  `*[_type == "experience" && defined(slug.current)].slug.current`
)

/** One experience, with where it is offered and up to 3 others at the same resorts. */
export const EXPERIENCE_PAGE_QUERY = defineQuery(`*[_type == "experience" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  category,
  summary,
  description,
  duration,
  action,
  images[]${IMAGE},
  seo${SEO},
  "resorts": resorts[]->${OFFER_RESORT},
  "related": *[_type == "experience" && _id != ^._id && defined(slug.current) && references(^.resorts[]._ref)] | order(title asc)[0...3]${EXPERIENCE_CARD}
}`)

/** A spa treatment on a card: enough for the grid, its filters, the meta row and the form's options. */
const TREATMENT_CARD = /* groq */ `{
  title,
  "slug": slug.current,
  category,
  duration,
  "excerpt": pt::text(description),
  price{ amount, currency, unit },
  image${IMAGE},
  "resorts": resorts[]->{ name, fullName, "slug": slug.current }
}`

const ICON_FEATURE = /* groq */ `{ _key, icon, title }`

/** Copy and photography for /wellness, with every treatment that has a slug (cards and form options). */
export const WELLNESS_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "wellnessPage"][0]{
    hero { eyebrow, title, intro, image${IMAGE} },
    daySpa {
      eyebrow, title, text, image${IMAGE},
      features[]${ICON_FEATURE},
      "resort": resort->{ name, "slug": slug.current }
    },
    treatments {
      title, subtitle,
      cards[]{ _key, group, title, subtitle, image${IMAGE} }
    },
    booking { eyebrow, title, text, tagline, image${IMAGE} },
    whyChoose { title, features[]${ICON_FEATURE}, image${IMAGE} },
    seo${SEO}
  },
  "treatments": *[_type == "spaTreatment" && defined(slug.current)] | order(title asc)${TREATMENT_CARD}
}`)

/** Heading and SEO for /wellness/treatments, with every treatment that has a slug. */
export const TREATMENTS_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "wellnessPage"][0]{
    treatmentsIndex { eyebrow, title, intro },
    treatmentsSeo${SEO},
    "fallbackImage": hero.image${IMAGE}
  },
  "treatments": *[_type == "spaTreatment" && defined(slug.current)] | order(title asc)${TREATMENT_CARD}
}`)

/** An event venue on a card: enough for the grid, its filter and the meta row. */
const VENUE_CARD = /* groq */ `{
  _id,
  name,
  capacity,
  "setups": setups[].style,
  "excerpt": pt::text(description),
  "image": images[0]${IMAGE},
  "resort": resort->{ name, fullName, "slug": slug.current }
}`

/** An event package on a card. */
const PACKAGE_CARD = /* groq */ `{
  title,
  "slug": slug.current,
  kind,
  summary,
  fromPrice{ amount, currency, unit },
  "image": images[0]${IMAGE},
  "resorts": resorts[]->{ name, fullName, "slug": slug.current }
}`

/**
 * Copy and photography for /event, with the packages its cards point at,
 * plus every package and every resort with a venue (the form's `?package=`
 * and `?resort=` are matched against these).
 */
export const EVENTS_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "eventsPage"][0]{
    hero { eyebrow, title, intro, image${IMAGE} },
    eventTypes {
      title, subtitle,
      tiles[]{ _key, eventType, title, icon, image${IMAGE} }
    },
    venues {
      title, subtitle, text,
      "featured": featured->${VENUE_CARD},
      "highlights": highlights[]->{ _id, name }
    },
    packages {
      title, subtitle,
      cards[]{ _key, kind, title, text, image${IMAGE}, "package": package->${PACKAGE_CARD} }
    },
    enquiry { title, text, image${IMAGE} },
    seo${SEO}
  },
  "packageOptions": *[_type == "eventPackage" && defined(slug.current)] | order(title asc){
    title, "slug": slug.current, kind, "resorts": resorts[]->{ name, fullName, "slug": slug.current }
  },
  "venueResorts": *[_type == "resort" && defined(slug.current) && count(*[_type == "eventVenue" && references(^._id)]) > 0] | order(name asc){
    name, fullName, "slug": slug.current
  }
}`)

/** Heading and SEO for /event/venues, with every venue. */
export const VENUES_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "eventsPage"][0]{
    venuesIndex { eyebrow, title, intro },
    venuesSeo${SEO},
    "fallbackImage": hero.image${IMAGE}
  },
  "venues": *[_type == "eventVenue" && defined(resort->slug.current)] | order(resort->name asc, name asc)${VENUE_CARD}
}`)

export const EVENT_PACKAGE_SLUGS_QUERY = defineQuery(
  `*[_type == "eventPackage" && defined(slug.current)].slug.current`
)

/** One event package, its venues, and up to 3 others of the same kind. */
export const EVENT_PACKAGE_QUERY = defineQuery(`*[_type == "eventPackage" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  kind,
  summary,
  description,
  inclusions,
  fromPrice{ amount, currency, unit },
  images[]${IMAGE},
  seo${SEO},
  "resorts": resorts[]->${OFFER_RESORT},
  "venues": venues[]->{ _id, name, capacity, "resort": resort->{ name, fullName, "slug": slug.current } },
  "fallbackImage": *[_type == "eventsPage"][0].hero.image${IMAGE},
  "related": *[_type == "eventPackage" && _id != ^._id && kind == ^.kind && defined(slug.current)] | order(title asc)[0...3]${PACKAGE_CARD}
}`)

const ENQUIRY_CONTACT =/* groq */ `{ phones[]{ display, tel }, emails[]{ address } }`

/**
 * Enquiry route only (never page rendering): the chosen resort and the
 * site-wide contacts used to pick a recipient and a fallback phone.
 */
export const ENQUIRY_CONTEXT_QUERY = defineQuery(`{
  "resort": *[_type == "resort" && slug.current == $slug][0]{
    _id,
    name,
    reservationContact${ENQUIRY_CONTACT}
  },
  "treatment": *[_type == "spaTreatment" && slug.current == $treatment][0]{
    _id,
    title,
    "resorts": resorts[]->{ _id, name, "slug": slug.current, reservationContact${ENQUIRY_CONTACT} }
  },
  "package": *[_type == "eventPackage" && slug.current == $package][0]{
    _id,
    title,
    "resorts": resorts[]->{ _id, name, "slug": slug.current, reservationContact${ENQUIRY_CONTACT} }
  },
  "settings": *[_type == "siteSettings"][0]{
    reservations${ENQUIRY_CONTACT},
    headOffice${ENQUIRY_CONTACT}
  }
}`)
