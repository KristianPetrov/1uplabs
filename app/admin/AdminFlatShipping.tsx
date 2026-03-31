"use client";

import { useState, useTransition } from "react";

import { formatUsdFromCents } from "@/app/lib/money";
import { usePricing } from "@/app/pricing/PricingProvider";
import { updateFlatShippingCents } from "@/app/admin/actions";

type Props = {
  initialFlatShippingCents: number;
};

function parseUsdToCents (raw: string): number | null
{
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.round(n * 100));
}

export default function AdminFlatShipping ({ initialFlatShippingCents }: Props)
{
  const pricing = usePricing();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [input, setInput] = useState((initialFlatShippingCents / 100).toFixed(2));

  const effectiveCents = pricing.flatShippingCents;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
        Checkout shipping
      </div>
      <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
        Flat rate (all orders)
      </h2>
      <p className="mt-2 text-sm leading-6 text-white/65">
        Added once per order at checkout. Store and cart use this value from live pricing.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-semibold text-white/60">Amount (USD)</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            inputMode="decimal"
            className="h-10 w-full max-w-xs rounded-2xl border border-white/10 bg-zinc-950/40 px-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
          />
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
          {
            const cents = parseUsdToCents(input);
            if (cents == null)
            {
              setToast("Enter a valid dollar amount.");
              window.setTimeout(() => setToast(null), 2000);
              return;
            }
            startTransition(async () =>
            {
              await updateFlatShippingCents({ flatShippingCents: cents });
              setInput((cents / 100).toFixed(2));
              setToast(`Saved flat shipping (${formatUsdFromCents(cents)})`);
              window.setTimeout(() => setToast(null), 1600);
              await pricing.refresh();
            });
          }}
          className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60"
        >
          Save shipping
        </button>
      </div>

      <div className="mt-3 text-xs text-white/55">
        Live in checkout: <span className="font-semibold text-white/80">{formatUsdFromCents(effectiveCents)}</span>
        {toast ? <span className="ml-3 text-emerald-200/90">{toast}</span> : null}
      </div>
    </section>
  );
}
