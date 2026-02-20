import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/app/db";
import { orderItems, orders } from "@/app/db/schema";
import { formatUsdFromCents } from "@/app/lib/money";
import CopyField from "@/app/orders/[id]/CopyField";
import SiteHeader from "@/app/components/SiteHeader";
import CircuitOverlay from "@/app/components/CircuitOverlay";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata ({ params }: Props): Promise<Metadata>
{
  const { id } = await params;
  return {
    title: `Order ${id.slice(0, 8)}`,
    alternates: { canonical: `/orders/${id}` },
  };
}

function paymentDestination (method: string): { title: string; destinationLabel: string; destinationValue: string; note?: string }
{
  switch (method)
  {
    case "cashapp":
      return {
        title: "Cash App",
        destinationLabel: "Cash App tag",
        destinationValue: process.env.NEXT_PUBLIC_CASHAPP_TAG ?? process.env.CASHAPP_TAG ?? "$1uplabs",
        note: "Add your Order ID in the payment note/memo.",
      };
    case "venmo":
      return {
        title: "Venmo",
        destinationLabel: "Venmo handle",
        destinationValue: process.env.NEXT_PUBLIC_VENMO_HANDLE ?? process.env.VENMO_HANDLE ?? "@Shop_1-upLabs",
        note: "Add your Order ID in the payment note/memo.",
      };
    case "zelle":
      return {
        title: "Zelle",
        destinationLabel: "Zelle recipient",
        destinationValue: process.env.NEXT_PUBLIC_ZELLE_RECIPIENT ?? process.env.ZELLE_RECIPIENT ?? "you@example.com",
        note: "Add your Order ID in the payment note/memo.",
      };
    case "bitcoin":
      return {
        title: "Bitcoin",
        destinationLabel: "BTC address",
        destinationValue: process.env.NEXT_PUBLIC_BTC_ADDRESS ?? process.env.BTC_ADDRESS ?? "bc1q8rtqf33xn8mjhcwuwrrcamcpvcyvg39u0qfn36",
        note: "Send the exact amount shown (network fees not included).",
      };
    default:
      return {
        title: "Payment",
        destinationLabel: "Destination",
        destinationValue: "Contact support",
      };
  }
}

function orderIdToMemo (id: string): string
{
  return `1UpLabs ${id.slice(0, 8)}`;
}

function orderStatusLabel (status: "pending" | "paid" | "shipped" | "canceled"): string
{
  switch (status)
  {
    case "pending":
      return "pending";
    case "paid":
      return "paid";
    case "shipped":
      return "shipped";
    case "canceled":
      return "canceled";
    default:
      return status;
  }
}

export default async function OrderPage ({ params }: Props)
{
  const { id } = await params;

  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  const o = order[0];
  if (!o) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  const pay = paymentDestination(o.paymentMethod);
  const statusLabel = orderStatusLabel(o.status);
  const isPending = o.status === "pending";
  const isPaid = o.status === "paid";
  const isShipped = o.status === "shipped";

  return (
    <div className="min-h-screen text-zinc-50">
      <SiteHeader
        subtitle="Order confirmation"
        actions={(
          <Link
            href="/store"
            className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8 neon-edge"
          >
            Store
          </Link>
        )}
      />

      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-3">
            <CircuitOverlay variant="panel" className="opacity-42" animated />
            <div className="relative z-10">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                Next step
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                {isPending
                  ? `Pay with ${pay.title}`
                  : isPaid
                    ? "Payment received"
                    : isShipped
                      ? "Order shipped"
                      : "Order canceled"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Your order is reserved and marked <span className="font-semibold text-white">{o.status}</span>.
                Complete payment to confirm.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <CopyField label="Order ID" value={o.id} />
                <CopyField label="Amount (USD)" value={formatUsdFromCents(o.totalCents)} />
                {isPending ? (
                  <>
                    <CopyField label={pay.destinationLabel} value={pay.destinationValue} />
                    <CopyField label="Payment memo" value={orderIdToMemo(o.id)} />
                  </>
                ) : null}
                {isShipped && o.mailService ? (
                  <CopyField label="Mail service" value={o.mailService} />
                ) : null}
                {isShipped && o.trackingNumber ? (
                  <CopyField label="Tracking number" value={o.trackingNumber} />
                ) : null}
              </div>

              {isPending && pay.note ? (
                <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  {pay.note}
                </div>
              ) : null}

              <div className="mt-6 text-xs leading-5 text-white/55">
                Research-only items. Not for human consumption. No medical claims are made.
              </div>
            </div>
          </section>

          <aside className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
            <CircuitOverlay variant="panel" className="opacity-40" animated={false} />
            <div className="relative z-10">
              <div className="text-sm font-semibold text-white">Order summary</div>
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
                  <div className="font-semibold text-white">{formatUsdFromCents(o.totalCents)}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}


