import { NextResponse } from "next/server";
import { printifyFetch } from "@/lib/printify";

export async function GET() {
  try {
    const shops = await printifyFetch<
      Array<{
        id: number;
        title: string;
        sales_channel: string;
      }>
    >("/shops.json");

    return NextResponse.json({ shops });
  } catch (error) {
    console.error("Failed to load Printify shops:", error);

    return NextResponse.json(
      { error: "Unable to load Printify shops" },
      { status: 502 },
    );
  }
}
