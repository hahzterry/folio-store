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
  try {
    const shops =
      await printifyFetch<
        { id: number; title: string; sales_channel?: string }[]
      >("/shops.json");

    const shop = shops.find(
      (item) => item.id === 29127980 || item.title === "VINTATE",
    );

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "VINTATE shop not found" },
        { status: 404 },
      );
    }

    const result = await printifyFetch<PrintifyProductsResponse>(
      `/shops/${shop.id}/products.json`,
    );

    const products = Array.isArray(result.data) ? result.data : [];

    return NextResponse.json({
      success: true,
      shop: shop.title,
      products,
      total: result.total ?? products.length,
      current_page: result.current_page ?? 1,
      last_page: result.last_page ?? 1,
    });
  } catch (error) {
    console.error("Failed to load Printify products:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load products",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
