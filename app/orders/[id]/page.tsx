import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import CheckoutSteps from "@/app/components/CheckoutSteps";
import { db } from "@/app/db";
import { orderItems, orders } from "@/app/db/schema";
import { formatUsdFromCents } from "@/app/lib/money";
import { formatOrderNumberFromId } from "@/app/lib/orderEmails";
import { getManualPaymentMethods, orderIdToMemo } from "@/app/lib/paymentMethods";
import CopyField from "@/app/orders/[id]/CopyField";
import PaymentMethodsPanel from "@/app/orders/[id]/PaymentMethodsPanel";
import SiteHeader from "@/app/components/SiteHeader";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata ({ params }: Props): Promise<Metadata>
{
  const { id } = await params;
  return {
    title: `Order ${id.slice(0, 8)}`,
    alternates: { canonical: `/orders/${id}` },
    robots: { index: false, follow: false },
  };
}

function orderStatusLabel (status: "pending" | "paid" | "shipped" | "canceled"): string
{
  switch (status)
  {
    case "pending":
      return "awaiting payment";
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

function paymentMethodLabel (method: "cashapp" | "zelle" | "venmo" | "bitcoin"): string
{
  switch (method)
  {
    case "cashapp":
      return "Cash App";
    case "zelle":
      return "Zelle";
    case "venmo":
      return "Venmo";
    case "bitcoin":
      return "Bitcoin";
    default:
      return method;
  }
}

export default async function OrderPage ({ params }: Props)
{
  const { id } = await params;

  const order = await db
    .select({
      id: orders.id,
      email: orders.email,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      mailService: orders.mailService,
      trackingNumber: orders.trackingNumber,
      subtotalCents: orders.subtotalCents,
      totalCents: orders.totalCents,
    })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  const o = order[0];
  if (!o) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  const memo = orderIdToMemo(o.id);
  const orderNumber = formatOrderNumberFromId(o.id);
  const amountLabel = formatUsdFromCents(o.totalCents);
  const manualMethods = await getManualPaymentMethods(o.id, o.totalCents);
  const shippingCents = Math.max(0, o.totalCents - o.subtotalCents);
  const statusLabel = orderStatusLabel(o.status);
  const isPending = o.status === "pending";
  const isPaid = o.status === "paid";
  const isShipped = o.status === "shipped";

  return (
    <div className="min-h-screen text-zinc-50">
      <SiteHeader
        subtitle={isPending ? "Pay" : "Order confirmation"}
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
          <section className="opaque-panel relative overflow-hidden rounded-3xl border border-white/12 p-6 lg:col-span-3">
            <div className="relative z-10">
              {isPending ? <CheckoutSteps current="pay" /> : (
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  Order #{orderNumber}
                </div>
              )}
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                {isPending
                  ? `Pay ${amountLabel} to complete your order`
                  : isPaid
                    ? "Payment received"
                    : isShipped
                      ? "Order shipped"
                      : "Order canceled"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {isPending
                  ? "Shipping is saved. Payment is the last step — we ship after we receive it."
                  : isPaid
                    ? "Thank you. Your order will be shipped shortly. You'll receive a tracking number within 48 hours."
                    : isShipped
                      ? "Tracking details are included below."
                      : `This order is ${statusLabel}.`}
              </p>

              {isPending ? (
                <PaymentMethodsPanel memo={memo} methods={manualMethods} amountLabel={amountLabel} />
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <CopyField label="Order number" value={orderNumber} />
                  {(isPaid || isShipped) && o.paymentMethod ? (
                    <CopyField label="Paid via" value={paymentMethodLabel(o.paymentMethod)} />
                  ) : null}
                  {isShipped && o.mailService ? (
                    <CopyField label="Mail service" value={o.mailService} />
                  ) : null}
                  {isShipped && o.trackingNumber ? (
                    <CopyField label="Tracking number" value={o.trackingNumber} />
                  ) : null}
                </div>
              )}

              {isPending ? (
                <p className="mt-4 text-xs leading-5 text-white/50">
                  Order #{orderNumber}. A receipt was sent to {o.email}.
                </p>
              ) : null}

              <div className="mt-6 text-xs leading-5 text-white/55">
                Research-only items. Not for human consumption. No medical claims are made.
              </div>
            </div>
          </section>

          <aside className="opaque-panel relative overflow-hidden rounded-3xl border border-white/12 p-6 lg:col-span-2">
            <div className="relative z-10">
              <div className="text-sm font-semibold text-white">Order details</div>
              {(isPaid || isShipped) && o.paymentMethod ? (
                <div className="mt-3 text-xs text-white/60">
                  Paid via <span className="font-semibold text-white">{paymentMethodLabel(o.paymentMethod)}</span>
                </div>
              ) : null}
              <div className="mt-4 flex flex-col gap-3">
                {items.map((it) => (
                  <div key={it.id} className="opaque-field rounded-2xl border border-white/10 p-4">
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
                  <div className="text-white/70">Subtotal</div>
                  <div className="font-semibold text-white">{formatUsdFromCents(o.subtotalCents)}</div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div className="text-white/70">Shipping</div>
                  <div className="font-semibold text-white">{formatUsdFromCents(shippingCents)}</div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div className="text-white/70">Total due</div>
                  <div className="font-semibold text-white">{amountLabel}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
