import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { and, eq } from "drizzle-orm";

import { authOptions } from "@/app/auth";
import { db } from "@/app/db";
import { customerAddresses, users } from "@/app/db/schema";
import CheckoutClient from "@/app/checkout/CheckoutClient";
import SiteHeader from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "Checkout",
  alternates: { canonical: "/checkout" },
};

export default async function CheckoutPage ()
{
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  let initialEmail = "";
  let initialPhone = "";
  let initialShippingName = "";
  let initialShippingAddress1 = "";
  let initialShippingAddress2 = "";
  let initialShippingCity = "";
  let initialShippingState = "";
  let initialShippingZip = "";
  let initialShippingCountry = "US";

  if (userId)
  {
    const userRow = await db
      .select({
        email: users.email,
        name: users.name,
        phone: users.phone,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const u = userRow[0];
    if (u)
    {
      initialEmail = u.email ?? "";
      initialPhone = u.phone ?? "";
      initialShippingName = u.name ?? "";
    }

    const addrRow = await db
      .select({
        name: customerAddresses.name,
        phone: customerAddresses.phone,
        address1: customerAddresses.address1,
        address2: customerAddresses.address2,
        city: customerAddresses.city,
        state: customerAddresses.state,
        zip: customerAddresses.zip,
        country: customerAddresses.country,
      })
      .from(customerAddresses)
      .where(and(
        eq(customerAddresses.userId, userId),
        eq(customerAddresses.isDefault, true),
      ))
      .limit(1);

    const a = addrRow[0];
    if (a)
    {
      initialShippingName = a.name ?? initialShippingName;
      initialPhone = a.phone ?? initialPhone;
      initialShippingAddress1 = a.address1 ?? "";
      initialShippingAddress2 = a.address2 ?? "";
      initialShippingCity = a.city ?? "";
      initialShippingState = a.state ?? "";
      initialShippingZip = a.zip ?? "";
      initialShippingCountry = a.country ?? "US";
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <SiteHeader
        subtitle="Checkout"
        actions={(
          <Link
            href="/store"
            className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8 neon-edge"
          >
            Store
          </Link>
        )}
      />
      <CheckoutClient
        initialEmail={initialEmail}
        initialPhone={initialPhone}
        initialShippingName={initialShippingName}
        initialShippingAddress1={initialShippingAddress1}
        initialShippingAddress2={initialShippingAddress2}
        initialShippingCity={initialShippingCity}
        initialShippingState={initialShippingState}
        initialShippingZip={initialShippingZip}
        initialShippingCountry={initialShippingCountry}
      />
    </div>
  );
}



