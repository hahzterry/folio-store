import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Our story",
  description:
    "VINTATE aka Vintage Tee is a tightly edited selection of the vintage tees we love.",
};

const VALUES = [
  {
    id: "sourcing",
    title: "How we source",
    body: "We don't make our own clothes. We found them left for dead in the back of thrift stores and estate sales. Every label in the shop is chosen by hand for its make, its materials, and how it holds up over time. If it wouldn't earn a place in our own wardrobe, it doesn't make the edit.",
  },
  {
    id: "sustainability",
    title: "Sustainability",
    body: "Buying better means buying less. We favour pieces built to be worn for years, ship in recyclable packaging, and offset delivery emissions. A smaller, longer-lasting wardrobe is the most sustainable one there is.",
  },
  {
    id: "service",
    title: "Service",
    body: "Free 30-day returns, and a team that actually answers. Every order is backed by our authenticity guarantee: what you see is exactly what arrives.",
  },
];

export default function AboutPage() {
  return (
    <div className="pb-24">
      {/* Header */}
      <section className="relative h-[42vh] min-h-[320px] w-full overflow-hidden bg-muted">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2000&q=80"
          alt="VINTATE - 1 of 1 Vintage tees"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50" />
        <div className="container relative z-10 flex h-full flex-col justify-end pb-12 text-background">
          <p className="text-xs uppercase tracking-[0.32em] opacity-80">
            About VINTATE
          </p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight md:text-6xl">
            The hand picked vintage tees you&apos;ve been looking for.
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="container max-w-3xl py-16">
        <p className="text-pretty font-serif text-2xl leading-snug md:text-3xl">
          You have vintage tees that are mass produced and you have vintage tees
          that are hand picked and curated for you. VINTATE is a value comes
          from our customers knowing they won't find these tees anywhere else.
        </p>
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Two brothers from New Jersey, who have a passion for vintage tees,
          started VINTATE to bring you the best curated collection of vintage
          tees. We scour the country to find the most unique and high-quality
          pieces, ensuring that each tee we offer is one-of-a-kind. Our goal is
          to provide our customers with a shopping experience that is both
          enjoyable and rewarding, allowing them to express their individuality
          through fashion.
        </p>
      </section>

      {/* Values */}
      <section className="container grid gap-12 border-t border-border py-16 md:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.id} id={v.id} className="scroll-mt-24">
            <h2 className="font-serif text-2xl">{v.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {v.body}
            </p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="container">
        <div className="flex flex-col items-center gap-6 border-t border-border py-16 text-center">
          <h2 className="max-w-xl font-serif text-3xl md:text-4xl">
            Browse the edit.
          </h2>
          <Button asChild size="lg" className="rounded-none">
            <Link href="/shop">Shop all products</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
