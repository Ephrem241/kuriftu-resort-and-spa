import type { HomePage, ResortSummary, SiteSettings } from "./types"

/**
 * Temporary seed content until Sanity is connected (next step).
 * Copy follows the home page reference. Contact and social details come from
 * the live kurifturesorts.com. No image has a `src`, so every image slot
 * renders an on-brand placeholder instead of stock photography.
 */

const featuredResorts: ResortSummary[] = [
  {
    name: "Bishoftu",
    slug: "bishoftu",
    tagline: "Lakeside Retreat",
    image: { alt: "Kuriftu Bishoftu lakeside villas at sunset" },
    bookable: true,
    bookingPropertyId: null,
  },
  {
    name: "Awash Falls",
    slug: "awash",
    tagline: "Gorge-Side Escape",
    image: { alt: "Awash Falls cascading beside Kuriftu Awash Falls lodge" },
    bookable: true,
    bookingPropertyId: null,
  },
  {
    name: "Entoto",
    slug: "entoto",
    tagline: "Highland Adventure",
    image: { alt: "Kuriftu Entoto lodge among the Entoto highland forest" },
    bookable: true,
    bookingPropertyId: null,
  },
  {
    name: "Bahir Dar",
    slug: "laketana",
    tagline: "Blue Nile Paradise",
    image: { alt: "Kuriftu Lake Tana resort on the shore at Bahir Dar" },
    bookable: true,
    bookingPropertyId: null,
  },
  {
    name: "Arba Minch",
    slug: "arba-minch",
    tagline: "Nature's Wonder",
    image: { alt: "Kuriftu Arba Minch overlooking the lakes" },
    bookable: true,
    bookingPropertyId: null,
  },
]

export const seedSiteSettings: Omit<SiteSettings, "copyrightYear"> = {
  brandName: "Kuriftu Resorts & Spa",
  footerTagline: "More than a destination. A feeling.",
  reservationPhone: { display: "+251 999 222 211", tel: "+251999222211" },
  reservationEmail: "booking@kurifturesorts.com",
  address: "Addis Ababa, Ethiopia",
  social: [
    { platform: "facebook", url: "https://www.facebook.com/kurifturesorts/" },
    { platform: "instagram", url: "https://www.instagram.com/kr_bishoftu/" },
    {
      platform: "youtube",
      url: "https://www.youtube.com/channel/UCI3Y6eDzcmAchDoGGVJZKgA/videos",
    },
    { platform: "linkedin", url: "https://www.linkedin.com/company/kuriftu-resorts/" },
  ],
  navResorts: featuredResorts.map(({ name, slug }) => ({ name, slug })),
  bookableResorts: [
    { name: "Bishoftu", slug: "bishoftu", bookingPropertyId: null },
    { name: "African Village", slug: "african-village", bookingPropertyId: null },
    { name: "Entoto", slug: "entoto", bookingPropertyId: null },
    { name: "Lake Tana (Bahir Dar)", slug: "laketana", bookingPropertyId: null },
    { name: "Awash Falls", slug: "awash", bookingPropertyId: null },
    { name: "Arba Minch", slug: "arba-minch", bookingPropertyId: null },
    { name: "The Palm", slug: "thepalm", bookingPropertyId: null },
  ],
  experienceLinks: [
    { label: "Experiences", href: "/experience" },
    { label: "Wellness & Spa", href: "/wellness" },
    { label: "Celebrations & Events", href: "/event" },
    { label: "Offers", href: "/offers" },
  ],
  footerColumns: [
    {
      title: "Quick Links",
      links: [
        { label: "Home", href: "/" },
        { label: "Destinations", href: "/destinations" },
        { label: "Experiences", href: "/experience" },
        { label: "Dining", href: "/dining" },
      ],
    },
    {
      title: "About Kuriftu",
      links: [
        { label: "Our Story", href: "/about" },
        { label: "Offers", href: "/offers" },
        { label: "Gallery", href: "/gallery" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ],
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
  storyVideoUrl: null,
}

const heroSlide = {
  eyebrow: "Ethiopia, Your Way",
  title: "Discover a Different Side of Ethiopia.",
  text: "Luxury resorts, breathtaking nature, and unforgettable experiences.",
}

export const seedHomePage: HomePage = {
  heroSlides: [
    { ...heroSlide, image: { alt: "Kuriftu Bishoftu infinity pool and lakeside villas at dusk" } },
    { ...heroSlide, image: { alt: "Kuriftu Lake Tana resort on the water at sunrise" } },
    { ...heroSlide, image: { alt: "Kuriftu Entoto lodge in the highland forest" } },
  ],
  destinations: {
    title: "Our Destinations",
    subtitle: "Explore our stunning resorts across Ethiopia",
    resorts: featuredResorts,
  },
  experience: {
    title: "The Kuriftu Experience",
    pillars: [
      { icon: "bed", title: "Stay & Relax", subtitle: "Unwind in luxury", href: "/destinations" },
      { icon: "spa", title: "Spa & Wellness", subtitle: "Rejuvenate your mind", href: "/wellness" },
      {
        icon: "mountain",
        title: "Adventure & Nature",
        subtitle: "Explore the beauty",
        href: "/experience",
      },
      { icon: "utensils", title: "Dining & Culture", subtitle: "Savor authentic flavors", href: "/dining" },
    ],
    image: { alt: "Guest relaxing during a massage at the Kuriftu spa" },
  },
  rooms: {
    title: "Featured Accommodation",
    subtitle: "Elegant stays for every journey",
    items: [
      {
        title: "Deluxe Room",
        slug: "deluxe-room",
        resortSlug: "bishoftu",
        summary: "Spacious and elegant rooms with stunning views.",
        maxGuests: 2,
        sizeSqm: 45,
        image: { alt: "Deluxe Room with king bed and balcony overlooking the lake" },
      },
    ],
  },
  offersPanel: {
    title: "Special Offers",
    text: "Make your stay even more special",
    ctaLabel: "View Offers",
    image: { alt: "Kuriftu lakeside villas reflected in calm water" },
  },
  testimonials: {
    title: "What Our Guests Say",
    subtitle: "Real stories. Unforgettable experiences.",
    items: [
      // PLACEHOLDER from the design reference: replace with a real, attributable
      // guest review in Sanity before launch.
      {
        quote:
          "Kuriftu Resorts gave us an amazing getaway. The service, beauty and hospitality are world class!",
        name: "Sara M.",
        location: "Addis Ababa",
      },
    ],
    backgroundImage: { alt: "Ethiopian highlands at sunset" },
  },
  stayConnected: { title: "Stay Connected", subtitle: "Follow our journey" },
}
