import type { NextConfig } from "next";

const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

const nextConfig: NextConfig = {
  images: {
    // Only this project's Sanity image CDN.
    remotePatterns: sanityProjectId
      ? [new URL(`https://cdn.sanity.io/images/${sanityProjectId}/**`)]
      : [],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
