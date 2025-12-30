"use server";

import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/auth";
import { db } from "@/app/db";
import { customerAddresses, orderItems, orders, productOverrides, users } from "@/app/db/schema";
import { products } from "@/app/lib/products";

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
  paymentMethod: paymentMethodSchema,
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export async function createOrder (input: CreateOrderInput): Promise<{ orderId: string }>
{
  const data = createOrderSchema.parse(input);
  const session = await getServerSession(authOptions);
  const customerId = session?.user?.id ?? null;

  const baseBySlug = new Map(products.map((p) => [p.slug, p]));
  const uniqueSlugs = Array.from(new Set(data.lines.map((l) => l.slug)));

  for (const slug of uniqueSlugs)
  {
    if (!baseBySlug.has(slug)) throw new Error(`Unknown product: ${slug}`);
  }

  const overrideRows = await db
    .select({
      slug: productOverrides.slug,
      priceCents: productOverrides.priceCents,
      inventory: productOverrides.inventory,
    })
    .from(productOverrides)
    .where(inArray(productOverrides.slug, uniqueSlugs));

  const overrideBySlug = new Map(overrideRows.map((r) => [r.slug, r]));

  const computed = data.lines.map((l) =>
  {
    const p = baseBySlug.get(l.slug)!;
    const o = overrideBySlug.get(l.slug);
    const unitPriceCents = (o?.priceCents ?? p.priceCents);
    const inventory = o?.inventory ?? null; // null = unlimited

    if (!Number.isFinite(unitPriceCents) || unitPriceCents < 0) throw new Error(`Invalid price for ${l.slug}`);
    if (inventory != null && (!Number.isFinite(inventory) || inventory < 0)) throw new Error(`Invalid inventory for ${l.slug}`);
    if (inventory != null && l.qty > inventory) throw new Error(`${p.name} ${p.amount} is out of stock (requested ${l.qty}, available ${inventory}).`);

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

  const subtotalCents = computed.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const totalCents = subtotalCents;
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
        status: "pending_payment",
        subtotalCents,
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

  return created;
}



