import "server-only"

import { createClient } from "next-sanity"

import { apiVersion, dataset, projectId } from "../env"
import { readToken } from "./token"

/** Published content only, read with the server-side Viewer token. */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  token: readToken,
})
