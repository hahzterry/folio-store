"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowRight, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductImage } from "@/components/product-image";
import { useSearch } from "@/hooks/use-products";
import { formatPrice } from "@/lib/utils";
import { CATEGORIES } from "@/lib/data/products";
import type { SemanticMatch } from "@/lib/semantic-search";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce the query so we don't fire a request on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  // ⌘K / Ctrl+K to open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset when closed.
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebounced("");
    }
  }, [open]);

  const { data: results = [], isFetching } = useSearch(debounced);
  const hasQuery = debounced.trim().length >= 2;

  // "Vibe" results: meaning-based matches from the vector backend. Fetched for
  // descriptive queries (3+ words) or when keyword search comes up empty, and
  // deduped against the keyword results.
  const [vibe, setVibe] = useState<SemanticMatch[]>([]);
  const [vibeLoading, setVibeLoading] = useState(false);
  const wantVibe =
    hasQuery &&
    !isFetching &&
    (debounced.trim().split(/\s+/).length >= 3 || results.length === 0);

  useEffect(() => {
    if (!wantVibe) {
      setVibe([]);
      return;
    }
    let cancelled = false;
    setVibeLoading(true);
    fetch(`/api/search/semantic?q=${encodeURIComponent(debounced)}`)
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((d: { results?: SemanticMatch[] }) => {
        if (!cancelled) setVibe(d.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setVibe([]);
      })
      .finally(() => {
        if (!cancelled) setVibeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [wantVibe, debounced]);

  const fuzzySlugs = new Set(results.map((p) => p.slug));
  const vibeResults = vibe.filter((v) => !fuzzySlugs.has(v.slug));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Search"
          className="flex h-9 w-9 items-center justify-center rounded-none transition-colors hover:bg-accent"
        >
          <Search className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="top-[12%] translate-y-0 gap-0 p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Search products</DialogTitle>

        <div className="flex items-center gap-3 border-b border-border px-4 pr-12">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, categories…"
            className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {isFetching && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!hasQuery && (
            <div className="p-3">
              <p className="px-1 pb-2 text-xs uppercase tracking-widest text-muted-foreground">
                Browse
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/shop?category=${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="border border-border px-3 py-1.5 text-xs uppercase tracking-widest transition-colors hover:bg-accent"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {hasQuery &&
            results.length === 0 &&
            !isFetching &&
            !vibeLoading &&
            vibeResults.length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No results for &ldquo;{debounced}&rdquo;.
              </p>
            )}

          {hasQuery && results.length > 0 && (
            <ul>
              {results.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/shop/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-none px-3 py-2 transition-colors hover:bg-accent"
                  >
                    <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-muted">
                      <ProductImage
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{p.name}</p>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        {p.collection}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums">
                      {formatPrice(p.price)}
                    </span>
                  </Link>
                </li>
              ))}
              {results.length > 8 && (
                <li>
                  <Link
                    href={`/shop?q=${encodeURIComponent(debounced)}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-3 py-3 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                  >
                    See all {results.length} results
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </li>
              )}
            </ul>
          )}

          {hasQuery && (vibeLoading || vibeResults.length > 0) && (
            <div className="p-3 pt-2">
              <p className="flex items-center gap-1.5 px-1 pb-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                By vibe
                {vibeLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              </p>
              <ul>
                {vibeResults.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/shop/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-none px-3 py-2 transition-colors hover:bg-accent"
                    >
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-muted">
                        <ProductImage
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{p.name}</p>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">
                          {p.brand ?? p.collection}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm tabular-nums">
                        {formatPrice(p.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
