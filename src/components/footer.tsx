import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";

const GROUPS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop?category=shirts", label: "Shirts" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/about#sourcing", label: "How we source" },
      { href: "/about#sustainability", label: "Sustainability" },
      { href: "/account", label: "My account" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/help#shipping", label: "Shipping" },
      { href: "/help#returns", label: "Returns" },
      { href: "/help#sizing", label: "Sizing" },
      { href: "/help#contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="wordmark text-xl">FOLIO</p>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              A tightly edited selection of the labels we love. Sign up for new
              arrivals, restocks, and first access to drops.
            </p>
            <NewsletterForm />
          </div>

          <div className="grid grid-cols-3 gap-8 md:col-span-7">
            {GROUPS.map((g) => (
              <div key={g.title}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {g.title}
                </p>
                <ul className="mt-4 space-y-2">
                  {g.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} FOLIO Studio. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/help#privacy">Privacy</Link>
            <Link href="/help#terms">Terms</Link>
            <Link href="/help#contact">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
