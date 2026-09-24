import "server-only";

import { and, count, eq, isNull, ne, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/app/db";
import { orders, promoCodes, promoRedemptions } from "@/app/db/schema";
import {
  normalizePromoCode,
  quotePromo,
  type PromoCartLine,
  type PromoDefinition,
  type PromoDiscountType,
  type PromoQuoteSuccess,
  type PromoShippingMode,
} from "@/app/lib/promos";

export type PromoTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type QueryClient = Pick<typeof db, "select">;

export type PromoPreview =
  | {
    ok: true;
    code: string;
    summary: string;
    description: string | null;
    merchandiseDiscountCents: number;
    shippingDiscountCents: number;
    discountCents: number;
  }
  | { ok: false; error: string };

export type LockedPromoQuote = PromoQuoteSuccess & { promoId: string };

function asDiscountType (value: string): PromoDiscountType
{
  if (value === "percent" || value === "fixed" || value === "none") return value;
  return "none";
}

function asShippingMode (value: string): PromoShippingMode
{
  if (value === "free" || value === "fixed" || value === "none") return value;
  return "none";
}

function toDefinition (
  row: typeof promoCodes.$inferSelect,
  customerRedemptionCount: number,
  priorOrderCount: number,
): PromoDefinition
{
  return {
    code: row.code,
    name: row.name,
    description: row.description,
    active: row.active,
    discountType: asDiscountType(row.discountType),
    percentOff: row.percentOff,
    amountOffCents: row.amountOffCents,
    shippingMode: asShippingMode(row.shippingMode),
    shippingAmountOffCents: row.shippingAmountOffCents,
    productSlugs: row.productSlugs ?? [],
    minSubtotalCents: row.minSubtotalCents,
    maxDiscountCents: row.maxDiscountCents,
    usageLimit: row.usageLimit,
    usedCount: row.usedCount,
    perCustomerLimit: row.perCustomerLimit,
    customerRedemptionCount,
    firstOrderOnly: row.firstOrderOnly,
    priorOrderCount,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
  };
}

async function countCustomerRedemptions (
  executor: QueryClient,
  promoCodeId: string,
  email: string,
): Promise<number>
{
  const rows = await executor
    .select({ value: count() })
    .from(promoRedemptions)
    .where(and(
      eq(promoRedemptions.promoCodeId, promoCodeId),
      eq(promoRedemptions.email, email),
      isNull(promoRedemptions.releasedAt),
    ));

  return Number(rows[0]?.value ?? 0);
}

async function countPriorOrders (executor: QueryClient, email: string): Promise<number>
{
  const rows = await executor
    .select({ value: count() })
    .from(orders)
    .where(and(
      eq(orders.email, email),
      ne(orders.status, "canceled"),
    ));

  return Number(rows[0]?.value ?? 0);
}

function needsCustomerIdentity (row: { perCustomerLimit: number | null; firstOrderOnly: boolean }): boolean
{
  return row.perCustomerLimit != null || row.firstOrderOnly;
}

export async function previewPromo (input: {
  code: string;
  email: string;
  lines: PromoCartLine[];
  shippingCents: number;
}): Promise<PromoPreview>
{
  const code = normalizePromoCode(input.code);
  if (!code) return { ok: false, error: "Enter a promo code." };

  const rows = await db
    .select()
    .from(promoCodes)
    .where(eq(promoCodes.code, code))
    .limit(1);

  const row = rows[0];
  if (!row) return { ok: false, error: "That code isn't valid." };

  const email = input.email.trim().toLowerCase();
  if (needsCustomerIdentity(row))
  {
    if (!email)
    {
      return { ok: false, error: "Enter your email before applying this code." };
    }
    const emailOk = z.string().email().safeParse(email).success;
    if (!emailOk)
    {
      return { ok: false, error: "Enter a valid email before applying this code." };
    }
  }

  const customerRedemptionCount = needsCustomerIdentity(row)
    ? await countCustomerRedemptions(db, row.id, email)
    : 0;
  const priorOrderCount = row.firstOrderOnly && email
    ? await countPriorOrders(db, email)
    : 0;

  const quote = quotePromo({
    promo: toDefinition(row, customerRedemptionCount, priorOrderCount),
    lines: input.lines,
    shippingCents: input.shippingCents,
    enforceCustomerRules: needsCustomerIdentity(row),
  });

  if (!quote.ok) return quote;

  return {
    ok: true,
    code: quote.code,
    summary: quote.summary,
    description: quote.description,
    merchandiseDiscountCents: quote.merchandiseDiscountCents,
    shippingDiscountCents: quote.shippingDiscountCents,
    discountCents: quote.discountCents,
  };
}

export async function lockAndQuotePromo (
  tx: PromoTx,
  input: {
    code: string;
    email: string;
    lines: PromoCartLine[];
    shippingCents: number;
    now?: Date;
  },
): Promise<LockedPromoQuote>
{
  const code = normalizePromoCode(input.code);
  const email = input.email.trim().toLowerCase();
  const now = input.now ?? new Date();

  const rows = await tx
    .select()
    .from(promoCodes)
    .where(eq(promoCodes.code, code))
    .limit(1)
    .for("update");

  const row = rows[0];
  if (!row) throw new Error("That code isn't valid.");

  const customerRedemptionCount = needsCustomerIdentity(row)
    ? await countCustomerRedemptions(tx, row.id, email)
    : 0;
  const priorOrderCount = row.firstOrderOnly
    ? await countPriorOrders(tx, email)
    : 0;

  const quote = quotePromo({
    promo: toDefinition(row, customerRedemptionCount, priorOrderCount),
    lines: input.lines,
    shippingCents: input.shippingCents,
    now,
    enforceCustomerRules: true,
  });

  if (!quote.ok) throw new Error(quote.error);
  return { ...quote, promoId: row.id };
}

export async function recordPromoRedemption (
  tx: PromoTx,
  input: {
    promoId: string;
    orderId: string;
    email: string;
    merchandiseDiscountCents: number;
    shippingDiscountCents: number;
    now?: Date;
  },
): Promise<void>
{
  const now = input.now ?? new Date();

  await tx.insert(promoRedemptions).values({
    promoCodeId: input.promoId,
    orderId: input.orderId,
    email: input.email.trim().toLowerCase(),
    merchandiseDiscountCents: input.merchandiseDiscountCents,
    shippingDiscountCents: input.shippingDiscountCents,
    createdAt: now,
  });

  const updated = await tx
    .update(promoCodes)
    .set({
      usedCount: sql`${promoCodes.usedCount} + 1`,
      updatedAt: now,
    })
    .where(and(
      eq(promoCodes.id, input.promoId),
      sql`(${promoCodes.usageLimit} is null or ${promoCodes.usedCount} < ${promoCodes.usageLimit})`,
    ))
    .returning({ id: promoCodes.id });

  if (!updated.length) throw new Error("That code has reached its usage limit.");
}

export async function releasePromoForOrder (tx: PromoTx, orderId: string): Promise<void>
{
  const rows = await tx
    .select()
    .from(promoRedemptions)
    .where(eq(promoRedemptions.orderId, orderId))
    .limit(1)
    .for("update");

  const redemption = rows[0];
  if (!redemption || redemption.releasedAt) return;

  const now = new Date();
  await tx
    .update(promoCodes)
    .set({
      usedCount: sql`greatest(${promoCodes.usedCount} - 1, 0)`,
      updatedAt: now,
    })
    .where(eq(promoCodes.id, redemption.promoCodeId));

  await tx
    .update(promoRedemptions)
    .set({ releasedAt: now })
    .where(eq(promoRedemptions.id, redemption.id));
}

export async function reclaimPromoForOrder (tx: PromoTx, orderId: string): Promise<void>
{
  const rows = await tx
    .select()
    .from(promoRedemptions)
    .where(eq(promoRedemptions.orderId, orderId))
    .limit(1)
    .for("update");

  const redemption = rows[0];
  if (!redemption || !redemption.releasedAt) return;

  const now = new Date();
  await tx
    .update(promoCodes)
    .set({
      usedCount: sql`${promoCodes.usedCount} + 1`,
      updatedAt: now,
    })
    .where(eq(promoCodes.id, redemption.promoCodeId));

  await tx
    .update(promoRedemptions)
    .set({ releasedAt: null })
    .where(eq(promoRedemptions.id, redemption.id));
}

export function isUniqueViolation (error: unknown): boolean
{
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current))
  {
    seen.add(current);
    if ("code" in current && (current as { code?: unknown }).code === "23505") return true;
    current = "cause" in current ? (current as { cause?: unknown }).cause : undefined;
  }
  return false;
}
