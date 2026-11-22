import { serializeJsonLd } from "@/lib/seo/json-ld"

/** Structured data as a plain script tag (Next.js JSON-LD guide). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Content strings only, with "<" escaped by serializeJsonLd.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
