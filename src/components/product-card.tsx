import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product-image";
import { WishlistButton } from "@/components/wishlist-button";
import { QuickView } from "@/components/quick-view";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.inStock === false || product.stock === 0;
  const href = `/shop/${product.slug}`;

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Link
          href={href}
          aria-label={product.name}
          className="relative block h-full w-full"
        >
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            fallbackLabel={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-[1.03]"
          />
          {product.images[1] && product.images[1] !== product.images[0] && (
            <ProductImage
              src={product.images[1]}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1">
          {soldOut && <Badge variant="default">Sold out</Badge>}
          {product.newArrival && !soldOut && (
            <Badge variant="outline">New</Badge>
          )}
        </div>

        <WishlistButton
          slug={product.slug}
          className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
        />

        <div className="absolute inset-x-0 bottom-0 hidden translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:grid">
          <QuickView product={product} />
        </div>
      </div>

      <Link href={href} className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm">{product.name}</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            {product.collection}
          </p>
        </div>
        <div className="flex flex-col items-end text-sm tabular-nums">
          <span>{formatPrice(product.price)}</span>
        </div>
      </Link>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {product.colors.slice(0, 4).map((c) => (
            <span
              key={c.name}
              className="h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
