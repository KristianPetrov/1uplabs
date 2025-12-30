import "dotenv/config";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { users } from "../app/db/schema";

async function main (): Promise<void>
{
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
  {
    throw new Error("DATABASE_URL is missing. Add it to your .env before running this script.");
  }

  const sql = postgres(connectionString, { ssl: "require" });
  const db = drizzle(sql);

  const email = (process.env.ADMIN_EMAIL ?? process.argv[2] ?? "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? process.argv[3] ?? "";

  if (!email || !email.includes("@"))
  {
    throw new Error("Missing admin email. Provide ADMIN_EMAIL env var or pass it as argv[2].");
  }
  if (!password || password.length < 8)
  {
    throw new Error("Missing/weak admin password. Provide ADMIN_PASSWORD env var (>= 8 chars) or pass it as argv[3].");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length)
  {
    await db.update(users).set({ passwordHash }).where(eq(users.email, email));
    // eslint-disable-next-line no-console
    console.log(`Updated admin password for ${email}`);
    return;
  }

  await db.insert(users).values({
    email,
    passwordHash,
    role: "admin",
  });

  // eslint-disable-next-line no-console
  console.log(`Created admin user: ${email}`);

  await sql.end({ timeout: 5 });
}

main().catch((e) =>
{
  // eslint-disable-next-line no-console
  console.error(e);
  process.exitCode = 1;
});


