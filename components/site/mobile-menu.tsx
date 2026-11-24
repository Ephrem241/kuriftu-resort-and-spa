"use client"

import { useId, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, Menu as MenuIcon, X } from "lucide-react"

import { BookStayLink } from "@/components/booking/book-stay-link"
import { Modal } from "@/components/ui/modal"

import type { NavItem } from "./site-nav"
import { Logo } from "./logo"

/** Navigation sheet below 1025px. Modal (page inert), Escape closes. */
export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const close = () => setOpen(false)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-forest text-forest lg:hidden"
      >
        <MenuIcon aria-hidden="true" strokeWidth={1.5} className="size-5" />
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        labelledBy={titleId}
        finalFocus={() => triggerRef.current}
        backdropClassName="fixed inset-0 z-40 bg-charcoal/40 transition-opacity duration-page data-ending-style:opacity-0 data-starting-style:opacity-0"
        popupClassName="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto bg-ivory px-6 pb-8 transition-transform duration-page ease-soft data-ending-style:translate-x-full data-starting-style:translate-x-full"
      >
        <div className="flex h-24 items-center justify-between">
          <span id={titleId}>
            <Logo />
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-forest text-forest"
          >
            <X aria-hidden="true" strokeWidth={1.5} className="size-5" />
          </button>
        </div>

        <nav aria-label="Main" className="mt-4 flex-1">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) =>
              item.children ? (
                <li key={item.label}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-heading text-h4 text-forest [&::-webkit-details-marker]:hidden">
                      {item.label}
                      <ChevronDown
                        aria-hidden="true"
                        strokeWidth={1.5}
                        className="size-4 transition-transform duration-hover group-open:rotate-180"
                      />
                    </summary>
                    <ul className="pb-4 pl-4">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={close}
                            className="block py-2 text-body text-charcoal hover:text-forest"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : (
                <li key={item.label}>
                  <Link href={item.href} onClick={close} className="block py-4 font-heading text-h4 text-forest">
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <BookStayLink source="mobile-menu" className="mt-8 w-full" />
      </Modal>
    </>
  )
}
