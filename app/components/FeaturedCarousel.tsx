"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Product } from "@/app/lib/products";
import { getProductImagePath } from "@/app/lib/products";
import { getMoleculesForProduct } from "@/app/lib/molecules";
import LazyMoleculeViewer from "@/app/components/LazyMoleculeViewer";
import ExpandableResearch from "@/app/components/ExpandableResearch";
import { formatUsdFromCents } from "@/app/lib/money";
import { useCart } from "@/app/cart/CartProvider";
import { usePricing } from "@/app/pricing/PricingProvider";

type Props = {
    products: Product[];
    href?: string;
    autoAdvanceMs?: number;
};

function usePrefersReducedMotion (): boolean
{
    const [prefers, setPrefers] = useState(false);

    useEffect(() =>
    {
        if (typeof window === "undefined") return;
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = () => setPrefers(media.matches);
        onChange();
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
    }, []);

    return prefers;
}

export default function FeaturedCarousel ({
    products,
    href = "/store#catalog",
    autoAdvanceMs = 6500,
}: Props)
{
    const cart = useCart();
    const pricing = usePricing();
    const items = useMemo(() => products.filter(Boolean), [products]);
    const [index, setIndex] = useState(0);
    const prefersReducedMotion = usePrefersReducedMotion();

    const clampedIndex = items.length ? Math.min(index, items.length - 1) : 0;
    const active = items.length ? items[clampedIndex] : null;
    const activeImagePath = active ? getProductImagePath(active.slug) : null;

    useEffect(() =>
    {
        if (!items.length) return;
        if (prefersReducedMotion) return;
        if (!autoAdvanceMs || autoAdvanceMs < 1000) return;

        const id = window.setInterval(() =>
        {
            setIndex((prev) => (prev + 1) % items.length);
        }, autoAdvanceMs);

        return () => window.clearInterval(id);
    }, [autoAdvanceMs, items.length, prefersReducedMotion]);

    if (!items.length) return null;

    const goPrev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);
    const goNext = () => setIndex((prev) => (prev + 1) % items.length);

    return (
        <div className="mt-8">
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
                <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-sky-500/0 blur-3xl transition duration-700 group-hover:bg-sky-500/15" />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:items-stretch">
                    <div className="lg:col-span-3">
                        <div className="h-64 overflow-hidden rounded-2xl border border-white/10">
                            {active ? (
                                <LazyMoleculeViewer
                                    productName={active.moleculeKey}
                                    molecules={getMoleculesForProduct(active.moleculeKey)}
                                    variant="hero"
                                    className="h-full"
                                />
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-col justify-between gap-5 lg:col-span-2">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                                Featured
                            </div>
                            <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
                                {active?.name}
                            </div>
                            {activeImagePath && (
                                <div className="relative mt-3 h-60">
                                    <Image
                                        src={activeImagePath}
                                        alt={`${active?.name ?? "Product"} ${active?.amount ?? ""} vial`}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 40vw"
                                        className="object-contain drop-shadow-[0_0_28px_rgba(56,189,248,0.24)]"
                                    />
                                </div>
                            )}
                            <div className="mt-2 text-sm text-white/70">
                                Vial strength:{" "}
                                <span className="font-semibold text-white">{active?.amount}</span>
                            </div>
                            <div className="mt-2 text-sm font-semibold text-white">
                                {active ? formatUsdFromCents(pricing.getPriceCents(active.slug, active.priceCents)) : null}
                            </div>
                            <div className="mt-4 text-xs leading-5 text-white/55">
                                Laboratory research only. Not for human consumption. No medical claims
                                are made.
                            </div>

                            {active?.research && (
                                <ExpandableResearch
                                    className="mt-4"
                                    summary={active.research.summary}
                                    paragraphs={active.research.paragraphs}
                                    bullets={active.research.bullets}
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link
                                href={href}
                                className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400"
                            >
                                View in store
                            </Link>
                            <button
                                type="button"
                                onClick={() => active && cart.add(active.slug, 1)}
                                className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-emerald-500/30 hover:bg-white/8"
                            >
                                Add to cart
                            </button>

                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={goPrev}
                                        aria-label="Previous featured product"
                                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:border-emerald-500/30 hover:bg-white/8"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        aria-label="Next featured product"
                                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:border-emerald-500/30 hover:bg-white/8"
                                    >
                                        Next
                                    </button>
                                </div>

                                <div className="flex items-center gap-2" aria-label="Featured product selector">
                                    {items.map((p, i) =>
                                    {
                                        const isActive = i === clampedIndex;
                                        return (
                                            <button
                                                key={p.slug}
                                                type="button"
                                                onClick={() => setIndex(i)}
                                                aria-label={`Show ${p.name} ${p.amount}`}
                                                aria-current={isActive ? "true" : "false"}
                                                className={`h-2.5 w-2.5 rounded-full border transition ${isActive
                                                    ? "border-emerald-300 bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.22)]"
                                                    : "border-white/25 bg-white/10 hover:border-sky-500/40 hover:bg-white/15"
                                                    }`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


