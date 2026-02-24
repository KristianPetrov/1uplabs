import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import CircuitOverlay from "@/app/components/CircuitOverlay";
import SiteHeader from "@/app/components/SiteHeader";
import { db } from "@/app/db";
import { orderItems, orders } from "@/app/db/schema";
import { formatUsdFromCents } from "@/app/lib/money";
import { formatOrderNumberFromId } from "@/app/lib/orderEmails";
import { getManualPaymentMethods, orderIdToMemo } from "@/app/lib/paymentMethods";
import CopyField from "@/app/orders/[id]/CopyField";
import PaymentMethodsPanel from "@/app/orders/[id]/PaymentMethodsPanel";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata ({ params }: Props): Promise<Metadata>
{
  const { id } = await params;
  return {
    title: `Thank you · Order ${id.slice(0, 8).toUpperCase()}`,
    alternates: { canonical: `/orders/${id}/thank-you` },
  };
}

export default async function ThankYouOrderPage ({ params }: Props)
{
  const { id } = await params;

  const rows = await db
    .select({
      id: orders.id,
      status: orders.status,
      email: orders.email,
      totalCents: orders.totalCents,
    })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  const order = rows[0];
  if (!order) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const orderNumber = formatOrderNumberFromId(order.id);
  const memo = orderIdToMemo(order.id);
  const methods = getManualPaymentMethods(order.id, order.totalCents);

  return (
    <div className="min-h-screen text-zinc-50">
      <SiteHeader
        subtitle="Thank you"
        actions={(
          <div className="flex items-center gap-2">
            <Link
              href={`/orders/${order.id}`}
              className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8 neon-edge"
            >
              Order status
            </Link>
            <Link
              href="/store"
              className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8 neon-edge"
            >
              Store
            </Link>
          </div>
        )}
      />

      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-3">
            <CircuitOverlay variant="panel" className="opacity-42" animated />
            <div className="relative z-10">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                Order received
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Thank you for your order
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Order <span className="font-semibold text-white">#{orderNumber}</span> has been created and is currently
                <span className="font-semibold text-white"> {order.status}</span>.
              </p>

              <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {`We sent a receipt and payment instructions to ${order.email}. If you do not see it, check spam/promotions.`}
              </div>

              <p className="mt-4 text-sm leading-6 text-white/65">
                Once payment is received, your order will be shipped and you'll receive a tracking number within 48 hours.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <CopyField label="Order number" value={orderNumber} />
                <CopyField label="Order ID" value={order.id} />
                <CopyField label="Amount (USD)" value={formatUsdFromCents(order.totalCents)} />
                <CopyField label="Payment memo" value={memo} />
              </div>

              <PaymentMethodsPanel orderId={order.id} memo={memo} methods={methods} />

              <div className="mt-6 text-xs leading-5 text-white/55">
                Keep your order number handy. If you pay with Zelle, add your Order ID in the memo.
              </div>
            </div>
          </section>

          <aside className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
            <CircuitOverlay variant="panel" className="opacity-40" animated={false} />
            <div className="relative z-10">
              <div className="text-sm font-semibold text-white">Your order</div>
              <div className="mt-4 flex flex-col gap-3">
                {items.map((it) => (
                  <div key={it.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">
                          {it.productName} <span className="text-white/60">{it.productAmount}</span>
                        </div>
                        <div className="mt-1 text-xs text-white/60">
                          {it.qty} × {formatUsdFromCents(it.unitPriceCents)}
                        </div>
                      </div>
                      <div className="shrink-0 text-sm font-semibold text-white">
                        {formatUsdFromCents(it.lineTotalCents)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-white/70">Total</div>
                  <div className="font-semibold text-white">{formatUsdFromCents(order.totalCents)}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
