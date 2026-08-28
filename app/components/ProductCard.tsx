"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { Product } from "@/app/lib/products";
import { getProductImagePath } from "@/app/lib/products";
import BottleAura from "@/app/components/BottleAura";
import { formatUsdFromCents } from "@/app/lib/money";
import AddToCartButton from "@/app/components/AddToCartButton";
import { usePricing } from "@/app/pricing/PricingProvider";

type Props = {
    title: string;
    variants: Product[];
};

function amountSortKey (amount: string): number
{
    const n = Number.parseFloat(amount.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function getVariantSelectorLabel (variants: Product[]): string
{
    const normalizedAmounts = variants.map((variant) => variant.amount.trim().toLowerCase());

    if (normalizedAmounts.every((amount) => amount.endsWith("ml"))) return "Size";
    if (normalizedAmounts.every((amount) => amount.endsWith("mg"))) return "Strength";

    return "Option";
}

export default function ProductCard ({ title, variants }: Props)
{
    const pricing = usePricing();
    const sorted = useMemo(() => [...variants].sort((a, b) => amountSortKey(a.amount) - amountSortKey(b.amount)), [variants]);
    const variantSelectorLabel = useMemo(() => getVariantSelectorLabel(sorted), [sorted]);
    const [selectedSlug, setSelectedSlug] = useState<string>(() => sorted[0]?.slug ?? "");

    const selected = useMemo(() => sorted.find((v) => v.slug === selectedSlug) ?? sorted[0], [selectedSlug, sorted]);
    const isMulti = sorted.length > 1;
    const selectedImagePath = getProductImagePath(selected?.slug ?? "");
    const productHref = selected ? `/products/${selected.slug}` : "/store";

    if (!selected) return null;

    return (
        <div className="group relative isolate overflow-visible rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-500/25 hover:bg-white/6 neon-edge sm:p-5">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-500/0 blur-2xl transition group-hover:bg-sky-500/20" />
            </div>
            {selectedImagePath && (
                <Link
                    href={productHref}
                    aria-label={`View ${selected.name} ${selected.amount} details`}
                    className="relative z-0 mb-3 block h-56 sm:mb-4 sm:h-72"
                >
                    <BottleAura />
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <div className="vial-photo relative h-full w-auto aspect-square max-w-full">
                            <Image
                                src={selectedImagePath}
                                alt={`${selected.name} ${selected.amount} vial`}
                                fill
                                sizes="(max-width: 640px) 100vw, 33vw"
                                className="origin-center scale-[1.18] object-contain sm:scale-[1.14]"
                            />
                        </div>
                    </div>
                </Link>
            )}

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <Link href={productHref} className="text-base font-semibold text-white transition hover:text-emerald-200">
                        {title}
                    </Link>

                    <div className="mt-2">
                        {isMulti ? (
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-white/60">{variantSelectorLabel}</span>
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
                                {variantSelectorLabel === "Size" ? "Vial size:" : "Vial strength:"}{" "}
                                <span className="font-medium text-white">{selected.amount}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-2 text-sm font-semibold text-white">
                        {formatUsdFromCents(pricing.getPriceCents(selected.slug, selected.priceCents))}
                    </div>
                </div>

                <Link
                    href={productHref}
                    className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-500/15"
                >
                    View details
                </Link>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0 text-xs leading-relaxed text-white/55">
                    Sold for laboratory research purposes only.
                </div>
                <AddToCartButton
                    slug={selected.slug}
                    className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-full bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold leading-none text-zinc-950 whitespace-nowrap transition hover:bg-emerald-400 neon-edge sm:w-auto"
                />
            </div>
        </div>
    );
}


