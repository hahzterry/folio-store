import { describe, it, expect } from "vitest";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
  getCollectionPriceRange,
  getEditPicks,
} from "@/lib/data/products";

describe("data layer", () => {
  it("loads a non-empty, slug-unique catalog", () => {
    const all = getAllProducts();
    expect(all.length).toBeGreaterThan(0);
    expect(new Set(all.map((p) => p.slug)).size).toBe(all.length);
  });

  it("is shirts-only", () => {
    const all = getAllProducts();
    expect(all.every((p) => p.category === "shirts")).toBe(true);
  });

  it("only uses the three vintage collections", () => {
    const allowed = new Set([
      "Vintage Hip Hop Tees",
      "Vintage RNB Tees",
      "Vintage Rock Tees",
    ]);
    const all = getAllProducts();
    expect(all.every((p) => allowed.has(p.collection))).toBe(true);
  });

  it("finds a product by slug, undefined for misses", () => {
    const p = getAllProducts()[0];
    expect(getProductBySlug(p.slug)?.id).toBe(p.id);
    expect(getProductBySlug("does-not-exist")).toBeUndefined();
  });

  it("related products exclude the product itself and respect the limit", () => {
    const p = getAllProducts()[0];
    const related = getRelatedProducts(p.id, 4);
    expect(related.length).toBeLessThanOrEqual(4);
    expect(related.every((r) => r.id !== p.id)).toBe(true);
  });

  it("edit picks are diversified across collections", () => {
    const picks = getEditPicks(7);
    // With three collections and a shirts-only catalog, we expect at least
    // two distinct collections in the top 7 picks (up to 3 when all three
    // collections have products).
    const distinct = new Set(picks.map((p) => p.collection));
    expect(distinct.size).toBeGreaterThanOrEqual(2);
  });

  it("collection price range is non-null and ordered", () => {
    // Use whichever collection exists first in the catalog, so the test
    // stays valid even if a given collection is empty during development.
    const firstCollection = getAllProducts()[0].collection;
    const slug = firstCollection
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const range = getCollectionPriceRange(slug);
    expect(range).not.toBeNull();
    expect(range!.min).toBeLessThanOrEqual(range!.max);
  });
});
