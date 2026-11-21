import { Divider } from "@/components/ui/divider";

export default function Home() {
  return (
    <main
      id="main"
      className="container-site flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center"
    >
      <p className="eyebrow text-sage">Kuriftu Resorts &amp; Spa</p>
      <h1 className="animate-slide-up">Discover the extraordinary.</h1>
      <Divider />
      <p className="accent text-h4 text-charcoal">More than a destination. A feeling.</p>
    </main>
  );
}
