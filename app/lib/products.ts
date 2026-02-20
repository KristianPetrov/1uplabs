export type Product = {
    slug: string;
    name: string;
    amount: string;
    moleculeKey: string;
    priceCents: number;
    featured?: boolean;
    research?: {
        summary: string;
        paragraphs?: string[];
        bullets?: string[];
    };
};

export const products: Product[] = [
    {
        slug: "semaglutide-5mg",
        name: "Semaglutide",
        amount: "5mg",
        moleculeKey: "Semaglutide",
        priceCents: 12900,
        featured: true,
        research: {
            summary: "GLP-1 receptor signaling + bioanalytical method development",
            paragraphs: [
                "Semaglutide is commonly used as a laboratory reference material for studying GLP-1 receptor–mediated signaling pathways and peptide behavior in solution.",
            ],
            bullets: [
                "Receptor binding / functional signaling assays (GLP-1R).",
                "Analytical method development (e.g., LC/MS workflows) and identity confirmation.",
                "Stability and handling studies (buffers, temperature, time).",
            ],
        },
    },
    {
        slug: "semaglutide-10mg",
        name: "Semaglutide",
        amount: "10mg",
        moleculeKey: "Semaglutide",
        priceCents: 19900,
        research: {
            summary: "GLP-1 receptor signaling + bioanalytical method development",
            paragraphs: [
                "Semaglutide is commonly used as a laboratory reference material for studying GLP-1 receptor–mediated signaling pathways and peptide behavior in solution.",
            ],
            bullets: [
                "Receptor binding / functional signaling assays (GLP-1R).",
                "Analytical method development (e.g., LC/MS workflows) and identity confirmation.",
                "Stability and handling studies (buffers, temperature, time).",
            ],
        },
    },
    {
        slug: "tirzepatide-30mg",
        name: "Tirzepatide",
        amount: "30mg",
        moleculeKey: "Tirzepatide",
        priceCents: 29900,
        research: {
            summary: "Dual incretin receptor assay workflows (GIPR / GLP-1R)",
            paragraphs: [
                "Tirzepatide is often used in laboratory settings to evaluate receptor binding and downstream signaling in incretin receptor models.",
            ],
            bullets: [
                "Binding / signaling assays across GIPR and GLP-1R model systems.",
                "Comparative potency benchmarking vs. other reference peptides in controlled assays.",
                "Bioanalytical identity / purity confirmation and stability checks.",
            ],
        },
    },
    {
        slug: "retatrutide-10mg",
        name: "Retatrutide",
        amount: "10mg",
        moleculeKey: "Retatrutide",
        priceCents: 24900,
        featured: true,
        research: {
            summary: "Multi-receptor signaling models + analytical characterization",
            paragraphs: [
                "Retatrutide is typically used to explore multi-receptor signaling behavior in controlled laboratory assay systems and for analytical characterization workflows.",
            ],
            bullets: [
                "Receptor signaling readouts in multi-target experimental designs.",
                "Method development for detection/quantification in bioanalytical setups.",
                "Stability/handling evaluations for storage and solution prep.",
            ],
        },
    },
    {
        slug: "bpc-157-10mg",
        name: "BPC-157",
        amount: "10mg",
        moleculeKey: "BPC-157",
        priceCents: 7900,
        featured: true,
        research: {
            summary: "Peptide identity, stability, and in‑vitro assay controls",
            paragraphs: [
                "BPC‑157 is used as a research reagent in peptide-focused workflows where identity confirmation, stability profiling, and controlled assay setup are important.",
            ],
            bullets: [
                "Identity/purity confirmation (e.g., LC/MS) and method development.",
                "Stability testing under different solution and storage conditions.",
                "Use as a control material in peptide handling and recovery experiments.",
            ],
        },
    },
    {
        slug: "tb-500-10mg",
        name: "TB-500",
        amount: "10mg",
        moleculeKey: "TB-500",
        priceCents: 8900,
        research: {
            summary: "Analytical characterization + controlled lab assay workflows",
            paragraphs: [
                "TB‑500 is commonly used in laboratory peptide workflows for analytical characterization and controlled assay setup where careful handling and verification are required.",
            ],
            bullets: [
                "Identity/purity confirmation and method development.",
                "Stability and solubility profiling under lab conditions.",
                "Recovery and adsorption testing in labware / buffers.",
            ],
        },
    },
    {
        slug: "mots-c-10mg",
        name: "Mots-C",
        amount: "10mg",
        moleculeKey: "MOTS-C",
        priceCents: 9900,
        research: {
            summary: "Mitochondrial-derived peptide models + bioanalytical workflows",
            paragraphs: [
                "MOTS‑C is used in laboratory contexts for peptide handling and bioanalytical workflows, including controlled in‑vitro model systems and method development.",
            ],
            bullets: [
                "Controlled in‑vitro assay setups in metabolic signaling model systems.",
                "Detection/quantification method development (e.g., LC/MS).",
                "Stability/handling studies for storage and preparation conditions.",
            ],
        },
    },
    {
        slug: "ghk-cu-50mg",
        name: "GHK-Cu",
        amount: "50mg",
        moleculeKey: "GHK-CU",
        priceCents: 6900,
        research: {
            summary: "Metal–peptide interactions + analytical verification",
            paragraphs: [
                "GHK‑Cu is frequently used to study metal–peptide coordination behavior and to validate analytical methods for peptide complexes.",
            ],
            bullets: [
                "Coordination/complex stability experiments under controlled conditions.",
                "Analytical identity confirmation and assay calibration material.",
                "Solution handling and storage stability checks.",
            ],
        },
    },
    {
        slug: "ipamorelin-5mg",
        name: "Ipamorelin",
        amount: "5mg",
        moleculeKey: "Ipamorelin",
        priceCents: 5900,
        research: {
            summary: "GPCR signaling assays + analytical characterization",
            paragraphs: [
                "Ipamorelin is often used as a research reagent in controlled receptor signaling assay systems and for peptide-focused analytical workflows.",
            ],
            bullets: [
                "Receptor binding / functional signaling readouts in assay models.",
                "Identity/purity confirmation and method development.",
                "Stability/handling studies (buffers, temperature, time).",
            ],
        },
    },
    {
        slug: "cjc-1295-no-dac-5mg",
        name: "CJC-1295 (no DAC)",
        amount: "5mg",
        moleculeKey: "CJC-1295",
        priceCents: 6900,
        research: {
            summary: "Peptide assay controls + identity & stability profiling",
            paragraphs: [
                "CJC‑1295 (no DAC) is commonly used in laboratory assay contexts as a peptide reference and for analytical characterization and stability profiling.",
            ],
            bullets: [
                "Controlled assay setup and benchmarking in peptide workflows.",
                "Identity/purity confirmation (e.g., LC/MS) and method development.",
                "Stability testing across storage and solution conditions.",
            ],
        },
    },
    {
        slug: "tesamorelin-10mg",
        name: "Tesamorelin",
        amount: "10mg",
        moleculeKey: "Tesamorelin",
        priceCents: 15900,
        research: {
            summary: "Controlled assay workflows + analytical method development",
            paragraphs: [
                "Tesamorelin is used as a research reagent in peptide assay workflows and for analytical characterization, including controlled handling and stability profiling.",
            ],
            bullets: [
                "Assay calibration / benchmarking in controlled experimental systems.",
                "Identity/purity confirmation and quantification method development.",
                "Stability and storage-condition evaluations.",
            ],
        },
    },
    {
        slug: "epithalon-10mg",
        name: "Epithalon",
        amount: "10mg",
        moleculeKey: "Epithalon",
        priceCents: 9900,
        research: {
            summary: "Peptide handling, stability, and analytical verification",
            paragraphs: [
                "Epithalon is commonly used in laboratory peptide workflows focused on analytical verification, stability, and controlled preparation conditions.",
            ],
            bullets: [
                "Identity/purity confirmation and method development.",
                "Stability profiling and storage-condition checks.",
                "Recovery and adsorption testing in labware / buffers.",
            ],
        },
    },
    {
        slug: "melanotan-ii-10mg",
        name: "Melanotan-II",
        amount: "10mg",
        moleculeKey: "Melanotan-II",
        priceCents: 6900,
        research: {
            summary: "Receptor signaling assay models + bioanalytical workflows",
            paragraphs: [
                "Melanotan‑II is often used in laboratory receptor signaling assay systems and for analytical characterization workflows for peptides.",
            ],
            bullets: [
                "Binding / functional signaling readouts in controlled assay models.",
                "Identity/purity confirmation and method development.",
                "Stability/handling studies across common buffers and conditions.",
            ],
        },
    },
    {
        slug: "pt-141-10mg",
        name: "PT-141",
        amount: "10mg",
        moleculeKey: "PT-141",
        priceCents: 7900,
        research: {
            summary: "Melanocortin receptor assay workflows + analytical verification",
            paragraphs: [
                "PT‑141 is used in laboratory contexts for controlled receptor assay workflows and for analytical verification of peptide identity and stability.",
            ],
            bullets: [
                "Receptor binding / signaling readouts in assay model systems.",
                "Analytical identity confirmation and quantification method development.",
                "Stability testing under common preparation and storage conditions.",
            ],
        },
    },
    {
        slug: "nad-plus-500mg",
        name: "NAD+",
        amount: "500mg",
        moleculeKey: "NAD+",
        priceCents: 9900,
        research: {
            summary: "Biochemical cofactor experiments + analytical verification",
            paragraphs: [
                "NAD+ is widely used in biochemical and enzymatic assay workflows, including calibration, method development, and stability/handling verification.",
            ],
            bullets: [
                "Enzymatic assay setups and reaction controls in biochemical workflows.",
                "Identity confirmation and quantitative method development.",
                "Stability checks under light/temperature/storage conditions.",
            ],
        },
    },
    {
        slug: "glutathione-600mg",
        name: "Glutathione",
        amount: "600mg",
        moleculeKey: "Glutathione",
        priceCents: 6900,
        research: {
            summary: "Redox chemistry workflows + assay controls",
            paragraphs: [
                "Glutathione is commonly used in laboratory redox and analytical workflows as a standard/control material and for stability/handling studies.",
            ],
            bullets: [
                "Redox reaction controls in biochemical assay systems.",
                "Analytical method development and quantitative verification.",
                "Stability and handling checks for oxidation-sensitive workflows.",
            ],
        },
    },
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

const productImagePathBySlug: Record<string, string> = {
    "semaglutide-5mg": "/products/semaglutide-5mg-vial.png",
    "semaglutide-10mg": "/products/semaglutide-10mg-vial.png",
    "tirzepatide-30mg": "/products/tirzepatide-30mg-vial.png",
    "retatrutide-10mg": "/products/retatrutide-10mg-vial.png",
    "bpc-157-10mg": "/products/bpc-157-10mg-vial.png",
    "tb-500-10mg": "/products/tb-500-10mg-vial.png",
    "mots-c-10mg": "/products/mots-c-10mg-vial.png",
    "ghk-cu-50mg": "/products/ghk-cu-50mg-vial.png",
    "ipamorelin-5mg": "/products/ipamorelin-5mg-vial.png",
    "cjc-1295-no-dac-5mg": "/products/cjc-1295-no-dac-5mg-vial.png",
    "tesamorelin-10mg": "/products/tesamorelin-10mg-vial.png",
    "epithalon-10mg": "/products/epithalon-10mg-vial.png",
    "melanotan-ii-10mg": "/products/melanotan-II-10mg-vial .png",
    "pt-141-10mg": "/products/pt-141-10mg-vial.png",
    "nad-plus-500mg": "/products/nad-500mg-vial.png",
    "glutathione-600mg": "/products/glutathione-600mg-vial.png",
};

export function getProductImagePath (slug: string): string | null
{
    return productImagePathBySlug[slug] ?? null;
}


