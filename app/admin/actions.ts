"use server";

import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/auth";
import { db } from "@/app/db";
import { productOverrides } from "@/app/db/schema";
import { eq } from "drizzle-orm";

const upsertSchema = z.object({
  slug: z.string().min(1),
  priceCents: z.number().int().min(0).nullable(),
  inventory: z.number().int().min(0).nullable(),
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


