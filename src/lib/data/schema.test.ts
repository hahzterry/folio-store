import { describe, it, expect } from "vitest";
import { productSchema } from "@/lib/data/schema";

const valid = {
  id: "p1",
  slug: "tee",
  name: "Tee",
  description: "A tee.",
  details: [],
  price: 2000,
  category: "shirts",
  collection: "Vintage Hip Hop Tees",
  sizes: ["M"],
  colors: [{ name: "Black", hex: "#000000" }],
  images: ["/x.jpg"],
  tags: [],
  inStock: true,
};

describe("productSchema", () => {
  it("accepts a valid product", () => {
    expect(productSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an unknown category", () => {
    const r = productSchema.safeParse({ ...valid, category: "spaceships" });
    expect(r.success).toBe(false);
  });

  it("rejects a removed category", () => {
    // The store is shirts-only — these categories should no longer exist.
    for (const category of [
      "watches",
      "shoes",
      "bags",
      "dresses",
      "accessories",
      "tops",
    ]) {
      const r = productSchema.safeParse({ ...valid, category });
      expect(r.success).toBe(false);
    }
  });

  it("rejects an unknown collection", () => {
    const r = productSchema.safeParse({ ...valid, collection: "Everyday" });
    expect(r.success).toBe(false);
  });

  it("accepts all three vintage collections", () => {
    for (const collection of [
      "Vintage Hip Hop Tees",
      "Vintage RNB Tees",
      "Vintage Rock Tees",
    ]) {
      const r = productSchema.safeParse({ ...valid, collection });
      expect(r.success).toBe(true);
    }
  });

  it("rejects a negative price", () => {
    const r = productSchema.safeParse({ ...valid, price: -5 });
    expect(r.success).toBe(false);
  });
});
