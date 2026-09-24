import "server-only";

import { inArray } from "drizzle-orm";

import { db } from "@/app/db";
import { productOverrides } from "@/app/db/schema";
import { products } from "@/app/lib/products";

export type PricedCheckoutLine = {
  slug: string;
  qty: number;
  productName: string;
  productAmount: string;
  unitPriceCents: number;
  lineTotalCents: number;
  inventory: number | null;
};

export async function priceCheckoutLines (
  lines: Array<{ slug: string; qty: number }>,
): Promise<PricedCheckoutLine[]>
{
  const baseBySlug = new Map(products.map((p) => [p.slug, p]));
  const uniqueSlugs = Array.from(new Set(lines.map((l) => l.slug)));

  for (const slug of uniqueSlugs)
  {
    if (!baseBySlug.has(slug)) throw new Error(`Unknown product: ${slug}`);
  }

  const overrideRows = uniqueSlugs.length
    ? await db
      .select({
        slug: productOverrides.slug,
        priceCents: productOverrides.priceCents,
        inventory: productOverrides.inventory,
      })
      .from(productOverrides)
      .where(inArray(productOverrides.slug, uniqueSlugs))
    : [];

  const overrideBySlug = new Map(overrideRows.map((r) => [r.slug, r]));

  return lines.map((l) =>
  {
    const p = baseBySlug.get(l.slug)!;
    const o = overrideBySlug.get(l.slug);
    const unitPriceCents = o?.priceCents ?? p.priceCents;
    const inventory = o?.inventory ?? null;

    if (!Number.isFinite(unitPriceCents) || unitPriceCents < 0) throw new Error(`Invalid price for ${l.slug}`);
    if (inventory != null && (!Number.isFinite(inventory) || inventory < 0)) throw new Error(`Invalid inventory for ${l.slug}`);

    return {
      slug: l.slug,
      qty: l.qty,
      productName: p.name,
      productAmount: p.amount,
      unitPriceCents,
      lineTotalCents: unitPriceCents * l.qty,
      inventory,
    };
  });
}
