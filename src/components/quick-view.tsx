"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductImage } from "@/components/product-image";
import { WishlistButton } from "@/components/wishlist-button";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import type { Product, Size } from "@/types";

export function QuickView({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<Size | null>(null);
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const add = useCart((s) => s.add);
  const soldOut = product.inStock === false || product.stock === 0;

  const handleAdd = () => {
    if (soldOut) {
      toast.error("This item is out of stock.");
      return;
    }
    if (!size) {
      toast.error("Please select a size.");
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size,
      color,
      quantity: 1,
    });
    toast.success(`Added to bag: ${product.name}`, {
      description: `${color} · ${size}`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label={`Quick view ${product.name}`}
          className="flex items-center justify-center gap-2 bg-background/90 py-2.5 text-xs uppercase tracking-widest backdrop-blur transition-colors hover:bg-background"
        >
          <Eye className="h-3.5 w-3.5" />
          Quick view
        </button>
      </DialogTrigger>

      <DialogContent className="gap-0 p-0 sm:max-w-3xl">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid sm:grid-cols-2">
          <div className="relative aspect-[3/4] bg-muted">
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              fallbackLabel={product.name}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col p-6 sm:p-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {product.collection}
            </p>
            <h2 className="mt-1 font-serif text-2xl">{product.name}</h2>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-lg tabular-nums">
                {formatPrice(product.price)}
              </span>
            </div>

            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Color */}
            <div className="mt-5 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  aria-label={c.name}
                  title={c.name}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-all",
                    color === c.name
                      ? "border-foreground"
                      : "border-transparent ring-1 ring-border hover:ring-foreground/50",
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>

            {/* Size */}
            <div className="mt-4 grid grid-cols-6 gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "border py-2 text-xs uppercase tracking-widest transition-colors",
                    size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                onClick={handleAdd}
                disabled={soldOut}
                className="flex-1 rounded-none"
              >
                {soldOut ? (
                  "Sold out"
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Add to bag
                  </>
                )}
              </Button>
              <WishlistButton
                slug={product.slug}
                className="h-11 w-11 border border-border bg-transparent hover:bg-accent"
              />
            </div>

            <Link
              href={`/shop/${product.slug}`}
              onClick={() => setOpen(false)}
              className="mt-3 text-center text-xs uppercase tracking-widest text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              View full details
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
