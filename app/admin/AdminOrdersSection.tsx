"use client";

import Link from "next/link";
import { useState } from "react";

import { updateOrderAdmin } from "@/app/admin/actions";
import CircuitOverlay from "@/app/components/CircuitOverlay";
import { formatUsdFromCents } from "@/app/lib/money";

type AdminOrderRow = {
  id: string;
  email: string;
  phone: string | null;
  shippingName: string;
  shippingAddress1: string;
  shippingAddress2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  status: "pending" | "paid" | "shipped" | "canceled";
  paymentMethod: "cashapp" | "zelle" | "venmo" | "bitcoin";
  totalCents: number;
  mailService: string | null;
  trackingNumber: string | null;
  createdAt: Date;
};

type Props = {
  orders: AdminOrderRow[];
};

type OrderStatus = AdminOrderRow["status"];

function fmtDateTime (d: Date): string
{
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function statusLabel (status: AdminOrderRow["status"]): string
{
  switch (status)
  {
    case "pending":
      return "Pending";
    case "paid":
      return "Paid";
    case "shipped":
      return "Shipped";
    case "canceled":
      return "Canceled";
    default:
      return status;
  }
}

function formatShippingAddress (order: AdminOrderRow): string
{
  const line2 = order.shippingAddress2?.trim();
  const stateZip = `${order.shippingState} ${order.shippingZip}`.trim();
  return [
    order.shippingAddress1,
    line2 || null,
    `${order.shippingCity}, ${stateZip}`,
    order.shippingCountry,
  ].filter(Boolean).join(", ");
}

const PAYMENT_METHOD_OPTIONS: { value: "cashapp" | "zelle" | "venmo" | "bitcoin"; label: string }[] = [
  { value: "venmo", label: "Venmo" },
  { value: "zelle", label: "Zelle" },
  { value: "bitcoin", label: "Bitcoin" },
  { value: "cashapp", label: "Cash App" },
];

function AdminOrderCard ({ order }: { order: AdminOrderRow })
{
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const showShippingFields = status === "shipped";
  const showPaidViaField = status === "paid";
  const shippingAddress = formatShippingAddress(order);

  return (
    <form
      action={updateOrderAdmin}
      className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 sm:p-5"
    >
      <input type="hidden" name="orderId" value={order.id} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">
            Order{" "}
            <Link
              href={`/orders/${order.id}`}
              className="text-emerald-200 underline decoration-emerald-300/40 underline-offset-4"
            >
              {order.id.slice(0, 8)}
            </Link>
          </div>
          <div className="mt-1 text-xs text-white/60">
            {fmtDateTime(order.createdAt)} · {order.email}
          </div>
          {order.phone ? (
            <div className="mt-1 text-xs text-white/55">
              Phone: {order.phone}
            </div>
          ) : null}
          <div className="mt-1 text-xs text-white/55">
            Ship to {order.shippingName}
          </div>
          <div className="mt-1 text-xs text-white/55">
            {shippingAddress}
          </div>
        </div>

        <div className="shrink-0 text-sm font-semibold text-white">
          {formatUsdFromCents(order.totalCents)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-white/60">Status</span>
          <select
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as OrderStatus)}
            className="h-10 rounded-2xl border border-white/10 bg-zinc-950/50 px-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="canceled">Canceled</option>
          </select>
        </label>

        {showPaidViaField ? (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Paid via</span>
            <select
              name="paymentMethod"
              defaultValue={order.paymentMethod}
              required
              className="h-10 rounded-2xl border border-white/10 bg-zinc-950/50 px-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
            >
              {PAYMENT_METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showShippingFields ? (
          <>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-semibold text-white/60">Mail carrier</span>
              <input
                name="mailService"
                defaultValue={order.mailService ?? ""}
                placeholder="USPS, UPS, FedEx..."
                required
                className="h-10 rounded-2xl border border-white/10 bg-zinc-950/50 px-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">Tracking #</span>
              <input
                name="trackingNumber"
                defaultValue={order.trackingNumber ?? ""}
                placeholder="9400..."
                required
                className="h-10 rounded-2xl border border-white/10 bg-zinc-950/50 px-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
              />
            </label>
          </>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-white/60">
          Current: <span className="font-semibold text-white">{statusLabel(order.status)}</span>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
        >
          Save order
        </button>
      </div>
    </form>
  );
}

export default function AdminOrdersSection ({ orders }: Props)
{
  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 lg:mt-8">
      <CircuitOverlay variant="panel" className="opacity-40" animated={false} />
      <div className="relative z-10">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Order management
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Orders
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/65">
          View order details and update statuses. Mail carrier and tracking number are only shown when shipped is selected.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {orders.length ? orders.map((order) => (
            <AdminOrderCard key={order.id} order={order} />
          )) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              No orders yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

