import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/app/db";
import { shopSettings } from "@/app/db/schema";
import { DEFAULT_FLAT_SHIPPING_CENTS } from "@/app/lib/flatShippingDefaults";

export async function getFlatShippingCents (): Promise<number>
{
  const rows = await db
    .select({ flatShippingCents: shopSettings.flatShippingCents })
    .from(shopSettings)
    .where(eq(shopSettings.id, "default"))
    .limit(1);

  const v = rows[0]?.flatShippingCents;
  if (v != null && Number.isFinite(v) && v >= 0) return v;
  return DEFAULT_FLAT_SHIPPING_CENTS;
}
