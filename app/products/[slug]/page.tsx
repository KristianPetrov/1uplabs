import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import LazyMoleculeViewer from "@/app/components/LazyMoleculeViewer";
import AddToCartButton from "@/app/components/AddToCartButton";
import ExpandableResearch from "@/app/components/ExpandableResearch";
import LivePrice from "@/app/components/LivePrice";
import CircuitOverlay from "@/app/components/CircuitOverlay";
import SiteHeader from "@/app/components/SiteHeader";
import { getMoleculesForProduct } from "@/app/lib/molecules";
import { getProductBySlug, products } from "@/app/lib/products";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata ({ params }: Props): Promise<Metadata>
{
    const { slug } = await params;
    const p = getProductBySlug(slug);
    if (!p) return { title: "Product not found" };
    return {
        title: `${p.name} ${p.amount}`,
        description: `Research-only product. Vial strength ${p.amount}.`,
        alternates: { canonical: `/products/${p.slug}` },
    };
}

export async function generateStaticParams ()
{
    return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage ({ params }: Props)
{
    const { slug } = await params;
    const p = getProductBySlug(slug);
    if (!p) notFound();

    const molecules = getMoleculesForProduct(p.moleculeKey);

    return (
        <div className="min-h-screen text-zinc-50">
            <SiteHeader
                subtitle="Research peptides"
                actions={(
                    <Link
                        href="/store"
                        className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8 neon-edge"
                    >
                        Back to store
                    </Link>
                )}
            />

            <main className="relative mx-auto max-w-6xl px-6 py-12 sm:py-16">
                <CircuitOverlay variant="panel" className="opacity-30" animated />
                <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4">
                        <CircuitOverlay variant="panel" className="opacity-45" animated={false} />
                        <div className="relative z-10 h-72 overflow-hidden rounded-2xl border border-white/10 sm:h-96">
                            <LazyMoleculeViewer
                                productName={p.moleculeKey}
                                molecules={molecules}
                                variant="hero"
                                className="h-full"
                            />
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
                        <CircuitOverlay variant="panel" className="opacity-42" animated={false} />
                        <div className="relative z-10">
                            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                                Research only
                            </div>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                                {p.name}
                            </h1>
                            <div className="mt-2 text-sm text-white/70">
                                Vial strength: <span className="font-semibold text-white">{p.amount}</span>
                            </div>
                            <div className="mt-4 text-2xl font-semibold text-white">
                                <LivePrice slug={p.slug} fallbackCents={p.priceCents} />
                            </div>

                            <div className="mt-5 text-sm leading-6 text-white/70">
                                Intended for laboratory research only. Not for human consumption.
                                No medical claims are made.
                            </div>

                            {p.research && (
                                <ExpandableResearch
                                    className="mt-5"
                                    summary={p.research.summary}
                                    paragraphs={p.research.paragraphs}
                                    bullets={p.research.bullets}
                                />
                            )}

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <AddToCartButton
                                    slug={p.slug}
                                    className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
                                />
                                <Link
                                    href="/store"
                                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-emerald-500/30 hover:bg-white/8"
                                >
                                    Continue shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}


