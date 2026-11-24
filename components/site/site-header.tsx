import Link from "next/link"

import { BookStayLink } from "@/components/booking/book-stay-link"
import { getSiteSettings } from "@/lib/content"

import { MobileMenu } from "./mobile-menu"
import { SiteNav, type NavItem } from "./site-nav"
import { Logo } from "./logo"

export async function SiteHeader() {
  const settings = await getSiteSettings()

  const items: NavItem[] = [
    { label: "Home", href: "/" },
    {
      label: "Destinations",
      children: [
        ...settings.navResorts.map((r) => ({ label: r.name, href: `/resorts/${r.slug}` })),
        { label: "All destinations", href: "/destinations" },
      ],
    },
    { label: "Experiences", children: settings.experienceLinks },
    { label: "Dining", href: "/dining" },
    { label: "Our Story", href: "/about" },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="container-site flex h-24 items-center justify-between gap-6 lg:h-32">
        <Link href="/" className="shrink-0">
          <Logo priority className="h-12 lg:h-14" />
          <span className="sr-only">, home</span>
        </Link>

        <SiteNav items={items} />

        <div className="hidden lg:block">
          <BookStayLink source="header" />
        </div>

        <MobileMenu items={items} />
      </div>
    </header>
  )
}
