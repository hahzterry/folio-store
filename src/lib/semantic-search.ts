import { env, isSupabaseConfigured } from "@/lib/env";

export interface SemanticMatch {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  collection: string;
  brand: string | null;
  images: string[];
  rating: number | null;
  review_count: number | null;
  in_stock: boolean;
  stock: number | null;
}

/**
 * Meaning-based product search via the `semantic-search` Edge Function
 * (gte-small embeddings + pgvector). Returns [] when Supabase isn't
 * configured or the function is unavailable, so callers can fall back to
 * fuzzy search.
 */
export async function semanticSearch(
  query: string,
  opts: { matchCount?: number; matchThreshold?: number } = {},
): Promise<SemanticMatch[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const res = await fetch(
      `${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/semantic-search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: "search",
          query,
          matchCount: opts.matchCount ?? 8,
          matchThreshold: opts.matchThreshold ?? 0.7,
        }),
        // Edge cold starts can take a moment; don't hang the caller forever.
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: SemanticMatch[] };
    return data.results ?? [];
  } catch {
    return [];
  }
}
