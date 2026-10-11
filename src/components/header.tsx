"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchDialog } from "@/components/search-dialog";
import { WishlistNav } from "@/components/wishlist-nav";
import { useCart, cartCount } from "@/store/cart";
import { CartDrawer } from "@/components/cart-drawer";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=shirts", label: "Shirts" },
  { href: "/shop?category=dresses", label: "Dresses" },
  { href: "/shop?category=shoes", label: "Shoes" },
  { href: "/shop?category=watches", label: "Watches" },
  { href: "/shop?category=accessories", label: "Accessories" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items, open } = useCart();
  const count = cartCount(items);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="bg-foreground text-background">
        <div className="container flex h-8 items-center justify-center text-[10px] uppercase tracking-[0.32em]">
          Complimentary shipping on orders over $200
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur transition-shadow",
          scrolled && "shadow-[0_1px_0_0_hsl(var(--border))]",
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-6">
            <button
              className="md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav className="hidden gap-6 md:flex">
              {NAV.slice(0, 4).map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link
            href="/"
            className="wordmark text-lg md:text-xl"
            aria-label="FOLIO home"
          >
            VINTATE
          </Link>

          <div className="flex flex-1 items-center justify-end gap-1">
            <SearchDialog />
            <ThemeToggle />
            <WishlistNav />
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Account"
              className="rounded-none"
            >
              <Link href="/account">
                <User className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open cart"
              className="relative rounded-none"
              onClick={open}
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-foreground px-1 text-[10px] font-medium text-background">
                  {count}
                </span>
              )}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-border bg-background md:hidden">
            <div className="container flex flex-col py-2">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-border py-3 text-xs uppercase tracking-widest text-foreground last:border-0"
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
