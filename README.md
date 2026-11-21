# Kuriftu Resorts & Spa

A rebuild of the [Kuriftu Resorts & Spa](https://www.kurifturesorts.com/) website: a calm, editorial marketing site for Kuriftu's resorts, spas, and adventure parks across Ethiopia. It hands guests off to the existing booking engine with their destination, dates, and guests already filled in.

> **Status:** early development. The brand design system is in place. Pages, the Sanity content model, booking hand-off, and enquiry forms are still to come.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) with React 19 and TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) with brand design tokens
- [Base UI](https://base-ui.com) and [shadcn/ui](https://ui.shadcn.com) conventions for components
- [Lucide](https://lucide.dev) icons (outline style)
- Playfair Display and Lato, self-hosted with `next/font`

Planned: Sanity (content), Zod (form validation), Resend (email), PostHog (analytics).

## Getting started

Requires Node.js 20 or later.

```bash
npm install
npm run dev
```

Then open:

- http://localhost:3000 for the site
- http://localhost:3000/design-system for the design system reference (development only, returns 404 in production)

## Scripts

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the development server    |
| `npm run build`     | Create a production build       |
| `npm start`         | Serve the production build      |
| `npm run typecheck` | Type-check with TypeScript      |
| `npm run lint`      | Lint with ESLint                |

## Design system

All brand tokens live in [`app/globals.css`](app/globals.css). Components use the Tailwind utilities, never raw hex values.

| Token      | Use                                  |
| ---------- | ------------------------------------ |
| `forest`   | Primary buttons, footer, headings    |
| `sage`     | Secondary accents                    |
| `beige`    | Section backgrounds, cards           |
| `ivory`    | Page background                      |
| `gold`     | Logo mark, accents, dividers, icons  |
| `charcoal` | Body text                            |

Also available:

- **Type scale:** `text-h1` to `text-h4`, `text-body`, `text-small`, `text-caption`. Sizes step down below 1025px.
- **Helpers:** `eyebrow` (uppercase tracked labels), `accent` (Playfair italic taglines), `container-site` (90% width, 1440px max).
- **Motion:** `animate-fade-in`, `animate-slide-up`, `animate-image-reveal`, `duration-hover`. All motion is disabled when the user prefers reduced motion.
- **Breakpoints:** `md` 768px (tablet), `lg` 1025px (desktop), `xl` 1440px.

Shared components are in [`components/ui`](components/ui):

- `Button` / `ButtonLink`: primary, accent, outline, secondary, link, and icon variants, with an optional arrow
- `FieldTrigger`: the icon, label, value, and chevron row used in the availability search
- `ContentCard`: image, title, subtitle, optional meta row, and an arrow action
- `Divider`: thin gold line

## Project structure

```
app/              Routes, root layout, global styles and tokens
  design-system/  Dev-only design system reference page
components/ui/    Shared UI primitives
lib/              Utilities (class name merging)
public/           Static assets
```
