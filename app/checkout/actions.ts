"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/auth";
import { db } from "@/app/db";
import { customerAddresses, orderItems, orders, productOverrides, users } from "@/app/db/schema";
import { priceCheckoutLines } from "@/app/lib/checkoutLines";
import { sendAdminOrderPlacedEmail, sendOrderReceiptEmail } from "@/app/lib/orderEmails";
import { orderTotalAfterPromo } from "@/app/lib/promos";
import { lockAndQuotePromo, previewPromo, recordPromoRedemption, type PromoPreview } from "@/app/lib/promoStore";
import { getFlatShippingCents } from "@/app/lib/shopSettings";

const paymentMethodSchema = z.enum(["cashapp", "zelle", "venmo", "bitcoin"]);

const lineSchema = z.object({
  slug: z.string().min(1),
  qty: z.number().int().min(1).max(99),
});

const createOrderSchema = z.object({
  lines: z.array(lineSchema).min(1),
  email: z.string().email(),
  phone: z.string().trim().min(5).max(32).optional().or(z.literal("")),
  shippingName: z.string().trim().min(2).max(128),
  shippingAddress1: z.string().trim().min(3).max(128),
  shippingAddress2: z.string().trim().max(128).optional().or(z.literal("")),
  shippingCity: z.string().trim().min(2).max(64),
  shippingState: z.string().trim().min(2).max(64),
  shippingZip: z.string().trim().min(3).max(16),
  shippingCountry: z.string().trim().min(2).max(2).default("US"),
  paymentMethod: paymentMethodSchema.optional().default("venmo"),
  promoCode: z.string().trim().max(40).optional().or(z.literal("")),
});

const previewPromoSchema = z.object({
  code: z.string().trim().min(1).max(40),
  email: z.string().trim().max(320).optional().or(z.literal("")),
  lines: z.array(lineSchema).min(1).max(50),
});

export async function previewPromoCode (input: z.input<typeof previewPromoSchema>): Promise<PromoPreview>
{
  const parsed = previewPromoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the code and try again." };

  try
  {
    const priced = await priceCheckoutLines(parsed.data.lines);
    const shippingCents = await getFlatShippingCents();
    return await previewPromo({
      code: parsed.data.code,
      email: parsed.data.email ?? "",
      lines: priced.map((line) => ({ slug: line.slug, lineTotalCents: line.lineTotalCents })),
      shippingCents,
    });
  }
  catch (error)
  {
    return { ok: false, error: error instanceof Error ? error.message : "Couldn't apply that code." };
  }
}

export type CreateOrderInput = z.input<typeof createOrderSchema>;

