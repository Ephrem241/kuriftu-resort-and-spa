# Kuriftu Resorts & Spa

A rebuild of the [Kuriftu Resorts & Spa](https://www.kurifturesorts.com/) website: a calm, editorial marketing site for Kuriftu's resorts, spas, and adventure parks across Ethiopia. It hands guests off to the existing booking engine with their destination, dates, and guests already filled in.

> **Status:** all pages, the Sanity content model, booking hand-off, enquiry forms, SEO and analytics are built. Deployed to Vercel for testing at https://kuriftu-resort-and-spa.vercel.app (not the launch domain yet).

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) with React 19 and TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) with brand design tokens, [shadcn/ui](https://ui.shadcn.com) conventions
- [Lucide](https://lucide.dev) icons (outline style)
- Playfair Display and Lato, self-hosted with `next/font`
- [Sanity](https://www.sanity.io) (content, standalone Studio), Zod (validation), Resend (email), PostHog (analytics)

## Local development

Copy `.env.example` to `.env.local` and fill it in, then `npm install` and `npm run dev`. Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (run tests from PowerShell on Windows).

## Sanity Studio

The Studio is its own workspace in `studio/`. Copy `studio/.env.example` to `studio/.env`, then run `npm install` and `npm run dev` in `studio/` (http://localhost:3333). It is not part of the Vercel project. It is hosted at https://kuriftu.sanity.studio (project members only). Redeploy it with `npm run deploy` from `studio/`, which also deploys the schema.

## Deploying

- Vercel project `kuriftu-resort-and-spa`: a plain Next.js app from the repo root, with no `vercel.json`. Pushes to `main` deploy to production.
- Environment variables: every key in `.env.example`, marked Sensitive. `NEXT_PUBLIC_*` values are inlined at build time, so changing one needs a redeploy.
- `NEXT_PUBLIC_SITE_URL` must be the origin the site is served from. Canonicals, the sitemap and the enquiry same-origin check all use it, and enquiries return 403 from any other origin.
- Sanity webhook (sanity.io/manage → API → Webhooks): POST to `<site>/api/revalidate` on Create, Update and Delete, with no filter, projection `{_type, "slug": slug.current}`, drafts and versions off, and the same secret as `SANITY_REVALIDATE_SECRET`. A publish then refreshes the site within a minute, with no redeploy.
