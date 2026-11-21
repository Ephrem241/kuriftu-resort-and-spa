"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "@base-ui/react/menu"
import { ChevronDown } from "lucide-react"

import type { NavLink } from "@/lib/content/types"
import { cn } from "@/lib/utils"

export type NavItem =
  | { label: string; href: string; children?: never }
  | { label: string; children: NavLink[]; href?: never }

const linkClass =
  "relative inline-flex items-center gap-1 py-2 text-small text-charcoal transition-colors duration-hover ease-soft hover:text-forest"

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

/** Desktop navigation (≥1025px) with click/keyboard dropdowns. */
export function SiteNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-10">
        {items.map((item) => (
          <li key={item.label}>
            {item.children ? (
              <Menu.Root>
                <Menu.Trigger className={cn(linkClass, "cursor-pointer")}>
                  {item.label}
                  <ChevronDown
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="size-3.5 transition-transform duration-hover data-popup-open:rotate-180"
                  />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner sideOffset={8} align="start" className="z-40">
                    <Menu.Popup className="min-w-56 rounded-md border border-line bg-ivory p-2 shadow-lg transition-opacity duration-hover data-ending-style:opacity-0 data-starting-style:opacity-0">
                      {item.children.map((child) => (
                        <Menu.LinkItem
                          key={child.href}
                          closeOnClick
                          render={<Link href={child.href} />}
                          className="block rounded-sm px-4 py-2.5 text-small text-charcoal outline-none data-highlighted:bg-beige data-highlighted:text-forest"
                        >
                          {child.label}
                        </Menu.LinkItem>
                      ))}
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            ) : (
              <Link
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={cn(
                  linkClass,
                  "after:absolute after:inset-x-0 after:-bottom-1 after:mx-auto after:h-px after:w-0 after:bg-forest after:transition-all after:duration-hover aria-[current=page]:after:w-full hover:after:w-full"
                )}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