export async function createOrder (input: CreateOrderInput): Promise<{ orderId: string }>
{
  const data = createOrderSchema.parse(input);
  const session = await getServerSession(authOptions);
  const customerId = session?.user?.id ?? null;

  const computed = await priceCheckoutLines(data.lines);
  for (const line of computed)
  {
    if (line.inventory != null && line.qty > line.inventory)
    {
      throw new Error(`${line.productName} ${line.productAmount} is out of stock (requested ${line.qty}, available ${line.inventory}).`);
    }
  }

  const subtotalCents = computed.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const shippingCents = await getFlatShippingCents();
  const now = new Date();

  const created = await db.transaction(async (tx) =>
  {
    const emailNormalized = data.email.toLowerCase().trim();

    // Reserve inventory (only for products that have a finite inventory override).
    for (const line of computed)
    {
      if (line.inventory == null) continue;

      const updated = await tx
        .update(productOverrides)
        .set({
          inventory: sql`${productOverrides.inventory} - ${line.qty}`,
          updatedAt: now,
        })
        .where(and(
          eq(productOverrides.slug, line.slug),
          gte(productOverrides.inventory, line.qty),
        ))
        .returning({ slug: productOverrides.slug });

      if (!updated.length) throw new Error(`${line.productName} ${line.productAmount} just went out of stock. Please try again.`);
    }

    const promoCode = data.promoCode?.trim() ?? "";
    const appliedPromo = promoCode
      ? await lockAndQuotePromo(tx, {
        code: promoCode,
        email: emailNormalized,
        lines: computed.map((line) => ({ slug: line.slug, lineTotalCents: line.lineTotalCents })),
        shippingCents,
        now,
      })
      : null;

    const merchandiseDiscountCents = appliedPromo?.merchandiseDiscountCents ?? 0;
    const shippingDiscountCents = appliedPromo?.shippingDiscountCents ?? 0;
    const totalCents = orderTotalAfterPromo(
      subtotalCents,
      shippingCents,
      merchandiseDiscountCents,
      shippingDiscountCents,
    );

    const inserted = await tx
      .insert(orders)
      .values({
        customerId,
        email: emailNormalized,
        phone: data.phone ? data.phone.trim() : null,
        shippingName: data.shippingName,
        shippingAddress1: data.shippingAddress1,
        shippingAddress2: data.shippingAddress2 ? data.shippingAddress2.trim() : null,
        shippingCity: data.shippingCity,
        shippingState: data.shippingState,
        shippingZip: data.shippingZip,
        shippingCountry: data.shippingCountry.toUpperCase(),
        paymentMethod: data.paymentMethod,
        status: "pending",
        subtotalCents,
        shippingCents,
        discountCents: merchandiseDiscountCents,
        shippingDiscountCents,
        promoCode: appliedPromo?.code ?? null,
        promoCodeId: appliedPromo?.promoId ?? null,
        totalCents,
        createdAt: now,
      })
      .returning({ id: orders.id });

    const orderId = inserted[0]?.id;
    if (!orderId) throw new Error("Failed to create order");

    await tx.insert(orderItems).values(
      computed.map((l) => ({
        orderId,
        productSlug: l.slug,
        productName: l.productName,
        productAmount: l.productAmount,
        qty: l.qty,
        unitPriceCents: l.unitPriceCents,
        lineTotalCents: l.lineTotalCents,
      })),
    );

    if (appliedPromo)
    {
      await recordPromoRedemption(tx, {
        promoId: appliedPromo.promoId,
        orderId,
        email: emailNormalized,
        merchandiseDiscountCents,
        shippingDiscountCents,
        now,
      });
    }

    // If a customer is signed in, save/refresh their default profile + address.
    if (customerId)
    {
      if (data.shippingName.trim() || (data.phone ? data.phone.trim() : ""))
      {
        await tx
          .update(users)
          .set({
            name: data.shippingName.trim(),
            phone: data.phone ? data.phone.trim() : null,
          })
          .where(eq(users.id, customerId));
      }

      const existingDefault = await tx
        .select({ id: customerAddresses.id })
        .from(customerAddresses)
        .where(and(
          eq(customerAddresses.userId, customerId),
          eq(customerAddresses.isDefault, true),
        ))
        .limit(1);

      const addressValues = {
        userId: customerId,
        name: data.shippingName.trim() || null,
        phone: data.phone ? data.phone.trim() : null,
        address1: data.shippingAddress1,
        address2: data.shippingAddress2 ? data.shippingAddress2.trim() : null,
        city: data.shippingCity,
        state: data.shippingState,
        zip: data.shippingZip,
        country: data.shippingCountry.toUpperCase(),
        isDefault: true,
        updatedAt: now,
      } as const;

      if (existingDefault[0]?.id)
      {
        await tx.update(customerAddresses).set(addressValues).where(eq(customerAddresses.id, existingDefault[0].id));
      }
      else
      {
        await tx.insert(customerAddresses).values({
          ...addressValues,
          createdAt: now,
        });
      }
    }

    return { orderId };
  });

  try
  {
    const result = await sendOrderReceiptEmail(created.orderId);
    if (result === "failed")
    {
      console.error("[checkout] Receipt email failed to send.");
    }
  }
  catch (error)
  {
    console.error("[checkout] Failed to send receipt email", error);
  }

  try
  {
    const result = await sendAdminOrderPlacedEmail(created.orderId);
    if (result === "failed")
    {
      console.error("[checkout] Admin order notification email failed to send.");
    }
  }
  catch (error)
  {
    console.error("[checkout] Failed to send admin order notification email", error);
  }

  return created;
}



