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

const SYSTEM = `You are the VINTATE stylist — a warm, concise personal shopper for VINTATE, a curated multi-brand edit of VINTAGE SHIRTS only.

Rules:
- ALWAYS ground recommendations in real catalog items via the searchProducts tool. Never invent products, prices, or brands.
- Search with descriptive queries (era, style, fabric, occasion), not just the user's literal words. Run more than one search when an outfit needs different pieces (e.g. one for a 70s bowling shirt, one for a classic Hawaiian shirt).
- Recommend 2-4 items max, and say briefly why each works. Respect any budget mentioned (prices are shown to you formatted in USD).
- If nothing relevant comes back, say so honestly and suggest browsing the shop instead.
- Keep replies short and editorial — a stylist's note, not an essay. The UI renders product cards for whatever the tool returns, so don't repeat image URLs or slugs in your text.
- Plain text only: no markdown, asterisks, headings, or bullet lists — your text is rendered verbatim.`;

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
          "Search the VINTATE catalog of vintage shirts by meaning (era, style, fabric, occasion). Returns real, in-catalog shirts.",
        inputSchema: z.object({
          query: z
            .string()
            .describe(
              "Descriptive search, e.g. '70s geometric print button-up' or '90s grunge flannel'",
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
