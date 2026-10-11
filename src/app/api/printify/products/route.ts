import { NextResponse } from "next/server";
import { printifyFetch } from "@/lib/printify";

export const dynamic = "force-dynamic";

interface PrintifyProduct {
  id: string;
  title: string;
  description?: string;
  images?: { src: string; is_default?: boolean }[];
}

interface PrintifyProductsResponse {
  data: PrintifyProduct[];
  current_page?: number;
  last_page?: number;
  total?: number;
}

export async function GET() {
  const shopId = process.env.PRINTIFY_SHOP_ID?.trim();

  if (!shopId) {
    return NextResponse.json(
      { error: "Missing PRINTIFY_SHOP_ID" },
      { status: 500 },
    );
  }

  try {
    const result = await printifyFetch<PrintifyProductsResponse>(
      `/shops/${encodeURIComponent(shopId)}/products.json`,
    );

    const products = Array.isArray(result.data) ? result.data : [];

    return NextResponse.json({
      success: true,
      products,
      total: result.total ?? products.length,
      current_page: result.current_page ?? 1,
      last_page: result.last_page ?? 1,
    });
  } catch (error) {
    console.error("Failed to load Printify products:", {
      message: error instanceof Error ? error.message : String(error),
      shopId,
    });

    return NextResponse.json(
      {
        error: "Unable to load products",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 502 },
    );
  }
}
