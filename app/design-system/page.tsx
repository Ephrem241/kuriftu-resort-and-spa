import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Flower2,
  MapPin,
  Maximize,
  Search,
  User,
  UtensilsCrossed,
  Activity,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/ui/content-card";
import { Divider } from "@/components/ui/divider";
import { FieldTrigger } from "@/components/ui/field-trigger";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const brandColors = [
  { name: "Forest Green", token: "forest", hex: "#263B32", swatch: "bg-forest" },
  { name: "Sage Green", token: "sage", hex: "#687B65", swatch: "bg-sage" },
  { name: "Warm Beige", token: "beige", hex: "#E8E1D3", swatch: "bg-beige" },
  { name: "Ivory", token: "ivory", hex: "#F8F7F2", swatch: "bg-ivory" },
  { name: "Champagne Gold", token: "gold", hex: "#B99A62", swatch: "bg-gold" },
  { name: "Charcoal", token: "charcoal", hex: "#292923", swatch: "bg-charcoal" },
];

const semanticColors = [
  { name: "Success", token: "success", hex: "#477A59", swatch: "bg-success" },
  { name: "Warning", token: "warning", hex: "#C18B43", swatch: "bg-warning" },
  { name: "Error", token: "error", hex: "#B94C45", swatch: "bg-error" },
  { name: "Border", token: "line", hex: "#DED8CC", swatch: "bg-line" },
  { name: "Muted", token: "muted", hex: "#77776E", swatch: "bg-muted" },
];

const icons = [
  { icon: BedDouble, label: "Bed" },
  { icon: Flower2, label: "Spa" },
  { icon: UtensilsCrossed, label: "Restaurant" },
  { icon: Activity, label: "Activity" },
  { icon: MapPin, label: "Location" },
  { icon: CalendarDays, label: "Calendar" },
  { icon: User, label: "User" },
  { icon: Search, label: "Search" },
];

const spacing = [
  { px: 4, cls: "size-1" },
  { px: 8, cls: "size-2" },
  { px: 16, cls: "size-4" },
  { px: 24, cls: "size-6" },
  { px: 32, cls: "size-8" },
  { px: 48, cls: "size-12" },
  { px: 64, cls: "size-16" },
  { px: 96, cls: "size-24" },
  { px: 128, cls: "size-32" },
];

const motion = [
  { name: "Fade in", value: "700ms", cls: "animate-fade-in" },
  { name: "Slide up", value: "800ms", cls: "animate-slide-up" },
  { name: "Image reveal", value: "1200ms", cls: "animate-image-reveal" },
  { name: "Button hover", value: "250ms", cls: "" },
  { name: "Page transition", value: "500ms", cls: "" },
];

const contrast = [
  "Gold on ivory ≈ 2.5:1. Decoration, icons, dividers, and borders only. Never gold text on ivory or beige.",
  "Sage on ivory ≈ 4.2:1. Large text only (24px+, or 18.7px+ bold).",
  "Muted on ivory ≈ 4.2:1. Fails AA at body size. Used for small field labels to match the board.",
  "Gold on forest ≈ 4.5:1. Fine for eyebrows and the logo mark.",
  "White on gold (accent button) ≈ 2.7:1. Fails AA for the label. Matches the board; pending a decision.",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-12">
      <h2 className="eyebrow mb-8 text-forest">{title}</h2>
      {children}
    </section>
  );
}

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex size-full items-center justify-center bg-beige text-caption text-muted">
      {label}
    </div>
  );
}

