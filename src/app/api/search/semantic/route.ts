import { NextResponse } from "next/server";
import { semanticSearch } from "@/lib/semantic-search";

/**
 * Meaning-based product search ("vibe search"). Returns products matched by
 * embedding similarity rather than keywords, e.g. "warm neutral winter
 * layers". Empty results when the vector backend isn't configured — callers
 * fall back to fuzzy search.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  const results = await semanticSearch(q, { matchCount: 8 });
  return NextResponse.json({ results });
}
