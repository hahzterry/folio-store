import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Drizzle schema for the optional Postgres backend.
 * Mirrors the shape of `types/Product`. Run `npm run db:push` to apply.
 */

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  details: jsonb("details").$type<string[]>().notNull().default([]),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  collection: text("collection").notNull(),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  colors: jsonb("colors")
    .$type<{ name: string; hex: string }[]>()
    .notNull()
    .default([]),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  newArrival: boolean("new_arrival").notNull().default(false),
  brand: text("brand"),
  stock: integer("stock"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  email: text("email").notNull(),
  status: text("status").notNull().default("pending"),
  total: integer("total").notNull(),
  items: jsonb("items").$type<unknown[]>().notNull().default([]),
  stripeSessionId: text("stripe_session_id").unique(
    "orders_stripe_session_unique",
  ),
  shippingAddress: jsonb("shipping_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    label: text("label"),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    state: text("state"),
    postalCode: text("postal_code").notNull(),
    country: text("country").notNull().default("United States"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // Normalized dedup key (lowercased + trimmed line1 + postal_code).
    addrKey: text("addr_key").generatedAlwaysAs(
      sql`lower(btrim(line1)) || '|' || lower(btrim(coalesce(postal_code, '')))`,
    ),
  },
  (t) => [unique("addresses_user_addrkey_unique").on(t.userId, t.addrKey)],
);

export type ProductRow = typeof products.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type AddressRow = typeof addresses.$inferSelect;