function Swatches({ items }: { items: typeof brandColors }) {
  return (
    <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
      {items.map((c) => (
        <li key={c.token}>
          <div className={`${c.swatch} h-20 rounded-md border border-line`} />
          <p className="mt-2 text-small text-charcoal">{c.name}</p>
          <p className="text-caption text-muted">
            {c.hex} · <code>{c.token}</code>
          </p>
        </li>
      ))}
    </ul>
  );
}

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main id="main" className="container-site py-16">
      <header className="flex flex-col items-start gap-4">
        <p className="eyebrow text-sage">Kuriftu Resorts &amp; Spa</p>
        <h1>Design system</h1>
        <Divider />
        <p className="accent text-h4 text-charcoal">Discover the extraordinary.</p>
      </header>

      <Section title="Color palette">
        <Swatches items={brandColors} />
        <h3 className="eyebrow mt-10 mb-6 text-forest">Semantic colors</h3>
        <Swatches items={semanticColors} />
      </Section>

      <Section title="Typography">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-caption text-muted">Headings · Playfair Display</p>
            <h1>H1 60 / 48</h1>
            <h2>H2 44 / 32</h2>
            <h3>H3 30 / 25</h3>
            <h4>H4 22 / 20</h4>
          </div>
          <div className="space-y-4">
            <p className="text-caption text-muted">Body · Lato</p>
            <p className="text-body">Body 16 / 15. Discover Ethiopia&apos;s most breathtaking resorts, where nature, culture and comfort come together.</p>
            <p className="text-small">Small 13 / 12. Lake views and serene atmosphere.</p>
            <p className="text-caption">Caption 12 / 11. Real destinations, natural light.</p>
            <p className="eyebrow text-forest">Eyebrow · Destinations · Rooms · Experiences</p>
            <p className="text-caption text-muted">Accent · Playfair Display Italic</p>
            <p className="accent text-h3 text-forest">A moment of tranquility.</p>
          </div>
        </div>
      </Section>

      <Section title="Buttons & interactions">
        <div className="flex max-w-sm flex-col gap-4">
          <Button variant="primary" arrow>Book your stay</Button>
          <Button variant="accent" arrow>Explore destinations</Button>
          <Button variant="outline" arrow>Discover more</Button>
          <div className="flex items-center justify-between gap-4">
            <Button variant="secondary" size="sm">Secondary</Button>
            <Button variant="link" arrow>Learn More</Button>
            <Button variant="icon" size="icon" aria-label="Next">
              <ArrowRight strokeWidth={1.5} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Form elements">
        <div className="flex max-w-md flex-col gap-4">
          <FieldTrigger icon={MapPin} label="Destination" value="Select destination" />
          <FieldTrigger icon={CalendarDays} label="Check-in / Check-out" value="Select dates" />
          <FieldTrigger icon={User} label="Guests" value="1 Guest" />
          <Button variant="primary" className="w-full">Search availability</Button>
        </div>
      </Section>

      <Section title="Cards & UI components">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ContentCard
            image={<ImagePlaceholder label="Resort image from Sanity" />}
            title="Bishoftu Resort & Spa"
            subtitle="Lake views and serene atmosphere"
            href="/design-system"
            action="Explore"
          />
          <ContentCard
            image={<ImagePlaceholder label="Room image from Sanity" />}
            title="Deluxe Room"
            subtitle="Elegant & comfortable"
            meta={[
              { icon: User, label: "2 Guests" },
              { icon: BedDouble, label: "1 King Bed" },
              { icon: Maximize, label: "45 m²" },
            ]}
            href="/design-system"
            action="View details"
          />
          <ContentCard
            image={<ImagePlaceholder label="Spa image from Sanity" />}
            title="Spa & Wellness"
            subtitle="Rejuvenate your mind & body"
            href="/design-system"
            action="Explore"
          />
        </div>
      </Section>

      <Section title="Brand elements">
        <div className="flex flex-col gap-6">
          <Divider />
          <Divider variant="full" />
          <p className="text-small text-muted">
            Logo, leaf mark, diamond motif, and botanical pattern render here once the SVG assets are provided.
          </p>
        </div>
      </Section>

      <Section title="Iconography · Lucide outline">
        <ul className="flex flex-wrap gap-10">
          {icons.map(({ icon: Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-2">
              <Icon aria-hidden="true" strokeWidth={1.5} className="size-7 text-forest" />
              <span className="text-caption text-charcoal">{label}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Layout & spacing">
        <p className="text-small text-charcoal">
          Container 1440px max · content 90% · breakpoints mobile 360–767, tablet 768–1024, desktop 1025–1440+
        </p>
        <ul className="mt-6 flex flex-wrap items-end gap-6">
          {spacing.map((s) => (
            <li key={s.px} className="flex flex-col items-center gap-2">
              <span className={`${s.cls} block bg-beige`} />
              <span className="text-caption text-muted">{s.px}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Animation & transitions">
        <ul className="grid max-w-md gap-3">
          {motion.map((m) => (
            <li key={m.name} className={`${m.cls} flex justify-between text-small text-charcoal`}>
              <span>{m.name}</span>
              <span>{m.value}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-caption text-muted">All disabled when the OS asks for reduced motion.</p>
      </Section>

      <Section title="Accessibility · contrast notes">
        <ul className="list-disc space-y-2 pl-5 text-small text-charcoal">
          {contrast.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
