/**
 * Converts a YouTube or Vimeo page URL into a privacy-friendly embed URL.
 * Anything else returns null, so arbitrary URLs never reach an iframe.
 */
export function toEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null

  let url: URL
  try {
    url = new URL(input)
  } catch {
    return null
  }
  if (url.protocol !== "https:") return null

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "")
  const ytId = /^[A-Za-z0-9_-]{11}$/

  if (host === "youtube.com") {
    const id =
      url.pathname === "/watch"
        ? url.searchParams.get("v")
        : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1]
    return id && ytId.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
      : null
  }

  if (host === "youtu.be") {
    const id = url.pathname.slice(1)
    return ytId.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
      : null
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.match(/^\/(?:video\/)?(\d{6,12})$/)?.[1]
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1` : null
  }

  return null
}
