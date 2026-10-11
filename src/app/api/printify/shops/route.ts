import { NextResponse } from "next/server";
import { printifyFetch } from "@/lib/printify";

export const dynamic = "force-dynamic";

interface PrintifyShop {
  id: number;
  title: string;
  sales_channel?: string;
}

export async function GET() {
  try {
    const shops = await printifyFetch<PrintifyShop[]>("/shops.json");

    return NextResponse.json({
      success: true,
      count: shops.length,
      shops,
    });
  } catch (error) {
    console.error("Failed to load Printify shops:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load Printify shops",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }
}
