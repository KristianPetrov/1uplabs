import type { Metadata } from "next";
import Link from "next/link";

import { getMoleculesForProduct } from "@/app/lib/molecules";
import { products } from "@/app/lib/products";
import ProductCard from "@/app/components/ProductCard";
import CircuitOverlay from "@/app/components/CircuitOverlay";
import SiteHeader from "@/app/components/SiteHeader";

export const metadata: Metadata = {
    title: "Store",
    description:
        "Browse the 1UpLabs research-only catalog with molecular structure previews.",
    alternates: { canonical: "/store" },
};

export default function StorePage ()
{
    return (
        <div className="min-h-screen text-zinc-50">
            <SiteHeader
                subtitle="Research peptides"
                actions={(
                    <Link
                        href="/"
                        className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8 neon-edge"
                    >
                        Home
                    </Link>
                )}
            />

            <main id="catalog" className="relative mx-auto max-w-6xl px-6 py-12 sm:py-16">
                <CircuitOverlay variant="panel" className="opacity-30" animated={false} />
                <div className="relative z-10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                Store
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                                Full catalog with molecular structure previews.
                            </p>
                        </div>
                        <div className="text-xs text-white/55">
                            Not for human consumption. No medical claims are made.
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {(() =>
                        {
                            const semaglutide = products.filter((p) => p.moleculeKey === "Semaglutide");
                            const rest = products.filter((p) => p.moleculeKey !== "Semaglutide");
                            const cards = [
                                ...(semaglutide.length
                                    ? [{
                                        key: "semaglutide",
                                        title: "Semaglutide",
                                        moleculeKey: "Semaglutide",
                                        variants: semaglutide,
                                    }]
                                    : []),
                                ...rest.map((p) => ({
                                    key: p.slug,
                                    title: p.name,
                                    moleculeKey: p.moleculeKey,
                                    variants: [p],
                                })),
                            ];

                            return cards.map((c) => (
                                <ProductCard
                                    key={c.key}
                                    title={c.title}
                                    moleculeKey={c.moleculeKey}
                                    molecules={getMoleculesForProduct(c.moleculeKey)}
                                    variants={c.variants}
                                />
                            ));
                        })()}
                    </div>
                </div>
            </main>

            <footer className="relative overflow-hidden border-t border-white/10">
                <CircuitOverlay variant="footer" className="opacity-40" animated={false} />
                <div className="relative mx-auto max-w-6xl px-6 py-10">
                    <div className="text-xs leading-5 text-white/60">
                        Disclaimer: Products are intended for laboratory research only and
                        are not for human consumption. No medical claims are made.
                    </div>
                </div>
            </footer>
        </div>
    );
}


