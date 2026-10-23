import Link from "next/link";

export const metadata = {
  title: "Help & information",
  description: "Shipping, returns, sizing, and how to reach us.",
};

const SECTIONS = [
  {
    id: "shipping",
    title: "Shipping",
    body: [
      "Complimentary standard shipping on all orders over $200. Below that, a flat $15 rate applies at checkout.",
      "Orders are typically prepared within 2–4 business days. You can review your orders anytime from your account.",
    ],
  },
  {
    id: "returns",
    title: "Returns & exchanges",
    body: [
      "Changed your mind? Return any unworn item with its original tags within 30 days for a full refund. Returns are free.",
      "To arrange a return, contact us and we'll help you out.",
    ],
  },
  {
    id: "sizing",
    title: "Sizing",
    body: [
      "Each product page lists available sizes. Apparel follows standard XS–XL sizing; footwear is listed in S/M/L bands.",
      "If you're between sizes or unsure, reach out. We're happy to advise before you buy.",
    ],
  },
  {
    id: "contact",
    title: "Contact & accessibility",
    body: [
      "Email us at help@form.example and we'll reply within one business day.",
      "We aim to meet WCAG 2.1 AA standards across the site. If anything is hard to use, tell us and we'll fix it.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    body: [
      "We collect only what we need to process your order and improve the store. We never sell your data.",
      "This is a portfolio demo, so no real payments are processed and no personal data is stored.",
    ],
  },
  {
    id: "terms",
    title: "Terms",
    body: [
      "VINTATE is a demonstration storefront built as a personal project. Product data and imagery are sourced from public sample APIs for illustrative purposes.",
      "No goods are actually sold or shipped.",
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="container max-w-3xl py-16">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        Help
      </p>
      <h1 className="mt-2 font-serif text-4xl md:text-5xl">
        Help &amp; information
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Everything you need to know about ordering, shipping, and returns.
      </p>

      {/* Quick links */}
      <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-4 text-xs uppercase tracking-widest">
        {SECTIONS.map((s) => (
          <Link
            key={s.id}
            href={`#${s.id}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {s.title}
          </Link>
        ))}
      </nav>

      <div className="mt-12 space-y-12">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="font-serif text-2xl">{s.title}</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
