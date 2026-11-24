"use client"

import { useEffect, useRef, type KeyboardEvent } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import { useDisclosure } from "@/components/ui/use-disclosure"
import { stepIndex } from "@/lib/content/gallery"
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

/** Dropdown of links (disclosure pattern): ArrowUp/Down move, Escape closes. */
function NavDropdown({ label, links }: { label: string; links: NavLink[] }) {
  const { setOpen, close, mounted, rootProps, triggerProps, panelProps } = useDisclosure<
    HTMLSpanElement,
    HTMLUListElement
  >()
  const focusFirst = useRef(false)

  // ArrowDown on the button opens the list and moves into it.
  useEffect(() => {
    if (!mounted || !focusFirst.current) return
    focusFirst.current = false
    panelProps.ref.current?.querySelector("a")?.focus()
  }, [mounted, panelProps.ref])

  function onTriggerKeyDown(e: KeyboardEvent) {
    if (e.key !== "ArrowDown") return
    e.preventDefault()
    const first = panelProps.ref.current?.querySelector("a")
    if (first) first.focus()
    else {
      focusFirst.current = true
      setOpen(true)
    }
  }

  function onPanelKeyDown(e: KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
    e.preventDefault()
    const items = Array.from(panelProps.ref.current?.querySelectorAll("a") ?? [])
    const at = items.indexOf(document.activeElement as HTMLAnchorElement)
    items[stepIndex(at, e.key === "ArrowDown" ? 1 : -1, items.length)]?.focus()
  }

  return (
    <span {...rootProps} className="relative inline-flex">
      <button {...triggerProps} onKeyDown={onTriggerKeyDown} className={cn(linkClass, "cursor-pointer")}>
        {label}
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.5}
          className="size-3.5 transition-transform duration-hover data-popup-open:rotate-180"
        />
      </button>
      {mounted ? (
        <ul
          {...panelProps}
          aria-label={label}
          onKeyDown={onPanelKeyDown}
          className="absolute top-full left-0 z-40 mt-2 w-max min-w-56 rounded-md border border-line bg-ivory p-2 shadow-lg transition-opacity duration-hover data-ending-style:opacity-0 data-starting-style:opacity-0"
        >
          {links.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={() => close()}
                className="block rounded-sm px-4 py-2.5 text-small text-charcoal outline-none hover:bg-beige hover:text-forest focus-visible:bg-beige focus-visible:text-forest"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </span>
  )
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
              <NavDropdown label={item.label} links={item.children} />
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
