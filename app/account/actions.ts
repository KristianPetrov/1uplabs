"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { authOptions } from "@/app/auth";
import { db } from "@/app/db";
import { customerAddresses, users } from "@/app/db/schema";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(128),
  phone: z.string().trim().min(5).max(32).optional().or(z.literal("")),
});

export async function updateProfile (formData: FormData): Promise<void>
{
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not signed in");

  const data = profileSchema.parse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });

  await db
    .update(users)
    .set({
      name: data.name.trim(),
      phone: data.phone?.trim() ? data.phone.trim() : null,
    })
    .where(eq(users.id, userId));

  revalidatePath("/account");
}

const addressSchema = z.object({
  name: z.string().trim().min(2).max(128),
  phone: z.string().trim().min(5).max(32).optional().or(z.literal("")),
  address1: z.string().trim().min(3).max(128),
  address2: z.string().trim().max(128).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(64),
  state: z.string().trim().min(2).max(64),
  zip: z.string().trim().min(3).max(16),
  country: z.string().trim().min(2).max(2).default("US"),
});

export async function saveDefaultAddress (formData: FormData): Promise<void>
{
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not signed in");

  const data = addressSchema.parse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address1: String(formData.get("address1") ?? ""),
    address2: String(formData.get("address2") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    zip: String(formData.get("zip") ?? ""),
    country: String(formData.get("country") ?? "US"),
  });

  const now = new Date();

  await db
    .update(users)
    .set({
      name: data.name.trim(),
      phone: data.phone?.trim() ? data.phone.trim() : null,
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

  const values = {
    userId,
    name: data.name.trim(),
    phone: data.phone?.trim() ? data.phone.trim() : null,
    address1: data.address1.trim(),
    address2: data.address2?.trim() ? data.address2.trim() : null,
    city: data.city.trim(),
    state: data.state.trim(),
    zip: data.zip.trim(),
    country: data.country.toUpperCase(),
    isDefault: true,
    updatedAt: now,
  } as const;

  if (existingDefault[0]?.id)
  {
    await db.update(customerAddresses).set(values).where(eq(customerAddresses.id, existingDefault[0].id));
  }
  else
  {
    await db.insert(customerAddresses).values({ ...values, createdAt: now });
  }

  revalidatePath("/account");
}



