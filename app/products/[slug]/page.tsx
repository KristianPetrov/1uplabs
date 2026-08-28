import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import LazyMoleculeViewer from "@/app/components/LazyMoleculeViewer";
import AddToCartButton from "@/app/components/AddToCartButton";
import ExpandableResearch from "@/app/components/ExpandableResearch";
import LivePrice from "@/app/components/LivePrice";
import CircuitOverlay from "@/app/components/CircuitOverlay";
import SiteHeader from "@/app/components/SiteHeader";
import BottleAura from "@/app/components/BottleAura";
import { getMoleculesForProduct } from "@/app/lib/molecules";
import { getProductBySlug, getProductImagePath, products } from "@/app/lib/products";

type Props = {
    params: Promise<{ slug: string }>;
};

function amountSortKey (amount: string): number
{
    const n = Number.parseFloat(amount.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

export async function generateMetadata ({ params }: Props): Promise<Metadata>
{
    const { slug } = await params;
    const p = getProductBySlug(slug);
    if (!p) return { title: "Product not found" };
    return {
        title: `${p.name} ${p.amount}`,
        description: p.research?.summary ?? `Research-only product. Vial strength ${p.amount}.`,
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
    const imagePath = getProductImagePath(p.slug);
    const variants = products
        .filter((item) => item.moleculeKey === p.moleculeKey)
        .sort((a, b) => amountSortKey(a.amount) - amountSortKey(b.amount));
    const variantSelectorLabel = variants.every((item) => item.amount.trim().toLowerCase().endsWith("ml"))
        ? "Size"
        : "Strength";

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
                    <div className="space-y-4">
                        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4">
                            <CircuitOverlay variant="panel" className="opacity-45" animated={false} />
                            {imagePath ? (
                                <div className="relative z-10 h-72 sm:h-96">
                                    <BottleAura />
                                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                                        <div className="vial-photo relative h-full w-auto aspect-square max-w-full">
                                            <Image
                                                src={imagePath}
                                                alt={`${p.name} ${p.amount} vial`}
                                                fill
                                                sizes="(max-width: 1024px) 100vw, 50vw"
                                                className="origin-center scale-[1.12] object-contain sm:scale-[1.08]"
                                                priority
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative z-10 h-72 overflow-hidden rounded-2xl border border-white/10 sm:h-96">
                                    <LazyMoleculeViewer
                                        productName={p.moleculeKey}
                                        molecules={molecules}
                                        variant="hero"
                                        className="h-full"
                                    />
                                </div>
                            )}
                        </div>

                        {imagePath && molecules.length > 0 ? (
                            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4">
                                <CircuitOverlay variant="panel" className="opacity-45" animated={false} />
                                <div className="relative z-10 h-56 overflow-hidden rounded-2xl border border-white/10 sm:h-72">
                                    <LazyMoleculeViewer
                                        productName={p.moleculeKey}
                                        molecules={molecules}
                                        variant="hero"
                                        className="h-full"
                                    />
                                </div>
                            </div>
                        ) : null}
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
                            {variants.length > 1 ? (
                                <div className="mt-4">
                                    <div className="text-xs text-white/60">{variantSelectorLabel}</div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {variants.map((variant) =>
                                        {
                                            const isActive = variant.slug === p.slug;
                                            return (
                                                <Link
                                                    key={variant.slug}
                                                    href={`/products/${variant.slug}`}
                                                    aria-current={isActive ? "page" : undefined}
                                                    className={isActive
                                                        ? "inline-flex min-h-9 items-center rounded-full bg-emerald-500 px-3.5 text-sm font-semibold text-zinc-950"
                                                        : "inline-flex min-h-9 items-center rounded-full border border-white/10 bg-white/5 px-3.5 text-sm font-semibold text-white transition hover:border-emerald-500/30 hover:bg-white/8"}
                                                >
                                                    {variant.amount}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2 text-sm text-white/70">
                                    Vial {variantSelectorLabel.toLowerCase()}: <span className="font-semibold text-white">{p.amount}</span>
                                </div>
                            )}
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
                                    title="About this material"
                                    collapsible={false}
                                    summary={p.research.summary}
                                    paragraphs={p.research.paragraphs}
                                    bullets={p.research.bullets}
                                />
                            )}

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <AddToCartButton
                                    slug={p.slug}
                                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-center text-sm font-semibold leading-none text-zinc-950 whitespace-nowrap transition hover:bg-emerald-400 sm:flex-none sm:px-6"
                                />
                                <Link
                                    href="/store"
                                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-center text-sm font-semibold leading-none text-white whitespace-nowrap transition hover:border-emerald-500/30 hover:bg-white/8 sm:flex-none sm:px-6"
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
