"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useCart } from "@/app/cart/CartProvider";
import { formatUsdFromCents } from "@/app/lib/money";
import { products } from "@/app/lib/products";
import { usePricing } from "@/app/pricing/PricingProvider";

export default function FloatingCart ()
{
    const cart = useCart();
    const pricing = usePricing();
    const [open, setOpen] = useState(false);

    const lines = useMemo(() =>
    {
        const bySlug = new Map(products.map((p) => [p.slug, p]));
        return cart.lines
            .map((l) =>
            {
                const p = bySlug.get(l.slug);
                if (!p) return null;
                const unitPriceCents = pricing.getPriceCents(l.slug, p.priceCents);
                return { ...l, product: p, unitPriceCents, lineTotalCents: unitPriceCents * l.qty };
            })
            .filter(Boolean) as Array<{ slug: string; qty: number; product: (typeof products)[number]; unitPriceCents: number; lineTotalCents: number }>;
    }, [cart.lines, pricing]);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open cart"
                className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-zinc-950/70 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-black/25 backdrop-blur transition hover:border-emerald-500/30 hover:bg-zinc-950/85 neon-edge"
            >
                <span>Cart</span>
                <span className="text-white/70">
                    {formatUsdFromCents(cart.subtotalCents)}
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80">
                    {cart.totalItems}
                </span>
            </button>

            {open ? (
                <div className="fixed inset-0 z-50">
                    <button
                        type="button"
                        aria-label="Close cart"
                        onClick={() => setOpen(false)}
                        className="absolute inset-0 bg-black/60"
                    />

                    <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-black/40">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-lg font-semibold text-white">Cart</div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-emerald-500/30 hover:bg-white/8"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-4 border-t border-white/10 pt-4">
                            {lines.length ? (
                                <div className="flex flex-col gap-3">
                                    {lines.map((l) => (
                                        <div
                                            key={l.slug}
                                            className="rounded-2xl border border-white/10 bg-white/5 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-white">
                                                        {l.product.name}
                                                    </div>
                                                    <div className="mt-1 text-xs text-white/65">
                                                        {l.product.amount} · {formatUsdFromCents(l.unitPriceCents)} each
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => cart.remove(l.slug)}
                                                    className="text-xs font-semibold text-white/60 transition hover:text-white"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between gap-3">
                                                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5">
                                                    <button
                                                        type="button"
                                                        aria-label="Decrease quantity"
                                                        onClick={() => cart.setQty(l.slug, Math.max(1, l.qty - 1))}
                                                        className="px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/8"
                                                    >
                                                        −
                                                    </button>
                                                    <div className="min-w-10 px-3 py-1.5 text-center text-sm font-semibold text-white">
                                                        {l.qty}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        aria-label="Increase quantity"
                                                        onClick={() => cart.setQty(l.slug, l.qty + 1)}
                                                        className="px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/8"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <div className="text-sm font-semibold text-white">
                                                    {formatUsdFromCents(l.lineTotalCents)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                                    Your cart is empty.
                                </div>
                            )}
                        </div>

                        <div className="mt-5 border-t border-white/10 pt-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="text-white/70">Subtotal</div>
                                <div className="font-semibold text-white">
                                    {formatUsdFromCents(cart.subtotalCents)}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => cart.clear()}
                                    disabled={!lines.length}
                                    className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition enabled:hover:border-emerald-500/30 enabled:hover:bg-white/8 disabled:opacity-50"
                                >
                                    Clear
                                </button>
                                <Link
                                    href="/checkout"
                                    aria-disabled={!lines.length}
                                    onClick={() =>
                                    {
                                        if (!lines.length) return;
                                        setOpen(false);
                                    }}
                                    className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-emerald-500 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                                >
                                    Checkout
                                </Link>
                            </div>

                            <div className="mt-3 text-xs leading-5 text-white/55">
                                Research-only items. No medical claims are made.
                            </div>
                        </div>
                    </aside>
                </div>
            ) : null}
        </>
    );
}


