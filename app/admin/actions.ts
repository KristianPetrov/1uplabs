"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authOptions } from "@/app/auth";
import { db } from "@/app/db";
import { orders, productOverrides } from "@/app/db/schema";
import { eq } from "drizzle-orm";

const upsertSchema = z.object({
  slug: z.string().min(1),
  priceCents: z.number().int().min(0).nullable(),
  inventory: z.number().int().min(0).nullable(),
});

const adminOrderStatusSchema = z.enum(["pending", "paid", "shipped", "canceled"]);

const updateOrderSchema = z.object({
  orderId: z.string().uuid(),
  status: adminOrderStatusSchema,
  mailService: z.string().trim().max(64).optional().or(z.literal("")),
  trackingNumber: z.string().trim().max(128).optional().or(z.literal("")),
});

async function requireAdmin (): Promise<void>
{
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  if ((session.user as any).role !== "admin") throw new Error("Unauthorized");
}

export async function upsertProductOverride (input: z.infer<typeof upsertSchema>): Promise<void>
{
  await requireAdmin();
  const data = upsertSchema.parse(input);
  if (data.priceCents == null && data.inventory == null)
  {
    await db.delete(productOverrides).where(eq(productOverrides.slug, data.slug));
    return;
  }
  const now = new Date();

  await db
    .insert(productOverrides)
    .values({
      slug: data.slug,
      priceCents: data.priceCents,
      inventory: data.inventory,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: productOverrides.slug,
      set: {
        priceCents: data.priceCents,
        inventory: data.inventory,
        updatedAt: now,
      },
    });
}

export async function deleteProductOverride (slug: string): Promise<void>
{
  await requireAdmin();
  const s = z.string().min(1).parse(slug);
  await db.delete(productOverrides).where(eq(productOverrides.slug, s));
}

function readFormString (formData: FormData, key: string): string
{
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export async function updateOrderAdmin (formData: FormData): Promise<void>
{
  await requireAdmin();

  const parsed = updateOrderSchema.parse({
    orderId: readFormString(formData, "orderId"),
    status: readFormString(formData, "status"),
    mailService: readFormString(formData, "mailService"),
    trackingNumber: readFormString(formData, "trackingNumber"),
  });

  const mailService = parsed?.mailService?.trim();
  const trackingNumber = parsed?.trackingNumber?.trim();

  if (parsed.status === "shipped" && (!mailService || !trackingNumber))
  {
    throw new Error("Mail service and tracking number are required to mark an order as shipped.");
  }

  await db
    .update(orders)
    .set({
      status: parsed.status,
      mailService: parsed.status === "shipped" ? mailService : null,
      trackingNumber: parsed.status === "shipped" ? trackingNumber : null,
      shippedAt: parsed.status === "shipped" ? new Date() : null,
    })
    .where(eq(orders.id, parsed.orderId));

  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath(`/orders/${parsed.orderId}`);
}


