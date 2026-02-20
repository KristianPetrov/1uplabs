import Link from "next/link";

import { updateOrderAdmin } from "@/app/admin/actions";
import CircuitOverlay from "@/app/components/CircuitOverlay";
import { formatUsdFromCents } from "@/app/lib/money";

type AdminOrderRow = {
  id: string;
  email: string;
  shippingName: string;
  paymentMethod: "cashapp" | "zelle" | "venmo" | "bitcoin";
  status: "pending" | "paid" | "shipped" | "canceled";
  totalCents: number;
  mailService: string | null;
  trackingNumber: string | null;
  createdAt: Date;
};

type Props = {
  orders: AdminOrderRow[];
};

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
          Update an order status to pending, paid, shipped, or canceled. Mail service and tracking number are required for shipped orders.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {orders.length ? orders.map((order) => (
            <form
              key={order.id}
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
                  <div className="mt-1 text-xs text-white/55">
                    Ship to {order.shippingName} · Pay via {order.paymentMethod}
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
                    defaultValue={order.status}
                    className="h-10 rounded-2xl border border-white/10 bg-zinc-950/50 px-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-xs font-semibold text-white/60">Mail service</span>
                  <input
                    name="mailService"
                    defaultValue={order.mailService ?? ""}
                    placeholder="USPS, UPS, FedEx..."
                    className="h-10 rounded-2xl border border-white/10 bg-zinc-950/50 px-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Tracking #</span>
                  <input
                    name="trackingNumber"
                    defaultValue={order.trackingNumber ?? ""}
                    placeholder="9400..."
                    className="h-10 rounded-2xl border border-white/10 bg-zinc-950/50 px-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                  />
                </label>
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

