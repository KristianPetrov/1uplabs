import { NextResponse } from "next/server";

import { products } from "@/app/lib/products";
import { getPricingRows } from "@/app/lib/pricing";
import { getFlatShippingCents } from "@/app/lib/shopSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET (request: Request): Promise<Response>
{
  const url = new URL(request.url);
  const slugsParam = url.searchParams.get("slugs");
  const slugs = (slugsParam
    ? slugsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : products.map((p) => p.slug));
  const [rows, flatShippingCents] = await Promise.all([
    getPricingRows(slugs),
    getFlatShippingCents(),
  ]);
  return NextResponse.json(
    { rows, flatShippingCents },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}


