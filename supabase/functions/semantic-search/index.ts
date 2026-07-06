// Semantic product search — runs entirely inside Supabase.
//
// Embeddings are generated with the built-in gte-small model (384 dims,
// normalized), so no external AI API is needed. Two actions:
//
//   POST { action: "search", query, matchThreshold?, matchCount? }
//     -> embeds the query and returns matching products via match_products()
//
//   POST { action: "index", limit? }
//     -> backfills embeddings for up to `limit` products missing one (service
//        role). Batched to stay under the per-request compute cap; call
//        repeatedly until `remaining` is 0.
//
// Deployed via the Supabase MCP / CLI; source of truth lives in the repo.

import { createClient } from "jsr:@supabase/supabase-js@2";

const model = new Supabase.ai.Session("gte-small");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

/** The text we embed for each product — name + brand + taxonomy + description. */
function embeddingInput(p: {
  name: string;
  brand: string | null;
  category: string;
  collection: string;
  tags: unknown;
  description: string;
}) {
  const tags = Array.isArray(p.tags) ? p.tags.join(", ") : "";
  return [p.name, p.brand, p.category, p.collection, tags, p.description]
    .filter(Boolean)
    .join(". ");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const body = await req.json().catch(() => ({}));

  if (body.action === "index") {
    // Backfill embeddings for products missing one. Uses the service role
    // (bypasses RLS for the update); available as a built-in env var.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const limit = Math.min(Number(body.limit) || 10, 20);
    const {
      data: rows,
      error,
      count,
    } = await admin
      .from("products")
      .select("id, name, brand, category, collection, tags, description", {
        count: "exact",
      })
      .is("embedding", null)
      .limit(limit);
    if (error) return json({ error: error.message }, 500);

    let indexed = 0;
    for (const p of rows ?? []) {
      const embedding = await model.run(embeddingInput(p), {
        mean_pool: true,
        normalize: true,
      });
      const { error: upErr } = await admin
        .from("products")
        .update({ embedding: JSON.stringify(embedding) })
        .eq("id", p.id);
      if (upErr) return json({ error: upErr.message, indexed }, 500);
      indexed++;
    }
    return json({ indexed, remaining: (count ?? indexed) - indexed });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) return json({ error: "query required" }, 400);

  const embedding = await model.run(query, {
    mean_pool: true,
    normalize: true,
  });

  // Anon client + SECURITY INVOKER RPC -> public-read RLS applies.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data, error } = await supabase
    .rpc("match_products", {
      query_embedding: JSON.stringify(embedding),
      match_threshold: body.matchThreshold ?? 0.7,
      match_count: body.matchCount ?? 8,
    })
    .select(
      "id, slug, name, description, price, compare_at_price, category, collection, brand, images, rating, review_count, in_stock, stock",
    );
  if (error) return json({ error: error.message }, 500);

  return json({ query, results: data ?? [] });
});
