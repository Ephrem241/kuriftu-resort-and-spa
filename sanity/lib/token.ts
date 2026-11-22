import "server-only"

/** Viewer token for the private dataset. Server only; never re-export. */
export const readToken = process.env.SANITY_API_READ_TOKEN
