import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getCatalog } from "@/lib/data/repository";
import { ProductDetail } from "./product-detail";
import { ProductGrid } from "@/components/product-grid";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { RecordView } from "@/components/record-view";
import { RecentlyViewed } from "@/components/recently-viewed";

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug, await getCatalog());
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      // og:image comes from the opengraph-image.tsx file convention — a
      // branded per-product card rather than the raw photo.
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = getProductBySlug(slug, catalog);
  if (!product) notFound();

  const related = getRelatedProducts(product.id, 4, catalog);

  // Product structured data for rich search results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.price / 100).toFixed(2),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecordView slug={product.slug} />
      <div className="container py-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            {
              label:
                product.category.charAt(0).toUpperCase() +
                product.category.slice(1),
              href: `/shop?category=${product.category}`,
            },
            { label: product.name },
          ]}
        />
      </div>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="container py-20">
          <h2 className="mb-10 font-serif text-3xl md:text-4xl">
            You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}

      <RecentlyViewed excludeSlug={product.slug} />
    </div>
  );
}
