import { NextResponse } from "next/server";

import { products } from "@/app/lib/products";
import { getPricingRows } from "@/app/lib/pricing";

export const runtime = "nodejs";

export async function GET (request: Request): Promise<Response>
{
  const url = new URL(request.url);
  const slugsParam = url.searchParams.get("slugs");
  const slugs = (slugsParam
    ? slugsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : products.map((p) => p.slug));
  const rows = await getPricingRows(slugs);
  return NextResponse.json({ rows });
}


