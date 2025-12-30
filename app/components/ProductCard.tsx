"use client";

import { useMemo, useState } from "react";

import type { MoleculeDefinition } from "@/app/lib/molecules";
import type { Product } from "@/app/lib/products";
import LazyMoleculeViewer from "@/app/components/LazyMoleculeViewer";
import ExpandableResearch from "@/app/components/ExpandableResearch";
import { formatUsdFromCents } from "@/app/lib/money";
import { useCart } from "@/app/cart/CartProvider";
import { usePricing } from "@/app/pricing/PricingProvider";

type Props = {
    title: string;
    moleculeKey: string;
    molecules: MoleculeDefinition[];
    variants: Product[];
};

function amountSortKey (amount: string): number
{
    const n = Number.parseFloat(amount.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

export default function ProductCard ({ title, moleculeKey, molecules, variants }: Props)
{
    const cart = useCart();
    const pricing = usePricing();
    const sorted = useMemo(() => [...variants].sort((a, b) => amountSortKey(a.amount) - amountSortKey(b.amount)), [variants]);
    const [selectedSlug, setSelectedSlug] = useState<string>(() => sorted[0]?.slug ?? "");

    const selected = useMemo(() => sorted.find((v) => v.slug === selectedSlug) ?? sorted[0], [selectedSlug, sorted]);
    const isMulti = sorted.length > 1;

    if (!selected) return null;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-500/25 hover:bg-white/6 neon-edge">
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-500/0 blur-2xl transition group-hover:bg-sky-500/20" />
            <div className="mb-4 h-40">
                <LazyMoleculeViewer
                    productName={moleculeKey}
                    molecules={molecules}
                    variant="hero"
                    className="h-full"
                />
            </div>

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-base font-semibold text-white">
                        {title}
                    </div>

                    <div className="mt-2">
                        {isMulti ? (
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-white/60">Strength</span>
                                <select
                                    value={selectedSlug}
                                    onChange={(e) => setSelectedSlug(e.target.value)}
                                    className="h-10 w-full rounded-xl border border-white/10 bg-zinc-950/40 px-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35"
                                >
                                    {sorted.map((v) => (
                                        <option key={v.slug} value={v.slug}>
                                            {v.amount} — {formatUsdFromCents(pricing.getPriceCents(v.slug, v.priceCents))}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : (
                            <div className="text-sm text-white/65">
                                Vial strength:{" "}
                                <span className="font-medium text-white">{selected.amount}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-2 text-sm font-semibold text-white">
                        {formatUsdFromCents(pricing.getPriceCents(selected.slug, selected.priceCents))}
                    </div>
                </div>

                <div className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                    Research
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-xs text-white/55">
                    Sold for laboratory research purposes only.
                </div>
                <button
                    type="button"
                    onClick={() => cart.add(selected.slug, 1)}
                    className="inline-flex h-9 items-center justify-center rounded-full bg-emerald-500 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 neon-edge"
                >
                    Add to cart
                </button>
            </div>

            {selected.research && (
                <ExpandableResearch
                    className="mt-4"
                    summary={selected.research.summary}
                    paragraphs={selected.research.paragraphs}
                    bullets={selected.research.bullets}
                />
            )}
        </div>
    );
}


