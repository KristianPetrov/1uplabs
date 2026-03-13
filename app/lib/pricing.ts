import "server-only";

import { unstable_cache } from "next/cache";

import { db } from "@/app/db";
import { productOverrides } from "@/app/db/schema";

export const PRICING_CACHE_TAG = "product-overrides-pricing";

export type PricingRow = {
  slug: string;
  priceCents: number | null;
  inventory: number | null;
};

const getAllPricingRows = unstable_cache(
  async (): Promise<PricingRow[]> =>
  {
    return await db
      .select({
        slug: productOverrides.slug,
        priceCents: productOverrides.priceCents,
        inventory: productOverrides.inventory,
      })
      .from(productOverrides);
  },
  ["product-overrides-pricing"],
  { tags: [PRICING_CACHE_TAG] },
);

export async function getPricingRows (slugs: string[]): Promise<PricingRow[]>
{
  const unique = Array.from(new Set(slugs.map((s) => s.trim()).filter(Boolean)));
  if (!unique.length) return [];

  const rows = await getAllPricingRows();
  const requested = new Set(unique);
  return rows.filter((row) => requested.has(row.slug));
}
