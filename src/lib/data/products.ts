import type { Product } from "@/types";
import catalog from "./catalog.json";
import { catalogSchema } from "./schema";

/**
 * Product catalog.
 *
 * The data is seeded from the public DummyJSON API by `scripts/fetch-catalog.ts`
 * and baked into `catalog.json`, so the app runs fully offline. Run
 * `npm run catalog` to refresh it. The shape matches the Drizzle schema, so
 * swapping in the real DB requires no consumer-side changes.
 *
 * The JSON is validated against `catalogSchema` at load time, so malformed
 * data throws here rather than failing silently downstream.
 */
export const PRODUCTS: Product[] = catalogSchema.parse(catalog);

/** Converts a collection name ("Vintage Hip Hop Tees") to its slug
 *  ("vintage-hip-hop-tees") so collection lookups match the COLLECTIONS array. */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Collections are genre-based (assigned by the seed script): Hip Hop, RNB,
// and Rock. All three are vintage tees.
export const COLLECTIONS = [
  {
    slug: "vintage-hip-hop-tees",
    name: "Vintage Hip Hop Tees",
    tagline: "Golden-era rap tees — from Outkast to DMX.",
  },
  {
    slug: "vintage-rnb-tees",
    name: "Vintage RNB Tees",
    tagline: "Soul, Motown, and 90s R&B icons.",
  },
  {
    slug: "vintage-rock-tees",
    name: "Vintage Rock Tees",
    tagline: "Classic rock, metal, and grunge graphics.",
  },
] as const;

export const CATEGORIES = [{ slug: "shirts", name: "Shirts" }] as const;

// ---- Data access ----
//
// These helpers are pure over a product list, defaulting to the mock catalog.
// Server entry points pass the DB-backed list (see src/lib/data/repository.ts);
// client-side callers use the default mock list, which mirrors the seed data.

export function getAllProducts(list: Product[] = PRODUCTS): Product[] {
  return list;
}

export function getProductBySlug(
  slug: string,
  list: Product[] = PRODUCTS,
): Product | undefined {
  return list.find((p) => p.slug === slug);
}

/**
 * A diversified "edit" — the most "featured" product from each collection first,
 * then the next-best overall to fill the row. Keeps the home feature grid from
 * being dominated by a single collection (e.g. all hip hop).
 */
export function getEditPicks(limit = 8, list: Product[] = PRODUCTS): Product[] {
  // Sort by featured status first, then by price (as a proxy for "best")
  const sorted = [...list].sort((a, b) => {
    const featA = a.featured ? 1 : 0;
    const featB = b.featured ? 1 : 0;
    if (featA !== featB) return featB - featA;
    return b.price - a.price;
  });

  const picks: Product[] = [];
  const chosen = new Set<string>();

  // One per collection, best-ranked.
  const seenCollection = new Set<string>();
  for (const p of sorted) {
    if (!seenCollection.has(p.collection)) {
      seenCollection.add(p.collection);
      picks.push(p);
      chosen.add(p.id);
    }
  }
  // Fill remaining slots with the next best overall.
  for (const p of sorted) {
    if (picks.length >= limit) break;
    if (!chosen.has(p.id)) {
      picks.push(p);
      chosen.add(p.id);
    }
  }
  return picks.slice(0, limit);
}

/** Representative cover image for a collection (its featured/highest-priced product). */
export function getCollectionCoverImage(
  slug: string,
  list: Product[] = PRODUCTS,
): string | null {
  const items = list.filter((p) => slugify(p.collection) === slug);
  if (!items.length) return null;

  const top = [...items].sort((a, b) => {
    const featA = a.featured ? 1 : 0;
    const featB = b.featured ? 1 : 0;
    if (featA !== featB) return featB - featA;
    return b.price - a.price;
  })[0];

  return top.images[0] ?? null;
}

export function getNewArrivals(list: Product[] = PRODUCTS): Product[] {
  return list.filter((p) => p.newArrival);
}

/** Min/max price (in cents) of the products in a collection — used to label
 *  the price tiers in the UI. Returns null for an empty collection. */
export function getCollectionPriceRange(
  slug: string,
  list: Product[] = PRODUCTS,
): { min: number; max: number } | null {
  const items = list.filter((p) => slugify(p.collection) === slug);
  if (!items.length) return null;
  const prices = items.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function getRelatedProducts(
  productId: string,
  limit = 4,
  list: Product[] = PRODUCTS,
): Product[] {
  const product = list.find((p) => p.id === productId);
  if (!product) return [];
  const sameCollection = list.filter(
    (p) => p.id !== productId && p.collection === product.collection,
  );
  // Fall back to other products if a collection is too small to fill the row.
  const fill = list.filter(
    (p) => p.id !== productId && p.collection !== product.collection,
  );
  return [...sameCollection, ...fill].slice(0, limit);
}
