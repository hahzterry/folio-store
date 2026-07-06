"use client";

import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import { toast } from "sonner";
import {
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/wishlist-button";
import { SizeGuideDialog } from "@/components/size-guide-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import type { Product, Size } from "@/types";

export function ProductDetail({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<Size | null>(null);
  const [color, setColor] = useState(product.colors[0].name);
  const [quantity, setQuantity] = useState(1);
  const add = useCart((s) => s.add);

  const onSale = !!product.compareAtPrice;
  const maxQty = product.stock ?? Infinity;
  const soldOut = product.inStock === false || maxQty === 0;

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
      quantity,
    });
    toast.success(`Added to bag: ${product.name}`, {
      description: `${color} · ${size}`,
    });
  };

  return (
    <section className="container grid gap-10 pb-16 pt-4 lg:grid-cols-2 lg:gap-16">
      {/* Gallery */}
      <div>
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <ProductImage
            src={product.images[activeImage]}
            alt={product.name}
            fallbackLabel={product.name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {product.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "relative aspect-square overflow-hidden border bg-muted transition-opacity",
                  i === activeImage
                    ? "border-foreground opacity-100"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <ProductImage
                  src={src}
                  alt=""
                  fill
                  sizes="20vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {product.collection}
        </p>
        <h1 className="mt-3 font-serif text-4xl">{product.name}</h1>

        <div className="mt-4 flex items-baseline gap-3">
          <span
            className={cn("text-lg tabular-nums", onSale && "text-destructive")}
          >
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Rating + meta */}
        {(product.rating != null || product.brand || product.stock != null) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {product.rating != null && (
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < Math.round(product.rating!)
                          ? "fill-foreground text-foreground"
                          : "text-muted-foreground/40",
                      )}
                    />
                  ))}
                </div>
                <span className="tabular-nums">
                  {product.rating.toFixed(1)}
                </span>
                {product.reviewCount ? (
                  <span className="text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                ) : null}
              </div>
            )}
            {product.brand && (
              <span className="text-muted-foreground">
                by <span className="text-foreground">{product.brand}</span>
              </span>
            )}
            {product.stock != null && (
              <span
                className={cn(
                  product.stock > 10
                    ? "text-muted-foreground"
                    : "font-medium text-destructive",
                )}
              >
                {product.stock > 10
                  ? "In stock"
                  : product.stock > 0
                    ? `Only ${product.stock} left`
                    : "Out of stock"}
              </span>
            )}
          </div>
        )}

        <p className="mt-6 text-pretty text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        {/* Color */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Color
            </p>
            <p className="text-xs uppercase tracking-widest">{color}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.name)}
                aria-label={c.name}
                className={cn(
                  "h-9 w-9 rounded-full border-2 transition-all",
                  color === c.name
                    ? "border-foreground"
                    : "border-transparent ring-1 ring-border hover:ring-foreground/50",
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Size
            </p>
            <SizeGuideDialog />
          </div>
          <div className="mt-3 grid grid-cols-6 gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "border py-2.5 text-xs uppercase tracking-widest transition-colors",
                  size === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity + Add */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex h-12 items-center border border-border">
            <button
              aria-label="Decrease"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={soldOut}
              className="flex h-full w-12 items-center justify-center hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2.5rem] text-center text-sm tabular-nums">
              {quantity}
            </span>
            <button
              aria-label="Increase"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={soldOut || quantity >= maxQty}
              className="flex h-full w-12 items-center justify-center hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button
            size="lg"
            className="flex-1 rounded-none"
            onClick={handleAdd}
            disabled={soldOut}
          >
            {soldOut ? (
              "Sold out"
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                Add to bag · {formatPrice(product.price * quantity)}
              </>
            )}
          </Button>
          <WishlistButton
            slug={product.slug}
            className="h-12 w-12 border border-border bg-transparent hover:bg-accent"
          />
        </div>

        {/* Trust row */}
        <div className="mt-6 grid grid-cols-3 gap-3 border-y border-border py-5 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Truck className="h-4 w-4" />
            Free shipping over $200
          </div>
          <div className="flex flex-col items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            30-day returns
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Lifetime repairs
          </div>
        </div>

        {/* Details accordion */}
        <Accordion type="single" collapsible className="mt-2">
          <AccordionItem value="details">
            <AccordionTrigger>Details & materials</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5">
                {product.details.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-muted-foreground">·</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          {product.reviews && product.reviews.length > 0 && (
            <AccordionItem value="reviews">
              <AccordionTrigger>
                Reviews ({product.reviews.length})
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-4">
                  {product.reviews.map((r, i) => (
                    <li
                      key={i}
                      className="border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              className={cn(
                                "h-3 w-3",
                                j < r.rating
                                  ? "fill-foreground text-foreground"
                                  : "text-muted-foreground/40",
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium">
                          {r.reviewerName}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {r.comment}
                      </p>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping & returns</AccordionTrigger>
            <AccordionContent>
              <p>
                Complimentary carbon-neutral shipping on orders over $200.
                Returns accepted within 30 days of delivery, unworn and with
                original tags.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="care">
            <AccordionTrigger>Care</AccordionTrigger>
            <AccordionContent>
              <p>
                Wash cold inside out. Tumble dry low or hang to dry. Avoid
                bleach. For wool pieces, dry clean only.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
