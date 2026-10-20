/**
 * Seeds the products table from the in-repo mock catalog.
 *
 * Usage:
 *   1. Set DATABASE_URL in .env.local
 *   2. npm run db:push       # creates tables
 *   3. npm run db:seed       # inserts the catalog
 */
import "dotenv/config";
import { getDb, isDatabaseEnabled, schema } from "../src/lib/db";
import { PRODUCTS } from "../src/lib/data/products";

async function main() {
  if (!isDatabaseEnabled) {
    console.error(
      "✗ DATABASE_URL is not set. Add it to .env.local before seeding.",
    );
    process.exit(1);
  }
  const db = getDb()!;
  console.log(`Seeding ${PRODUCTS.length} products…`);
  await db
    .insert(schema.products)
    .values(
      PRODUCTS.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        details: p.details,
        price: p.price,
        category: p.category,
        collection: p.collection,
        sizes: p.sizes as string[],
        colors: p.colors,
        images: p.images,
        tags: p.tags,
        inStock: p.inStock,
        featured: !!p.featured,
        newArrival: !!p.newArrival,
        brand: p.brand ?? null,
        stock: p.stock ?? null,
      })),
    )
    .onConflictDoNothing();
  console.log("✓ Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
