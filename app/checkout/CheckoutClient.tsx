"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";

import { useCart } from "@/app/cart/CartProvider";
import CheckoutSteps from "@/app/components/CheckoutSteps";
import { formatUsdFromCents } from "@/app/lib/money";
import { products } from "@/app/lib/products";
import { usePricing } from "@/app/pricing/PricingProvider";
import { createOrder } from "@/app/checkout/actions";

const fieldClassName =
  "opaque-field h-11 rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/50";

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
  const flatShippingCents = pricing.flatShippingCents;
  const totalCents = subtotalCents + flatShippingCents;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <motion.section
          initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="opaque-panel relative overflow-hidden rounded-3xl border border-white/12 p-6 lg:col-span-3"
        >
            <div className="relative z-10">
            <CheckoutSteps current="shipping" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Shipping details
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Enter where we should ship. Next you’ll pay — the order is not complete until payment is sent.
            </p>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            {!cart.lines.length ? (
              <div className="opaque-field mt-6 rounded-2xl border border-white/10 p-6 text-sm text-white/70">
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
                      });

                      cart.clear();
                      window.location.assign(`/orders/${res.orderId}`);
                      return;
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
                    <span className="text-xs font-semibold text-white/75">Email</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      required
                      className={fieldClassName}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white/75">Phone (optional)</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      autoComplete="tel"
                      className={fieldClassName}
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/75">Full name</span>
                  <input
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    required
                    className={fieldClassName}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/75">Address line 1</span>
                  <input
                    value={shippingAddress1}
                    onChange={(e) => setShippingAddress1(e.target.value)}
                    required
                    className={fieldClassName}
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/75">Address line 2 (optional)</span>
                  <input
                    value={shippingAddress2}
                    onChange={(e) => setShippingAddress2(e.target.value)}
                    className={fieldClassName}
                  />
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className="flex flex-col gap-1 sm:col-span-1">
                    <span className="text-xs font-semibold text-white/75">City</span>
                    <input
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      required
                      className={fieldClassName}
                    />
                  </label>
                  <label className="flex flex-col gap-1 sm:col-span-1">
                    <span className="text-xs font-semibold text-white/75">State</span>
                    <input
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      required
                      className={fieldClassName}
                    />
                  </label>
                  <label className="flex flex-col gap-1 sm:col-span-1">
                    <span className="text-xs font-semibold text-white/75">ZIP</span>
                    <input
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      required
                      className={fieldClassName}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white/75">Country</span>
                    <select
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      className={fieldClassName}
                    >
                      <option value="US">US</option>
                      <option value="CA">CA</option>
                    </select>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={pending || !cart.lines.length}
                  className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {pending ? "Continuing…" : "Continue to payment"}
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
          className="opaque-panel relative overflow-hidden rounded-3xl border border-white/12 p-6 lg:col-span-2"
        >
            <div className="relative z-10">
            <div className="text-sm font-semibold text-white">Order summary</div>
            <div className="mt-4 flex flex-col gap-3">
              {lines.length ? lines.map((l) => (
                <div
                  key={l.slug}
                  className={`opaque-field rounded-2xl border p-4 ${l.outOfStock ? "border-rose-500/30" : "border-white/10"}`}
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
                <div className="opaque-field rounded-2xl border border-white/10 p-6 text-sm text-white/70">
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
                <div className="text-white/70">Shipping (flat rate)</div>
                <div className="font-semibold text-white">{formatUsdFromCents(flatShippingCents)}</div>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="text-white/70">Total</div>
                <div className="font-semibold text-white">{formatUsdFromCents(totalCents)}</div>
              </div>
            </div>
            </div>
        </motion.aside>
      </div>
    </main>
  );
}



