import { MediaImage } from "@/components/ui/media-image"
import { SOCIAL_LABELS, SocialIcon } from "@/components/ui/social-icon"
import type { HomePage, SocialLink } from "@/lib/content/types"

import { Testimonials } from "./testimonials"

/** Forest band: "What Our Guests Say" (left) and "Stay Connected" (right). */
export function GuestsBand({
  testimonials,
  stayConnected,
  social,
}: {
  testimonials: HomePage["testimonials"]
  stayConnected: HomePage["stayConnected"]
  social: SocialLink[]
}) {
  return (
    <section
      aria-labelledby="guests-title"
      className="relative isolate mt-16 overflow-hidden rounded-tl-[3rem] bg-forest lg:mt-20 lg:rounded-tl-[5rem]"
    >
      <div className="absolute inset-0 -z-10 opacity-40">
        <MediaImage image={testimonials.backgroundImage} sizes="100vw" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-forest/75" />

      <div className="container-site grid gap-12 py-14 lg:grid-cols-[1.6fr_1fr] lg:gap-0 lg:py-12">
        <div className="lg:border-r lg:border-ivory/20 lg:pr-12">
          <h2 id="guests-title" className="text-h3 text-ivory">
            {testimonials.title}
          </h2>
          <p className="mt-1 text-small text-ivory/90">{testimonials.subtitle}</p>
          <Testimonials items={testimonials.items} />
        </div>

        <div className="flex flex-col items-center text-center lg:pl-12">
          <h2 className="text-h3 text-ivory">{stayConnected.title}</h2>
          <p className="mt-1 text-small text-ivory/90">{stayConnected.subtitle}</p>
          <ul className="mt-6 flex items-center gap-6">
            {social.map((s) => (
              <li key={s.platform}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${SOCIAL_LABELS[s.platform]} (opens in a new tab)`}
                  className="flex size-10 items-center justify-center text-ivory transition-colors duration-hover hover:text-gold"
                >
                  <SocialIcon platform={s.platform} className="size-6" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
