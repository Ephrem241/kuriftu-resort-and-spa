import { Globe } from "lucide-react"
import { siFacebook, siInstagram, siX, siYoutube } from "simple-icons"

import type { SocialPlatform } from "@/lib/content/types"

// Lucide 1.x has no brand logos; simple-icons provides the official marks.
// LinkedIn is not in simple-icons (removed at LinkedIn's request), so it
// falls back to a neutral Lucide icon until the brand SVG is supplied.
const PATHS: Partial<Record<SocialPlatform, string>> = {
  facebook: siFacebook.path,
  instagram: siInstagram.path,
  youtube: siYoutube.path,
  x: siX.path,
}

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  linkedin: "LinkedIn",
}

export function SocialIcon({
  platform,
  className,
}: {
  platform: SocialPlatform
  className?: string
}) {
  const path = PATHS[platform]
  if (!path) return <Globe aria-hidden="true" strokeWidth={1.5} className={className} />
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={path} />
    </svg>
  )
}
