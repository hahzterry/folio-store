"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { Sparkles, ArrowUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";

interface StylistItem {
  slug: string;
  name: string;
  brand: string | null;
  category: string;
  price: string;
  image: string | null;
  rating: number | null;
  inStock: boolean;
}

const SUGGESTIONS = [
  "An outfit for a summer wedding",
  "Elegant watch under $300",
  "Cozy neutral winter layers",
];

function ProductChips({
  items,
  onNavigate,
}: {
  items: StylistItem[];
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-2 space-y-2">
      {items.map((it) => (
        <li key={it.slug}>
          <Link
            href={`/shop/${it.slug}`}
            onClick={onNavigate}
            className="flex items-center gap-3 border border-border p-2 transition-colors hover:bg-accent"
          >
            <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-muted">
              {it.image && (
                <ProductImage
                  src={it.image}
                  alt={it.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{it.name}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {it.brand ?? it.category}
              </p>
            </div>
            <span className="shrink-0 text-sm tabular-nums">{it.price}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Stylist() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const busy = status === "submitted" || status === "streaming";
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the latest message in view while streaming.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const ask = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Ask the FOLIO stylist"
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 border border-foreground bg-background px-4 py-3 text-xs uppercase tracking-widest shadow-lg transition-colors hover:bg-foreground hover:text-background"
        >
          <Sparkles className="h-4 w-4" />
          Stylist
        </button>
      </DialogTrigger>

      <DialogContent
        side="right"
        className="flex h-full w-full flex-col p-0 sm:max-w-md"
      >
        <div className="border-b border-border px-6 py-5 pr-12">
          <DialogTitle className="flex items-center gap-2 font-serif text-2xl normal-case tracking-normal">
            <Sparkles className="h-4 w-4" />
            The Stylist
          </DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Ask for outfit ideas — recommendations come straight from the
            catalog.
          </p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5">
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Try asking
              </p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="block w-full border border-border px-4 py-3 text-left text-sm transition-colors hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-5">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "user" ? (
                  <p className="ml-8 border border-border bg-secondary/40 px-4 py-2.5 text-sm">
                    {message.parts.map((part, i) =>
                      part.type === "text" ? (
                        <span key={i}>{part.text}</span>
                      ) : null,
                    )}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <p
                            key={i}
                            className="whitespace-pre-wrap text-sm leading-relaxed"
                          >
                            {part.text}
                          </p>
                        );
                      }
                      if (
                        part.type === "tool-searchProducts" &&
                        part.state === "output-available"
                      ) {
                        const output = part.output as {
                          items?: StylistItem[];
                        };
                        return (
                          <ProductChips
                            key={i}
                            items={output.items ?? []}
                            onNavigate={() => setOpen(false)}
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Styling
                <span className="animate-pulse">…</span>
              </p>
            )}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex items-center gap-2 border-t border-border p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What are you dressing for?"
            className="h-11 flex-1 border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className={cn(
              "flex h-11 w-11 items-center justify-center bg-foreground text-background transition-opacity",
              (busy || !input.trim()) && "opacity-40",
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
