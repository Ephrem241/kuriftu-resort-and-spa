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

export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0]{
  brandName,
  footerTagline,
  storyVideoUrl,
  "reservationPhone": reservations.phones[0]{ display, tel },
  "reservationEmail": reservations.emails[0].address,
  headOfficeAddress { locality, country },
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
  stayConnected { title, subtitle }
}`)
