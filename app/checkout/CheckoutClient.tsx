"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";

import { useCart } from "@/app/cart/CartProvider";
import { formatUsdFromCents } from "@/app/lib/money";
import { products } from "@/app/lib/products";
import { usePricing } from "@/app/pricing/PricingProvider";
import { createOrder } from "@/app/checkout/actions";
import CircuitOverlay from "@/app/components/CircuitOverlay";

type PaymentMethod = "cashapp" | "zelle" | "venmo" | "bitcoin";

type Props = {
  initialEmail?: string;
  initialPhone?: string;
  initialShippingName?: string;
  initialShippingAddress1?: string;
  initialShippingAddress2?: string;
  initialShippingCity?: string;
  initialShippingState?: string;
  initialShippingZip?: string;
  initialShippingCountry?: string;
};

export default function CheckoutClient ({
  initialEmail = "",
  initialPhone = "",
  initialShippingName = "",
  initialShippingAddress1 = "",
  initialShippingAddress2 = "",
  initialShippingCity = "",
  initialShippingState = "",
  initialShippingZip = "",
  initialShippingCountry = "US",
}: Props)
{
  const cart = useCart();
  const pricing = usePricing();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [shippingName, setShippingName] = useState(initialShippingName);
  const [shippingAddress1, setShippingAddress1] = useState(initialShippingAddress1);
  const [shippingAddress2, setShippingAddress2] = useState(initialShippingAddress2);
  const [shippingCity, setShippingCity] = useState(initialShippingCity);
  const [shippingState, setShippingState] = useState(initialShippingState);
  const [shippingZip, setShippingZip] = useState(initialShippingZip);
  const [shippingCountry, setShippingCountry] = useState(initialShippingCountry);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cashapp");

  const lines = useMemo(() =>
  {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return cart.lines
      .map((l) =>
      {
        const p = bySlug.get(l.slug);
        if (!p) return null;
        const unitPriceCents = pricing.getPriceCents(l.slug, p.priceCents);
        const inventory = pricing.getInventory(l.slug);
        const outOfStock = typeof inventory === "number" ? l.qty > inventory : false;
        return {
          slug: l.slug,
          qty: l.qty,
          product: p,
          unitPriceCents,
          inventory,
          outOfStock,
          lineTotalCents: unitPriceCents * l.qty,
        };
      })
      .filter(Boolean) as Array<{
      slug: string;
      qty: number;
      product: (typeof products)[number];
      unitPriceCents: number;
      inventory: number | undefined;
      outOfStock: boolean;
      lineTotalCents: number;
    }>;
  }, [cart.lines, pricing]);

  const hasIssues = lines.some((l) => l.outOfStock);

  const subtotalCents = useMemo(() => lines.reduce((sum, l) => sum + l.lineTotalCents, 0), [lines]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <motion.section
          initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-3 neon-edge"
        >
            <CircuitOverlay variant="panel" className="opacity-42" animated={false} />
            <div className="relative z-10">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Shipping + contact
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Complete your order
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/65">
              You’ll receive payment instructions after placing the order.
            </p>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            {!cart.lines.length ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                Your cart is empty.{" "}
                <Link href="/store" className="font-semibold text-white underline decoration-white/25 underline-offset-4">
                  Browse the store
                </Link>
                .
              </div>
            ) : (
              <form
                className="mt-6 grid grid-cols-1 gap-4"
                onSubmit={(e) =>
                {
                  e.preventDefault();
                  setError(null);

                  if (hasIssues)
                  {
                    setError("One or more items exceed available inventory. Adjust quantities and try again.");
                    return;
                  }

                  startTransition(async () =>
                  {
                    try
                    {
                      const res = await createOrder({
                        lines: lines.map((l) => ({ slug: l.slug, qty: l.qty })),
                        email,
                        phone,
                        shippingName,
                        shippingAddress1,
                        shippingAddress2,
                        shippingCity,
                        shippingState,
                        shippingZip,
                        shippingCountry,
                        paymentMethod,
                      });

                      cart.clear();
                      router.push(`/orders/${res.orderId}`);
                      router.refresh();
                    }
                    catch (err)
                    {
                      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
                    }
                  });
                }}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white/60">Email</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      required
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white/60">Phone (optional)</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      autoComplete="tel"
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Full name</span>
                  <input
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    required
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Address line 1</span>
                  <input
                    value={shippingAddress1}
                    onChange={(e) => setShippingAddress1(e.target.value)}
                    required
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Address line 2 (optional)</span>
                  <input
                    value={shippingAddress2}
                    onChange={(e) => setShippingAddress2(e.target.value)}
                    className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                  />
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className="flex flex-col gap-1 sm:col-span-1">
                    <span className="text-xs font-semibold text-white/60">City</span>
                    <input
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      required
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                    />
                  </label>
                  <label className="flex flex-col gap-1 sm:col-span-1">
                    <span className="text-xs font-semibold text-white/60">State</span>
                    <input
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      required
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                    />
                  </label>
                  <label className="flex flex-col gap-1 sm:col-span-1">
                    <span className="text-xs font-semibold text-white/60">ZIP</span>
                    <input
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      required
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white/60">Country</span>
                    <select
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                    >
                      <option value="US">US</option>
                      <option value="CA">CA</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white/60">Payment method</span>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="h-11 rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                    >
                      <option value="cashapp">Cash App</option>
                      <option value="zelle">Zelle</option>
                      <option value="venmo">Venmo</option>
                      <option value="bitcoin">Bitcoin</option>
                    </select>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={pending || !cart.lines.length}
                  className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {pending ? "Placing order…" : "Place order"}
                </button>

                <div className="text-xs leading-5 text-white/55">
                  Research-only items. No medical claims are made.
                </div>
              </form>
            )}
            </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-2 neon-edge"
        >
            <CircuitOverlay variant="panel" className="opacity-40" animated={false} />
            <div className="relative z-10">
            <div className="text-sm font-semibold text-white">Order summary</div>
            <div className="mt-4 flex flex-col gap-3">
              {lines.length ? lines.map((l) => (
                <div
                  key={l.slug}
                  className={`rounded-2xl border bg-white/5 p-4 ${l.outOfStock ? "border-rose-500/30" : "border-white/10"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">
                        {l.product.name} <span className="text-white/60">{l.product.amount}</span>
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {l.qty} × {formatUsdFromCents(l.unitPriceCents)}
                        {typeof l.inventory === "number" ? (
                          <span className="ml-2 text-white/45">
                            (avail {l.inventory})
                          </span>
                        ) : null}
                      </div>
                      {l.outOfStock ? (
                        <div className="mt-2 text-xs font-semibold text-rose-200">
                          Not enough inventory for this quantity.
                        </div>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-white">
                      {formatUsdFromCents(l.lineTotalCents)}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                  No items yet.
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="text-white/70">Subtotal</div>
                <div className="font-semibold text-white">{formatUsdFromCents(subtotalCents)}</div>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="text-white/70">Total</div>
                <div className="font-semibold text-white">{formatUsdFromCents(subtotalCents)}</div>
              </div>
            </div>
            </div>
        </motion.aside>
      </div>
    </main>
  );
}



