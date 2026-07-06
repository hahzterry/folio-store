import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types";

export function ProductGrid({
  products,
  query,
}: {
  products: Product[];
  query?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">
          {query
            ? `No results for “${query}”. Try a different search or adjusting your filters.`
            : "No products match your filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
