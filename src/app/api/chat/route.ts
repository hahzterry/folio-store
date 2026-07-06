import {
  streamText,
  gateway,
  tool,
  isStepCount,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { isStylistEnabled } from "@/lib/env";
import { semanticSearch } from "@/lib/semantic-search";
import { getCatalog } from "@/lib/data/repository";
import { searchProducts as fuzzySearch } from "@/lib/search";
import { formatPrice } from "@/lib/utils";

export const maxDuration = 30;

const SYSTEM = `You are the FOLIO stylist — a warm, concise personal shopper for FOLIO, a curated multi-brand fashion edit (shirts, tops, dresses, shoes, bags, watches, accessories).

Rules:
- ALWAYS ground recommendations in real catalog items via the searchProducts tool. Never invent products, prices, or brands.
- Search with descriptive queries (occasion, style, season), not just the user's literal words. Run more than one search when an outfit needs different pieces (e.g. one for shoes, one for a watch).
- Recommend 2-4 items max, and say briefly why each works. Respect any budget mentioned (prices are shown to you formatted in USD).
- If nothing relevant comes back, say so honestly and suggest browsing the shop instead.
- Keep replies short and editorial — a stylist's note, not an essay. The UI renders product cards for whatever the tool returns, so don't repeat image URLs or slugs in your text.`;

export async function POST(req: Request) {
  if (!isStylistEnabled) {
    return Response.json({ error: "Stylist not configured" }, { status: 503 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: gateway("anthropic/claude-sonnet-5"),
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
    tools: {
      searchProducts: tool({
        description:
          "Search the FOLIO catalog by meaning (style, occasion, season, category). Returns real, in-catalog products.",
        inputSchema: z.object({
          query: z
            .string()
            .describe(
              "Descriptive search, e.g. 'elegant gold watch for evening wear'",
            ),
        }),
        execute: async ({ query }) => {
          // Vector search first; fuzzy keyword search as the fallback so the
          // stylist still works when the vector backend is unavailable.
          const matches = await semanticSearch(query, { matchCount: 6 });
          const items =
            matches.length > 0
              ? matches.map((m) => ({
                  slug: m.slug,
                  name: m.name,
                  brand: m.brand,
                  category: m.category,
                  price: formatPrice(m.price),
                  image: m.images?.[0] ?? null,
                  rating: m.rating,
                  inStock: m.in_stock,
                }))
              : fuzzySearch(await getCatalog(), query)
                  .slice(0, 6)
                  .map((p) => ({
                    slug: p.slug,
                    name: p.name,
                    brand: p.brand ?? null,
                    category: p.category,
                    price: formatPrice(p.price),
                    image: p.images[0] ?? null,
                    rating: p.rating ?? null,
                    inStock: p.inStock,
                  }));
          return { query, items };
        },
      }),
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
