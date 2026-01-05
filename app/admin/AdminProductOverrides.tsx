"use client";

import { motion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";

import type { Product } from "@/app/lib/products";
import { formatUsdFromCents } from "@/app/lib/money";
import { usePricing } from "@/app/pricing/PricingProvider";
import { deleteProductOverride, upsertProductOverride } from "@/app/admin/actions";

type OverrideRow = {
  slug: string;
  priceCents: number | null;
  inventory: number | null;
};

type Props = {
  products: Product[];
  overrides: OverrideRow[];
};

function parseUsdToCents (raw: string): number | null
{
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.round(n * 100));
}

export default function AdminProductOverrides ({ products, overrides }: Props)
{
  const pricing = usePricing();
  const [q, setQ] = useState("");
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  const [local, setLocal] = useState<Record<string, OverrideRow>>(() =>
  {
    const map: Record<string, OverrideRow> = {};
    for (const r of overrides) map[r.slug] = r;
    return map;
  });

  const original = useMemo(() =>
  {
    const map: Record<string, OverrideRow> = {};
    for (const r of overrides) map[r.slug] = r;
    return map;
  }, [overrides]);

  const rows = useMemo(() =>
  {
    const query = q.trim().toLowerCase();
    return products
      .filter((p) =>
      {
        if (!query) return true;
        return (
          p.slug.toLowerCase().includes(query) ||
          p.name.toLowerCase().includes(query) ||
          p.amount.toLowerCase().includes(query)
        );
      })
      .map((p) =>
      {
        const o = local[p.slug];
        return {
          product: p,
          override: o ?? null,
          effectivePriceCents: o?.priceCents ?? p.priceCents,
          effectiveInventory: o?.inventory ?? null,
        };
      });
  }, [local, products, q]);

  const setRow = (slug: string, next: OverrideRow | null) =>
  {
    setLocal((prev) =>
    {
      const copy = { ...prev };
      if (!next) delete copy[slug];
      else copy[slug] = next;
      return copy;
    });
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Pricing & inventory
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Products
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Update a product’s price/inventory. Changes propagate to the store/cart via live pricing.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Semaglutide, 10mg, tirzepatide…"
              className="h-10 w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35 sm:w-80"
            />
          </label>
          {toast ? (
            <div className="text-xs text-emerald-200/80">{toast}</div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
        <div className="hidden grid-cols-12 gap-2 border-b border-white/10 bg-zinc-950/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/55 sm:grid">
          <div className="col-span-5">Product</div>
          <div className="col-span-3">Price</div>
          <div className="col-span-2">Inventory</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-white/10">
          {rows.map(({ product, override, effectivePriceCents, effectiveInventory }) =>
          {
            const currentPriceInput = override?.priceCents != null
              ? (override.priceCents / 100).toFixed(2)
              : (product.priceCents / 100).toFixed(2);
            const currentInventoryInput = override?.inventory != null ? String(override.inventory) : "";
            const draft = local[product.slug] ?? null;
            const base = original[product.slug] ?? null;

            const isDirty = (() =>
            {
              if (!draft && !base) return false;
              const dp = draft?.priceCents ?? null;
              const di = draft?.inventory ?? null;
              const bp = base?.priceCents ?? null;
              const bi = base?.inventory ?? null;
              return dp !== bp || di !== bi;
            })();

            return (
              <motion.div
                key={product.slug}
                layout
                className="grid grid-cols-1 items-start gap-3 px-4 py-4 sm:grid-cols-12 sm:items-center sm:gap-2"
                initial={false}
              >
                <div className="col-span-1 min-w-0 sm:col-span-5">
                  <div className="truncate text-sm font-semibold text-white">
                    {product.name} <span className="text-white/60">{product.amount}</span>
                  </div>
                  <div className="mt-1 truncate text-xs text-white/50">
                    {product.slug}
                    {override ? (
                      <span className="ml-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                        Override
                      </span>
                    ) : (
                      <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/60">
                        Default
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-3">
                  <div className="text-xs text-white/50">Effective: {formatUsdFromCents(effectivePriceCents)}</div>
                  <input
                    defaultValue={currentPriceInput}
                    inputMode="decimal"
                    className="mt-1 h-10 w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                    onBlur={(e) =>
                    {
                      const v = e.target.value.trim();
                      const nextCents = v ? parseUsdToCents(v) : null;
                      if (v && nextCents == null)
                      {
                        e.target.value = currentPriceInput;
                        return;
                      }
                      setRow(product.slug, {
                        slug: product.slug,
                        priceCents: nextCents,
                        inventory: local[product.slug]?.inventory ?? override?.inventory ?? null,
                      });
                    }}
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <div className="text-xs text-white/50">Effective: {typeof effectiveInventory === "number" ? effectiveInventory : "∞"}</div>
                  <input
                    defaultValue={currentInventoryInput}
                    inputMode="numeric"
                    placeholder="∞"
                    className="mt-1 h-10 w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                    onBlur={(e) =>
                    {
                      const v = e.target.value.trim();
                      if (!v)
                      {
                        setRow(product.slug, {
                          slug: product.slug,
                          priceCents: local[product.slug]?.priceCents ?? override?.priceCents ?? null,
                          inventory: null,
                        });
                        return;
                      }
                      const n = Number.parseInt(v, 10);
                      if (!Number.isFinite(n) || n < 0)
                      {
                        e.target.value = currentInventoryInput;
                        return;
                      }

                      setRow(product.slug, {
                        slug: product.slug,
                        priceCents: local[product.slug]?.priceCents ?? override?.priceCents ?? null,
                        inventory: n,
                      });
                    }}
                  />
                </div>

                <div className="col-span-1 flex flex-wrap items-center justify-start gap-2 sm:col-span-2 sm:flex-nowrap sm:justify-end">
                  <button
                    type="button"
                    disabled={pending || !isDirty || !draft}
                    onClick={() =>
                    {
                      const next = local[product.slug];
                      if (!next) return;
                      startTransition(async () =>
                      {
                        await upsertProductOverride(next);
                        setToast(`Saved ${product.name} ${product.amount}`);
                        window.setTimeout(() => setToast(null), 1400);
                        await pricing.refresh();
                      });
                    }}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-emerald-500 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60 sm:flex-none"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                    {
                      startTransition(async () =>
                      {
                        await deleteProductOverride(product.slug);
                        setRow(product.slug, null);
                        setToast(`Reset ${product.name} ${product.amount}`);
                        window.setTimeout(() => setToast(null), 1400);
                        await pricing.refresh();
                      });
                    }}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-rose-500/30 hover:bg-white/8 disabled:opacity-60 sm:flex-none"
                  >
                    Reset
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-xs leading-5 text-white/55">
        Tip: inventory is optional (blank = unlimited). Set <strong>0</strong> to mark out of stock (checkout enforcement comes next).
      </div>
    </section>
  );
}


