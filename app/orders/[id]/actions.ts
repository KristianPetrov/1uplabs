"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { authOptions } from "@/app/auth";
import { db } from "@/app/db";
import { customerAddresses, orders, users } from "@/app/db/schema";
import { sendPaymentInstructionsEmail } from "@/app/lib/orderEmails";

export async function sendPaymentInstructionsForOrder (orderId: string): Promise<{ result: "sent" | "already-sent" | "skipped-no-provider" | "failed" }>
{
  const id = z.string().uuid().parse(orderId);
  const result = await sendPaymentInstructionsEmail(id);
  return { result };
}

const updateShippingSchema = z.object({
  orderId: z.string().uuid(),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  shippingName: z.string().trim().min(2).max(128),
  shippingAddress1: z.string().trim().min(3).max(128),
  shippingAddress2: z.string().trim().max(128).optional().or(z.literal("")),
  shippingCity: z.string().trim().min(2).max(64),
  shippingState: z.string().trim().min(2).max(64),
  shippingZip: z.string().trim().min(3).max(16),
  shippingCountry: z.string().trim().min(2).max(2),
});

export type UpdatePendingOrderShippingInput = z.input<typeof updateShippingSchema>;

export async function updatePendingOrderShipping (
  input: UpdatePendingOrderShippingInput,
): Promise<{ ok: true } | { ok: false; error: string }>
{
  const parsed = updateShippingSchema.safeParse(input);
  if (!parsed.success)
  {
    return { ok: false, error: "Check the address and try again." };
  }

  const data = parsed.data;
  const phone = data.phone?.trim() ?? "";
  if (phone && phone.length < 5)
  {
    return { ok: false, error: "Enter a valid phone number, or leave it blank." };
  }

  const country = data.shippingCountry.toUpperCase();
  if (country !== "US" && country !== "CA")
  {
    return { ok: false, error: "We currently ship to the US and Canada." };
  }

  const shipping = {
    phone: phone || null,
    shippingName: data.shippingName.trim(),
    shippingAddress1: data.shippingAddress1.trim(),
    shippingAddress2: data.shippingAddress2?.trim() ? data.shippingAddress2.trim() : null,
    shippingCity: data.shippingCity.trim(),
    shippingState: data.shippingState.trim(),
    shippingZip: data.shippingZip.trim(),
    shippingCountry: country,
  };

  // Guest checkout uses the order id as the capability, same as viewing this pay page.
  // Only unpaid orders can change. Paid, shipped, and canceled orders stay locked.
  const updated = await db
    .update(orders)
    .set(shipping)
    .where(and(
      eq(orders.id, data.orderId),
      eq(orders.status, "pending"),
    ))
    .returning({
      id: orders.id,
      customerId: orders.customerId,
    });

  const order = updated[0];
  if (!order)
  {
    return { ok: false, error: "This order can no longer be edited." };
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  if (userId && order.customerId === userId)
  {
    try
    {
      const now = new Date();
      await db
        .update(users)
        .set({
          name: shipping.shippingName,
          phone: shipping.phone,
        })
        .where(eq(users.id, userId));

      const existingDefault = await db
        .select({ id: customerAddresses.id })
        .from(customerAddresses)
        .where(and(
          eq(customerAddresses.userId, userId),
          eq(customerAddresses.isDefault, true),
        ))
        .limit(1);

      const addressValues = {
        userId,
        name: shipping.shippingName,
        phone: shipping.phone,
        address1: shipping.shippingAddress1,
        address2: shipping.shippingAddress2,
        city: shipping.shippingCity,
        state: shipping.shippingState,
        zip: shipping.shippingZip,
        country: shipping.shippingCountry,
        isDefault: true,
        updatedAt: now,
      } as const;

      if (existingDefault[0]?.id)
      {
        await db.update(customerAddresses).set(addressValues).where(eq(customerAddresses.id, existingDefault[0].id));
      }
      else
      {
        await db.insert(customerAddresses).values({
          ...addressValues,
          createdAt: now,
        });
      }

      revalidatePath("/account");
      revalidatePath("/checkout");
    }
    catch (error)
    {
      console.error("[checkout] Saved the order address, but the customer profile did not update", error);
    }
  }

  revalidatePath(`/orders/${order.id}`);
  return { ok: true };
}
