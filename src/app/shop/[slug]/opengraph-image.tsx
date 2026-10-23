import { ImageResponse } from "next/og";
import { getCatalog } from "@/lib/data/repository";
import { getProductBySlug } from "@/lib/data/products";
import { formatPrice } from "@/lib/utils";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "VINTATE product";

/**
 * The catalog's photos are webp, which satori can't decode — convert to PNG
 * with sharp and inline as a data URI. Returns null on any failure so the
 * card still renders (text-only) if the CDN is unreachable.
 */
async function productPhoto(url: string | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return null;
    const sharp = (await import("sharp")).default;
    const png = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(560, 630, { fit: "cover" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Per-product Open Graph card: brand panel on the left, product photo on the
 * right. Every shared product link gets its own image instead of the generic
 * site card.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug, await getCatalog());

  const name = product?.name ?? "FOLIO";
  const brand = product?.brand ?? product?.collection ?? "";
  const price = product ? formatPrice(product.price) : "";
  const image = await productPhoto(product?.images?.[0]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#F7F4EF",
        color: "#221E1C",
      }}
    >
      {/* Text panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
        }}
      >
        <div style={{ fontSize: 36, letterSpacing: 14, fontWeight: 600 }}>
          VINTATE
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {brand ? (
            <div
              style={{
                fontSize: 24,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "#6b6b6b",
              }}
            >
              {brand}
            </div>
          ) : null}
          <div
            style={{
              marginTop: 12,
              fontSize: 58,
              lineHeight: 1.1,
              fontWeight: 600,
              maxWidth: 520,
            }}
          >
            {name}
          </div>
          {price ? (
            <div style={{ marginTop: 24, fontSize: 36 }}>{price}</div>
          ) : null}
        </div>

        <div
          style={{
            fontSize: 20,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "#6b6b6b",
          }}
        >
          A curated fashion edit
        </div>
      </div>

      {/* Product photo */}
      {image ? (
        <img
          src={image}
          alt=""
          width={560}
          height={630}
          style={{ width: 560, height: 630, objectFit: "cover" }}
        />
      ) : null}
    </div>,
    { ...size },
  );
}
