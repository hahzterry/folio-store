import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Stylist } from "@/components/stylist";
import { appUrl, isStylistEnabled } from "@/lib/env";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-serif",
  display: "swap",
});

const description =
  "A curated fashion edit. The best shirts, dresses, footwear, watches and accessories from the labels we love.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "VINTATE · curated vintage tees",
    template: "%s · VINTATE",
  },
  description,
  keywords: ["vintage", "shirts", "tees", "t-shirts"],
  openGraph: {
    title: "VINTATE · curated vintage tees",
    description,
    type: "website",
    siteName: "VINTATE",
  },
  twitter: {
    card: "summary_large_image",
    title: "VINTATE · curated vintage tees",
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${serif.variable}`}
    >
      <body className="min-h-dvh font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster position="bottom-right" />
            {isStylistEnabled && <Stylist />}
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
