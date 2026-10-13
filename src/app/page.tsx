import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product-grid";
import { RecentlyViewed } from "@/components/recently-viewed";
import { formatPrice } from "@/lib/utils";
import {
  COLLECTIONS,
  getCollectionCoverImage,
  getCollectionPriceRange,
  getEditPicks,
  getNewArrivals,
} from "@/lib/data/products";
import { getCatalog } from "@/lib/data/repository";
import { appUrl } from "@/lib/env";

export default async function HomePage() {
  const catalog = await getCatalog();
  const featured = getEditPicks(8, catalog);
  const newArrivals = getNewArrivals(catalog).slice(0, 8);

  // Organization + WebSite structured data (the PDP carries Product schema).
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "FOLIO",
        url: appUrl,
        logo: `${appUrl}/icon.svg`,
      },
      {
        "@type": "WebSite",
        name: "FOLIO",
        url: appUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${appUrl}/shop?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* HERO */}
      <section className="relative h-[78vh] min-h-[560px] w-full overflow-hidden bg-muted">
        <Image
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2000&q=80"
          alt="FOLIO Autumn/Winter editorial"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
        <div className="container relative z-10 flex h-full flex-col justify-end pb-16 text-background">
          <p className="text-xs uppercase tracking-[0.32em] opacity-80">
            A curated fashion edit
          </p>
          <h1 className="mt-3 max-w-2xl font-serif text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
            The best of
            <br />
            the brands you love.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed opacity-90">
            One considered place for shirts, dresses, footwear, watches and
            accessories. Chosen, not crowded.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-none bg-background text-foreground hover:bg-background/90"
            >
              <Link href="/shop">Shop the collection</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-none border-background text-background hover:bg-background hover:text-foreground"
            >
              <Link href="/shop?collection=signature">Explore Signature</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-y border-border bg-secondary/40 py-3">
        <div className="container flex flex-wrap items-center justify-center gap-x-10 gap-y-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          <span>Free shipping over $200</span>
          <span className="hidden md:inline">·</span>
          <span>Free 30-day returns</span>
          <span className="hidden md:inline">·</span>
          <span>100% authentic</span>
          <span className="hidden md:inline">·</span>
          <span>Secure checkout</span>
        </div>
      </section>

      {/* FEATURED */}
      <section className="container py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Featured
            </p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">
              Trending on TikTok
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-2 text-xs uppercase tracking-widest text-foreground/80 hover:text-foreground md:inline-flex"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      {/* COLLECTIONS */}
      <section className="bg-secondary/30 py-20">
        <div className="container">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Collections
            </p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">
              From Hip Hop to Rock vintage t-shirts.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {COLLECTIONS.map((c, i) => {
              const range = getCollectionPriceRange(c.slug, catalog);
              const cover = getCollectionCoverImage(c.slug, catalog);
              return (
                <Link
                  key={c.slug}
                  href={`/shop?collection=${c.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden bg-muted"
                >
                  {cover && (
                    <Image
                      src={cover}
                      alt={c.name}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-background">
                    <p className="text-xs uppercase tracking-[0.28em] opacity-80">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="mt-2 font-serif text-3xl">{c.name}</h3>
                      {range && (
                        <span className="text-xs uppercase tracking-widest opacity-80">
                          {range.min === range.max
                            ? formatPrice(range.min)
                            : `${formatPrice(range.min)} – ${formatPrice(range.max)}`}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 max-w-xs text-sm opacity-90">
                      {c.tagline}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest underline-offset-4 group-hover:underline">
                      Shop {c.name}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Just landed
            </p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">
              New arrivals
            </h2>
          </div>
        </div>
        <ProductGrid products={newArrivals} />
      </section>

      {/* RECENTLY VIEWED */}
      <RecentlyViewed />

      {/* MANIFESTO */}
      <section className="relative overflow-hidden bg-foreground py-24 text-background">
        <div className="container grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] opacity-70">
              The brief
            </p>
            <h2 className="mt-4 max-w-md font-serif text-3xl leading-tight md:text-4xl">
              Fewer labels. Better chosen. Quietly curated.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed opacity-80">
              We bring together a tight selection of the labels we love, across
              shirting, dresses, footwear, watches and accessories. Every piece
              earns its place: chosen for how it&apos;s made, how it wears, and
              how long it lasts.
            </p>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="mt-8 rounded-none border-background text-background hover:bg-background hover:text-foreground"
            >
              <Link href="/about">Read our story</Link>
            </Button>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80"
              alt="FOLIO editorial"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
