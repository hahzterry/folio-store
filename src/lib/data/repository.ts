import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "@/lib/env";
import { PRODUCTS } from "./products";
import type { Category, Product, Size } from "@/types";

/**
 * Catalog source of truth for server code.
 *
 * When Supabase is configured AND the `products` table has rows, the catalog
 * comes from Supabase (read with the anon key via the public-read RLS policy).
 * Otherwise it transparently falls back to the baked `catalog.json` — so the
 * storefront works with zero configuration, survives an empty/unreachable
 * backend, and "graduates" to the real database the moment one is connected
 * and seeded.
 *
 * Pure derivations (related, featured, edit picks, …) live in `./products` and
 * take a product list, so they work identically over either source.
 */

interface ProductRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  details: string[];
  price: number;
  category: string;
  collection: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  tags: string[];
  in_stock: boolean;
  featured: boolean;
  new_arrival: boolean;
  brand: string | null;
  stock: number | null;
}

function rowToProduct(r: ProductRecord): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    details: r.details ?? [],
    price: r.price,
    category: r.category as Category,
    collection: r.collection,
    sizes: (r.sizes ?? []) as Size[],
    colors: r.colors ?? [],
    images: r.images ?? [],
    tags: r.tags ?? [],
    inStock: r.in_stock,
    featured: r.featured || undefined,
    newArrival: r.new_arrival || undefined,
    brand: r.brand ?? undefined,
    stock: r.stock ?? undefined,
  };
}

/**
 * The full catalog for the current request. `cache()` dedupes calls within a
 * single render pass, so multiple consumers don't each hit the network.
 */
export const getCatalog = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) return PRODUCTS;
  try {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error || !data || data.length === 0) return PRODUCTS;
    return (data as ProductRecord[]).map(rowToProduct);
  } catch (err) {
    // Never take the storefront down because the backend is unreachable.
    console.error("Catalog fetch failed; falling back to mock:", err);
    return PRODUCTS;
  }
});
