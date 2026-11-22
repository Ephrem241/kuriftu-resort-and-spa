"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, X } from "lucide-react"

import { CONSENT_DECIDED_EVENT } from "@/components/site/consent-banner"
import { MediaImage } from "@/components/ui/media-image"
import { track } from "@/lib/analytics"
import { browserStorage, readConsent } from "@/lib/analytics/consent"
import type { ContentImage } from "@/lib/content/types"

export type PopupOffer = {
  slug: string
  title: string
  subtitle: string
  href: string
  image: ContentImage
  endDate: string
}

const DELAY_MS = 4000
const SOURCE = "popup"

function seenKey(slug: string) {
  return `kuriftu:offer-popup:${slug}`
}

/**
 * Non-blocking offer card, bottom right. Shows once per browser session,
 * after the consent choice (when one is asked), never on offer pages and
 * never after the offer ends. No backdrop and no focus trap.
 */
export function OfferPopupCard({ offer, consentRequired }: { offer: PopupOffer; consentRequired: boolean }) {
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()
  const onOfferPage = pathname === "/offers" || pathname.startsWith("/offers/")

  useEffect(() => {
    if (onOfferPage) return
    const end = Date.parse(offer.endDate)
    if (!(Date.now() < end)) return
    try {
      if (window.sessionStorage.getItem(seenKey(offer.slug))) return
    } catch {
      return
    }

    let timer: ReturnType<typeof setTimeout> | undefined
    function schedule() {
      timer = setTimeout(() => {
        if (!(Date.now() < end)) return
        try {
          window.sessionStorage.setItem(seenKey(offer.slug), "seen")
        } catch {
          return
        }
        setVisible(true)
        track("offer_viewed", { offer: offer.slug, source: SOURCE })
      }, DELAY_MS)
    }

    const waitForConsent = consentRequired && readConsent(browserStorage()) === "undecided"
    if (waitForConsent) window.addEventListener(CONSENT_DECIDED_EVENT, schedule, { once: true })
    else schedule()

    return () => {
      window.removeEventListener(CONSENT_DECIDED_EVENT, schedule)
      if (timer) clearTimeout(timer)
    }
  }, [offer.slug, offer.endDate, consentRequired, onOfferPage])

  if (!visible || onOfferPage) return null

  function dismiss() {
    setVisible(false)
    track("offer_dismissed", { offer: offer.slug, source: SOURCE })
  }

  return (
    <section
      aria-labelledby="offer-popup-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") dismiss()
      }}
      className="fixed inset-x-4 bottom-4 z-40 flex animate-fade-in overflow-hidden rounded-md border border-line bg-ivory shadow-lg motion-reduce:animate-none md:inset-x-auto md:right-6 md:bottom-6 md:w-[420px]"
    >
      <div className="relative hidden w-36 shrink-0 bg-beige md:block">
        <MediaImage image={offer.image} sizes="144px" />
      </div>

      <div className="flex flex-1 flex-col p-5 pr-12">
        <p className="eyebrow text-forest">Special Offer</p>
        <h2 id="offer-popup-title" className="mt-2 text-h4">
          {offer.title}
        </h2>
        {offer.subtitle ? <p className="mt-1 text-small text-charcoal">{offer.subtitle}</p> : null}
        <Link
          href={offer.href}
          onClick={() => setVisible(false)}
          className="group/action eyebrow mt-4 inline-flex items-center gap-2 self-start text-forest hover:text-charcoal"
        >
          View offer
          <ArrowRight
            aria-hidden="true"
            strokeWidth={1.5}
            className="size-4 transition-transform duration-hover ease-soft group-hover/action:translate-x-1"
          />
        </Link>
      </div>

      <button
        type="button"
        aria-label="Close offer"
        onClick={dismiss}
        className="absolute top-1 right-1 flex size-11 cursor-pointer items-center justify-center rounded-full text-charcoal hover:text-forest"
      >
        <X aria-hidden="true" strokeWidth={1.5} className="size-5" />
      </button>
    </section>
  )
}
