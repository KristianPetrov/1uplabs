import "server-only";

import { inArray } from "drizzle-orm";

import { db } from "@/app/db";
import { productOverrides } from "@/app/db/schema";

export type PricingRow = {
  slug: string;
  priceCents: number | null;
  inventory: number | null;
};

export async function getPricingRows (slugs: string[]): Promise<PricingRow[]>
{
  const unique = Array.from(new Set(slugs.map((s) => s.trim()).filter(Boolean)));
  if (!unique.length) return [];

  const rows = await db
    .select({
      slug: productOverrides.slug,
      priceCents: productOverrides.priceCents,
      inventory: productOverrides.inventory,
    })
    .from(productOverrides)
    .where(inArray(productOverrides.slug, unique));

  return rows;
}


