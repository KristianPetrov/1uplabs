"use server";

import { count, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authOptions } from "@/app/auth";
import { db } from "@/app/db";
import { promoCodes, promoRedemptions } from "@/app/db/schema";
import { products } from "@/app/lib/products";
import { isUniqueViolation } from "@/app/lib/promoStore";
import {
  normalizePromoCode,
  promoDraftError,
  type PromoDiscountType,
  type PromoDraft,
  type PromoShippingMode,
} from "@/app/lib/promos";

const savePromoSchema = z.object({
  id: z.string().uuid().nullable(),
  code: z.string().max(40),
  name: z.string().max(120),
  description: z.string().max(300),
  active: z.boolean(),
  discountType: z.enum(["none", "percent", "fixed"]),
  percentOff: z.number().int().nullable(),
  amountOffCents: z.number().int().nullable(),
  shippingMode: z.enum(["none", "free", "fixed"]),
  shippingAmountOffCents: z.number().int().nullable(),
  productSlugs: z.array(z.string().min(1).max(120)).max(200),
  minSubtotalCents: z.number().int(),
  maxDiscountCents: z.number().int().nullable(),
  usageLimit: z.number().int().nullable(),
  perCustomerLimit: z.number().int().nullable(),
  firstOrderOnly: z.boolean(),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
});

async function requireAdmin (): Promise<void>
{
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  if ((session.user as { role?: string }).role !== "admin") throw new Error("Unauthorized");
}

function parseOptionalDate (value: string | null, label: string): Date | null
{
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Enter a valid ${label}.`);
  return date;
}

function toDraft (input: z.infer<typeof savePromoSchema>): PromoDraft
{
  const known = new Set(products.map((product) => product.slug));
  const productSlugs = Array.from(new Set(input.productSlugs.map((slug) => slug.trim()).filter(Boolean)));
  for (const slug of productSlugs)
  {
    if (!known.has(slug)) throw new Error("One of the selected products is no longer in the catalog.");
  }

  const discountType: PromoDiscountType = input.discountType;
  const shippingMode: PromoShippingMode = input.shippingMode;

  return {
    code: normalizePromoCode(input.code),
    name: input.name.trim(),
    description: input.description.trim() ? input.description.trim() : null,
    active: input.active,
    discountType,
    percentOff: discountType === "percent" ? input.percentOff : null,
    amountOffCents: discountType === "fixed" ? input.amountOffCents : null,
    shippingMode,
    shippingAmountOffCents: shippingMode === "fixed" ? input.shippingAmountOffCents : null,
    productSlugs,
    minSubtotalCents: input.minSubtotalCents,
    maxDiscountCents: input.maxDiscountCents,
    usageLimit: input.usageLimit,
    perCustomerLimit: input.perCustomerLimit,
    firstOrderOnly: input.firstOrderOnly,
    startsAt: parseOptionalDate(input.startsAt, "start time"),
    endsAt: parseOptionalDate(input.endsAt, "end time"),
  };
}

export async function savePromoCode (input: z.infer<typeof savePromoSchema>): Promise<{ id: string }>
{
  await requireAdmin();
  const parsed = savePromoSchema.parse(input);
  const draft = toDraft(parsed);
  const draftError = promoDraftError(draft);
  if (draftError) throw new Error(draftError);

  const now = new Date();
  const values = {
    code: draft.code,
    name: draft.name,
    description: draft.description,
    active: draft.active,
    discountType: draft.discountType,
    percentOff: draft.percentOff,
    amountOffCents: draft.amountOffCents,
    shippingMode: draft.shippingMode,
    shippingAmountOffCents: draft.shippingAmountOffCents,
    productSlugs: draft.productSlugs,
    minSubtotalCents: draft.minSubtotalCents,
    maxDiscountCents: draft.maxDiscountCents,
    usageLimit: draft.usageLimit,
    perCustomerLimit: draft.perCustomerLimit,
    firstOrderOnly: draft.firstOrderOnly,
    startsAt: draft.startsAt,
    endsAt: draft.endsAt,
    updatedAt: now,
  };

  try
  {
    if (parsed.id)
    {
      const updated = await db
        .update(promoCodes)
        .set(values)
        .where(eq(promoCodes.id, parsed.id))
        .returning({ id: promoCodes.id });
      const id = updated[0]?.id;
      if (!id) throw new Error("That promo code no longer exists.");
      revalidatePath("/admin");
      return { id };
    }

    const inserted = await db
      .insert(promoCodes)
      .values({
        ...values,
        createdAt: now,
      })
      .returning({ id: promoCodes.id });
    const id = inserted[0]?.id;
    if (!id) throw new Error("Couldn't create that promo code.");
    revalidatePath("/admin");
    return { id };
  }
  catch (error)
  {
    if (isUniqueViolation(error)) throw new Error("That code is already in use. Choose a different one.");
    throw error;
  }
}

export async function setPromoActive (input: { id: string; active: boolean }): Promise<void>
{
  await requireAdmin();
  const data = z.object({
    id: z.string().uuid(),
    active: z.boolean(),
  }).parse(input);

  await db
    .update(promoCodes)
    .set({
      active: data.active,
      updatedAt: new Date(),
    })
    .where(eq(promoCodes.id, data.id));

  revalidatePath("/admin");
}

export async function deletePromoCode (id: string): Promise<void>
{
  await requireAdmin();
  const promoId = z.string().uuid().parse(id);
  const used = await db
    .select({ value: count() })
    .from(promoRedemptions)
    .where(eq(promoRedemptions.promoCodeId, promoId));

  if (Number(used[0]?.value ?? 0) > 0)
  {
    throw new Error("This code has been used on an order. Deactivate it instead of deleting it.");
  }

  await db.delete(promoCodes).where(eq(promoCodes.id, promoId));
  revalidatePath("/admin");
}
