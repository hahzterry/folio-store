import { NextResponse } from "next/server";
import { printifyFetch } from "@/lib/printify";

export async function GET() {
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!shopId) {
    return NextResponse.json(
      { error: "Missing PRINTIFY_SHOP_ID" },
      { status: 500 },
    );
  }

  try {
    const result = await printifyFetch(
      `/shops/${encodeURIComponent(shopId)}/products.json`,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to load Printify products:", error);

    return NextResponse.json(
      { error: "Unable to load products" },
      { status: 502 },
    );
  }
}
