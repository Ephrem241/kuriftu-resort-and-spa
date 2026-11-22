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
  }
}`)

const ENQUIRY_CONTACT = /* groq */ `{ phones[]{ display, tel }, emails[]{ address } }`

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
  "settings": *[_type == "siteSettings"][0]{
    reservations${ENQUIRY_CONTACT},
    headOffice${ENQUIRY_CONTACT}
  }
}`)
