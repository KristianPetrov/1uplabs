"use server";

import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/app/db";
import { customerAddresses, orders, users } from "@/app/db/schema";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().trim().min(2).max(128).optional().or(z.literal("")),
  phone: z.string().trim().min(5).max(32).optional().or(z.literal("")),

  address1: z.string().trim().min(3).max(128).optional().or(z.literal("")),
  address2: z.string().trim().max(128).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(64).optional().or(z.literal("")),
  state: z.string().trim().min(2).max(64).optional().or(z.literal("")),
  zip: z.string().trim().min(3).max(16).optional().or(z.literal("")),
  country: z.string().trim().min(2).max(2).optional().or(z.literal("")),
});

export type RegisterCustomerInput = z.infer<typeof registerSchema>;

export async function registerCustomer (input: RegisterCustomerInput): Promise<{ userId: string }>
{
  const data = registerSchema.parse(input);
  const email = data.email.toLowerCase().trim();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length)
  {
    throw new Error("An account with this email already exists. Try logging in.");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const now = new Date();

  const inserted = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role: "customer",
      name: data.name?.trim() ? data.name.trim() : null,
      phone: data.phone?.trim() ? data.phone.trim() : null,
      createdAt: now,
    })
    .returning({ id: users.id });

  const userId = inserted[0]?.id;
  if (!userId) throw new Error("Failed to create account. Please try again.");

  const hasAnyAddress =
    !!data.address1?.trim() ||
    !!data.city?.trim() ||
    !!data.state?.trim() ||
    !!data.zip?.trim();

  if (hasAnyAddress)
  {
    if (!data.address1?.trim() || !data.city?.trim() || !data.state?.trim() || !data.zip?.trim())
    {
      throw new Error("Please complete address line 1, city, state, and ZIP (or leave the address blank).");
    }

    await db.insert(customerAddresses).values({
      userId,
      name: data.name?.trim() ? data.name.trim() : null,
      phone: data.phone?.trim() ? data.phone.trim() : null,
      address1: data.address1.trim(),
      address2: data.address2?.trim() ? data.address2.trim() : null,
      city: data.city.trim(),
      state: data.state.trim(),
      zip: data.zip.trim(),
      country: (data.country?.trim() ? data.country.trim() : "US").toUpperCase(),
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Claim past guest orders that match this email.
  await db
    .update(orders)
    .set({ customerId: userId })
    .where(and(eq(orders.email, email), isNull(orders.customerId)));

  return { userId };
}






