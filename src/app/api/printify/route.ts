import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    service: "VINTATE Printify API",
    endpoints: {
      shops: "/api/printify/shops",
      products: "/api/printify/products",
    },
  });
}
