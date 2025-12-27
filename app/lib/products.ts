export type Product = {
    slug: string;
    name: string;
    amount: string;
    moleculeKey: string;
    featured?: boolean;
};

export const products: Product[] = [
    { slug: "semaglutide-5mg", name: "Semaglutide", amount: "5mg", moleculeKey: "Semaglutide", featured: true },
    { slug: "semaglutide-10mg", name: "Semaglutide", amount: "10mg", moleculeKey: "Semaglutide" },
    { slug: "tirzepatide-30mg", name: "Tirzepatide", amount: "30mg", moleculeKey: "Tirzepatide" },
    { slug: "retatrutide-10mg", name: "Retatrutide", amount: "10mg", moleculeKey: "Retatrutide", featured: true },
    { slug: "bpc-157-10mg", name: "BPC-157", amount: "10mg", moleculeKey: "BPC-157", featured: true },
    { slug: "tb-500-10mg", name: "TB-500", amount: "10mg", moleculeKey: "TB-500" },
    { slug: "mots-c-10mg", name: "Mots-C", amount: "10mg", moleculeKey: "MOTS-C" },
    { slug: "ghk-cu-50mg", name: "GHK-Cu", amount: "50mg", moleculeKey: "GHK-CU" },
    { slug: "ipamorelin-5mg", name: "Ipamorelin", amount: "5mg", moleculeKey: "Ipamorelin" },
    {
        slug: "cjc-1295-no-dac-5mg",
        name: "CJC-1295 (no DAC)",
        amount: "5mg",
        moleculeKey: "CJC-1295",
    },
    { slug: "tesamorelin-10mg", name: "Tesamorelin", amount: "10mg", moleculeKey: "Tesamorelin" },
    { slug: "epithalon-10mg", name: "Epithalon", amount: "10mg", moleculeKey: "Epithalon" },
    { slug: "melanotan-ii-10mg", name: "Melanotan-II", amount: "10mg", moleculeKey: "Melanotan-II" },
    { slug: "pt-141-10mg", name: "PT-141", amount: "10mg", moleculeKey: "PT-141" },
    { slug: "nad-plus-500mg", name: "NAD+", amount: "500mg", moleculeKey: "NAD+" },
    { slug: "glutathione-600mg", name: "Glutathione", amount: "600mg", moleculeKey: "Glutathione" },
];

export function getProductBySlug (slug: string): Product | undefined
{
    return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts (limit = 3): Product[]
{
    const featured = products.filter((p) => p.featured);
    if (featured.length >= limit) return featured.slice(0, limit);
    return products.slice(0, limit);
}


