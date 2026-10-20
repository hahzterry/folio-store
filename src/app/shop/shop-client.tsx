"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2, SlidersHorizontal, Check } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { ProductGrid } from "@/components/product-grid";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES, COLLECTIONS } from "@/lib/data/products";
import { searchProducts } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { Product, Size } from "@/types";

const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

const PAGE_SIZE = 12;

// "rating" removed from the Sort union.
type Sort = "featured" | "price-asc" | "price-desc" | "new";

const PRICE_RANGES = [
  { key: "all", label: "All prices", min: 0, max: Infinity },
  { key: "under-50", label: "Under $50", min: 0, max: 5000 },
  { key: "50-150", label: "$50 – $150", min: 5000, max: 15000 },
  { key: "150-500", label: "$150 – $500", min: 15000, max: 50000 },
  { key: "over-500", label: "$500 & up", min: 50000, max: Infinity },
] as const;

export function ShopClient({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = params.get("category") ?? "all";
  const collection = params.get("collection") ?? "all";
  const query = params.get("q")?.trim() ?? "";

  const [sizes, setSizes] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<Sort>("featured");
  const [priceKey, setPriceKey] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [brand, setBrand] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // minRating removed from active filter count.
  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (collection !== "all" ? 1 : 0) +
    (brand !== "all" ? 1 : 0) +
    sizes.size +
    (priceKey !== "all" ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const activeCategory = CATEGORIES.find((c) => c.slug === category);
  const activeCollection = COLLECTIONS.find((c) => c.slug === collection);
  const heading = query
    ? `“${query}”`
    : (activeCategory?.name ?? activeCollection?.name ?? "All products");

  const { data: catalog = products, isFetching } = useProducts({}, products);

  const brands = useMemo(
    () =>
      [
        ...new Set(catalog.map((p) => p.brand).filter(Boolean)),
      ].sort() as string[],
    [catalog],
  );

  const toggleSize = (s: string) => {
    setSizes((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let out = [...catalog];
    if (category !== "all") out = out.filter((p) => p.category === category);
    if (collection !== "all")
      out = out.filter(
        (p) => p.collection.toLowerCase() === collection.toLowerCase(),
      );
    if (brand !== "all") out = out.filter((p) => p.brand === brand);
    if (sizes.size > 0)
      out = out.filter((p) => p.sizes.some((s) => sizes.has(s)));
    const priceRange = PRICE_RANGES.find((r) => r.key === priceKey);
    if (priceRange && priceRange.key !== "all")
      out = out.filter(
        (p) => p.price >= priceRange.min && p.price < priceRange.max,
      );
    // minRating filter removed.
    if (inStockOnly) out = out.filter((p) => p.inStock);
    if (query) out = searchProducts(out, query);
    switch (sort) {
      case "price-asc":
        out.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        out.sort((a, b) => b.price - a.price);
        break;
      case "new":
        out.sort((a, b) => Number(!!b.newArrival) - Number(!!a.newArrival));
        break;
      // rating case removed.
      default:
        out.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return out;
  }, [
    catalog,
    category,
    collection,
    brand,
    sizes,
    sort,
    query,
    priceKey,
    inStockOnly,
  ]);

  useEffect(() => setVisible(PAGE_SIZE), [filtered]);

  const updateUrl = (key: string, value: string) => {
    const u = new URLSearchParams(params.toString());
    if (value === "all") u.delete(key);
    else u.set(key, value);
    router.replace(`${pathname}?${u.toString()}`, { scroll: false });
  };

  const reset = () => {
    setSizes(new Set());
    setSort("featured");
    setPriceKey("all");
    setInStockOnly(false);
    setBrand("all");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="container py-12">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Shop
        </p>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">{heading}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Considered pieces, organised by category and collection.
        </p>
      </div>

      <button
        onClick={() => setFiltersOpen((o) => !o)}
        className="mb-6 flex w-full items-center justify-between border border-border px-4 py-3 text-xs uppercase tracking-widest lg:hidden"
        aria-expanded={filtersOpen}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-foreground px-1.5 py-0.5 text-[10px] text-background">
              {activeFilterCount}
            </span>
          )}
        </span>
        <span>{filtersOpen ? "Close" : "Show"}</span>
      </button>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside
          className={cn("space-y-8 lg:block", filtersOpen ? "block" : "hidden")}
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Category
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <button
                  onClick={() => updateUrl("category", "all")}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    category === "all"
                      ? "text-foreground underline underline-offset-4"
                      : "text-muted-foreground",
                  )}
                >
                  All
                </button>
              </li>
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <button
                    onClick={() => updateUrl("category", c.slug)}
                    className={cn(
                      "transition-colors hover:text-foreground",
                      category === c.slug
                        ? "text-foreground underline underline-offset-4"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Collection
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <button
                  onClick={() => updateUrl("collection", "all")}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    collection === "all"
                      ? "text-foreground underline underline-offset-4"
                      : "text-muted-foreground",
                  )}
                >
                  All
                </button>
              </li>
              {COLLECTIONS.map((c) => (
                <li key={c.slug}>
                  <button
                    onClick={() => updateUrl("collection", c.slug)}
                    className={cn(
                      "transition-colors hover:text-foreground",
                      collection === c.slug
                        ? "text-foreground underline underline-offset-4"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Brand
            </p>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="mt-3 w-full rounded-none">
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Size
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={cn(
                    "border border-border py-2 text-xs uppercase tracking-widest transition-colors",
                    sizes.has(s)
                      ? "bg-foreground text-background"
                      : "hover:bg-accent",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Price
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {PRICE_RANGES.map((r) => (
                <li key={r.key}>
                  <button
                    onClick={() => setPriceKey(r.key)}
                    className={cn(
                      "transition-colors hover:text-foreground",
                      priceKey === r.key
                        ? "text-foreground underline underline-offset-4"
                        : "text-muted-foreground",
                    )}
                  >
                    {r.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Entire Rating filter block removed */}

          <button
            onClick={() => setInStockOnly((v) => !v)}
            aria-pressed={inStockOnly}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center border border-border",
                inStockOnly && "bg-foreground text-background",
              )}
            >
              {inStockOnly && <Check className="h-3 w-3" />}
            </span>
            In stock only
          </button>

          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={reset}>
              Clear filters
            </Button>
          )}
        </aside>

        <div>
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
              {isFetching && (
                <Loader2
                  className="h-3 w-3 animate-spin"
                  aria-label="Updating"
                />
              )}
            </p>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-[180px] rounded-none">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                {/* "Top rated" option removed */}
                <SelectItem value="new">Newest</SelectItem>
                <SelectItem value="price-asc">Price · Low to high</SelectItem>
                <SelectItem value="price-desc">Price · High to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ProductGrid products={filtered.slice(0, visible)} query={query} />
          {visible < filtered.length && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Showing {Math.min(visible, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <Button
                variant="outline"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
