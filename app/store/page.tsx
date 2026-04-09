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
    const groupedProducts = (() =>
    {
        const countsByMoleculeKey = new Map<string, number>();

        for (const product of products)
        {
            countsByMoleculeKey.set(product.moleculeKey, (countsByMoleculeKey.get(product.moleculeKey) ?? 0) + 1);
        }

        const cards: Array<{
            key: string;
            title: string;
            moleculeKey: string;
            variants: typeof products;
        }> = [];
        const groupedKeys = new Set<string>();

        for (const product of products)
        {
            const groupCount = countsByMoleculeKey.get(product.moleculeKey) ?? 0;

            if (groupCount > 1)
            {
                if (groupedKeys.has(product.moleculeKey)) continue;

                groupedKeys.add(product.moleculeKey);
                cards.push({
                    key: product.moleculeKey,
                    title: product.name,
                    moleculeKey: product.moleculeKey,
                    variants: products.filter((p) => p.moleculeKey === product.moleculeKey),
                });
                continue;
            }

            cards.push({
                key: product.slug,
                title: product.name,
                moleculeKey: product.moleculeKey,
                variants: [product],
            });
        }

        return cards;
    })();

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

            <main id="catalog" className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
                <CircuitOverlay variant="panel" className="opacity-30" animated />
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

                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                        {groupedProducts.map((productGroup) => (
                            <ProductCard
                                key={productGroup.key}
                                title={productGroup.title}
                                moleculeKey={productGroup.moleculeKey}
                                molecules={getMoleculesForProduct(productGroup.moleculeKey)}
                                variants={productGroup.variants}
                            />
                        ))}
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


