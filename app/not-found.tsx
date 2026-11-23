import type { Metadata } from "next"

import { ButtonLink } from "@/components/ui/button"

export const metadata: Metadata = { title: "Page not found" }

/** 404 inside the site chrome, using the compact page heading pattern. */
export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <section className="container-site animate-fade-in pt-32 pb-24 lg:pt-36 lg:pb-32">
        <p className="eyebrow flex items-center gap-3 text-forest">
          <span aria-hidden="true" className="h-px w-8 bg-gold" />
          Page not found
        </p>
        <h1 className="mt-3 max-w-2xl">We couldn&rsquo;t find that page</h1>
        <p className="mt-4 max-w-xl text-body text-charcoal">
          The page may have moved. Start again from the home page or explore our destinations.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonLink href="/" variant="primary" arrow>
            Back to Home
          </ButtonLink>
          <ButtonLink href="/destinations" variant="outline" arrow>
            Explore Destinations
          </ButtonLink>
        </div>
      </section>
    </main>
  )
}
