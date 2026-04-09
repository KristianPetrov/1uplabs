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
        slug: "retatrutide-20mg",
        name: "Retatrutide",
        amount: "20mg",
        moleculeKey: "Retatrutide",
        priceCents: 10000,
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
        slug: "retatrutide-30mg",
        name: "Retatrutide",
        amount: "30mg",
        moleculeKey: "Retatrutide",
        priceCents: 13000,
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
        slug: "tirzepatide-15mg",
        name: "Tirzepatide",
        amount: "15mg",
        moleculeKey: "Tirzepatide",
        priceCents: 7000,
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
        name: "MOTS-C",
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
        slug: "mots-c-40mg",
        name: "MOTS-C",
        amount: "40mg",
        moleculeKey: "MOTS-C",
        priceCents: 9800,
        research: {
            summary: "Mitochondrial-derived peptide models + bioanalytical workflows",
            paragraphs: [
                "MOTS-C is used in laboratory contexts for peptide handling and bioanalytical workflows, including controlled in-vitro model systems and method development.",
            ],
            bullets: [
                "Controlled in-vitro assay setups in metabolic signaling model systems.",
                "Detection/quantification method development (e.g., LC/MS).",
                "Stability/handling studies for storage and preparation conditions.",
            ],
        },
    },
    {
        slug: "ghk-cu-50mg",
        name: "GHK-Cu",
        amount: "50mg",
        moleculeKey: "GHK-Cu",
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
        slug: "kpv-10mg",
        name: "KPV",
        amount: "10mg",
        moleculeKey: "KPV",
        priceCents: 3500,
        research: {
            summary: "Short-peptide assay controls + analytical verification",
            paragraphs: [
                "KPV is commonly used in laboratory peptide workflows for analytical verification, handling studies, and controlled in-vitro assay setup.",
            ],
            bullets: [
                "Identity/purity confirmation and calibration in peptide-focused workflows.",
                "Stability and solubility checks across common preparation conditions.",
                "Use as a reference material in controlled in-vitro assay systems.",
            ],
        },
    },
    {
        slug: "glow-70mg",
        name: "GLOW",
        amount: "70mg",
        moleculeKey: "GLOW",
        priceCents: 7000,
        research: {
            summary: "Multi-peptide blend handling + analytical method development",
            paragraphs: [
                "GLOW is used in laboratory settings as a multi-component peptide blend for solution handling, identity verification, and controlled assay preparation workflows.",
            ],
            bullets: [
                "Blend verification and component-focused analytical method development.",
                "Stability testing under common storage and reconstitution conditions.",
                "Recovery and compatibility checks across labware and buffer systems.",
            ],
        },
    },
    {
        slug: "klow-80mg",
        name: "KLOW",
        amount: "80mg",
        moleculeKey: "KLOW",
        priceCents: 8500,
        research: {
            summary: "Peptide blend characterization + controlled workflow validation",
            paragraphs: [
                "KLOW is commonly used in laboratory workflows as a blended research material for analytical characterization and repeatable preparation studies.",
            ],
            bullets: [
                "Analytical verification of blended peptide content and consistency.",
                "Stability/handling studies for reconstitution and short-term storage.",
                "Method development for recovery, adsorption, and compatibility testing.",
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
        slug: "ipamorelin-10mg",
        name: "Ipamorelin",
        amount: "10mg",
        moleculeKey: "Ipamorelin",
        priceCents: 5200,
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
        name: "CJC-1295 (No DAC)",
        amount: "5mg",
        moleculeKey: "CJC-1295",
        priceCents: 6900,
        research: {
            summary: "Peptide assay controls + identity & stability profiling",
            paragraphs: [
                "CJC‑1295 (No DAC) is commonly used in laboratory assay contexts as a peptide reference and for analytical characterization and stability profiling.",
            ],
            bullets: [
                "Controlled assay setup and benchmarking in peptide workflows.",
                "Identity/purity confirmation (e.g., LC/MS) and method development.",
                "Stability testing across storage and solution conditions.",
            ],
        },
    },
    {
        slug: "cjc-1295-no-dac-10mg",
        name: "CJC-1295 (No DAC)",
        amount: "10mg",
        moleculeKey: "CJC-1295",
        priceCents: 5500,
        research: {
            summary: "Peptide assay controls + identity & stability profiling",
            paragraphs: [
                "CJC-1295 (No DAC) is commonly used in laboratory assay contexts as a peptide reference and for analytical characterization and stability profiling.",
            ],
            bullets: [
                "Controlled assay setup and benchmarking in peptide workflows.",
                "Identity/purity confirmation (e.g., LC/MS) and method development.",
                "Stability testing across storage and solution conditions.",
            ],
        },
    },
    {
        slug: "cjc-1295-ipa-5mg",
        name: "CJC-1295 (No DAC) + IPA",
        amount: "5mg + 5mg",
        moleculeKey: "CJC-1295 + IPA",
        priceCents: 5000,
        research: {
            summary: "Combination peptide assay workflows + comparative verification",
            paragraphs: [
                "CJC-1295 (No DAC) + IPA is used in laboratory workflows that evaluate multi-peptide preparation, identity confirmation, and controlled assay reproducibility.",
            ],
            bullets: [
                "Analytical verification of combined peptide content and handling behavior.",
                "Method development for preparation, recovery, and storage stability.",
                "Benchmarking in controlled assay systems that compare single-agent vs. combination workflows.",
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
        slug: "hgh-5mg",
        name: "HGH-frag",
        amount: "5mg",
        moleculeKey: "HGH",
        priceCents: 3000,
        research: {
            summary: "Peptide fragment characterization + controlled assay preparation",
            paragraphs: [
                "HGH-frag is commonly used as a peptide fragment reference in laboratory workflows focused on identity confirmation, handling, and reproducible assay setup.",
            ],
            bullets: [
                "Fragment identity/purity confirmation and analytical method development.",
                "Stability testing across common buffer and storage conditions.",
                "Recovery and adsorption studies in peptide preparation workflows.",
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
        slug: "ss-31-50mg",
        name: "SS-31",
        amount: "50mg",
        moleculeKey: "SS-31",
        priceCents: 4500,
        research: {
            summary: "Mitochondria-focused peptide workflows + analytical verification",
            paragraphs: [
                "SS-31 is used in laboratory peptide workflows for controlled in-vitro model studies, analytical verification, and preparation stability assessment.",
            ],
            bullets: [
                "Controlled assay setups in mitochondria-focused experimental systems.",
                "Identity confirmation and quantification method development.",
                "Stability and handling checks during storage and reconstitution.",
            ],
        },
    },
    {
        slug: "5-amino-1mq-50mg",
        name: "5-AMINO-1MQ",
        amount: "50mg",
        moleculeKey: "5-AMINO-1MQ",
        priceCents: 3500,
        research: {
            summary: "Small-molecule assay workflows + analytical calibration",
            paragraphs: [
                "5-AMINO-1MQ is commonly used as a laboratory reference material for analytical verification, calibration work, and controlled assay development.",
            ],
            bullets: [
                "Identity confirmation and quantitative method development.",
                "Assay calibration and benchmarking in controlled laboratory systems.",
                "Stability checks under common solvent, light, and temperature conditions.",
            ],
        },
    },
    {
        slug: "b-12-1mg",
        name: "B-12",
        amount: "1mg",
        moleculeKey: "B-12",
        priceCents: 2000,
        research: {
            summary: "Vitamin reference workflows + analytical verification",
            paragraphs: [
                "B-12 is commonly used in laboratory workflows as a reference material for identity confirmation, quantification, and controlled stability studies.",
            ],
            bullets: [
                "Calibration and method development in vitamin-focused analytical workflows.",
                "Identity and concentration verification under controlled conditions.",
                "Stability testing across storage, light, and solution-preparation variables.",
            ],
        },
    },
    {
        slug: "dsip-5mg",
        name: "DSIP",
        amount: "5mg",
        moleculeKey: "DSIP",
        priceCents: 2200,
        research: {
            summary: "Peptide handling studies + controlled assay benchmarking",
            paragraphs: [
                "DSIP is used in laboratory peptide workflows for analytical characterization, reproducible preparation studies, and controlled in-vitro assay benchmarking.",
            ],
            bullets: [
                "Identity/purity confirmation and peptide-focused method development.",
                "Stability and handling assessment across standard lab conditions.",
                "Use as a reference material in controlled in-vitro assay designs.",
            ],
        },
    },
    {
        slug: "oxytocin-2mg",
        name: "Oxytocin",
        amount: "2mg",
        moleculeKey: "Oxytocin",
        priceCents: 1000,
        research: {
            summary: "Peptide receptor assay workflows + analytical verification",
            paragraphs: [
                "Oxytocin is commonly used in laboratory receptor assay workflows and for peptide identity, handling, and stability characterization.",
            ],
            bullets: [
                "Receptor binding / signaling studies in controlled assay systems.",
                "Analytical confirmation of identity and concentration.",
                "Stability testing during storage, dilution, and preparation steps.",
            ],
        },
    },
    {
        slug: "snap-8-10mg",
        name: "SNAP-8",
        amount: "10mg",
        moleculeKey: "SNAP-8",
        priceCents: 3000,
        research: {
            summary: "Cosmetic-peptide lab workflows + formulation compatibility checks",
            paragraphs: [
                "SNAP-8 is used in laboratory settings for peptide-focused analytical workflows, preparation testing, and compatibility assessment in controlled formulations.",
            ],
            bullets: [
                "Identity verification and method development for peptide quantification.",
                "Solution compatibility and stability studies under formulation-like conditions.",
                "Recovery and adsorption testing across containers, tools, and buffers.",
            ],
        },
    },
    {
        slug: "bac-3ml",
        name: "BAC",
        amount: "3ml",
        moleculeKey: "BAC",
        priceCents: 300,
        research: {
            summary: "Laboratory diluent handling + sterility-support workflow checks",
            paragraphs: [
                "BAC is commonly used in laboratory preparation workflows as a diluent material for reconstitution practice, compatibility checks, and handling consistency.",
            ],
            bullets: [
                "Compatibility testing with common lab containers and transfer tools.",
                "Workflow validation for dilution, aliquoting, and short-term storage.",
                "Handling and preparation consistency checks under controlled conditions.",
            ],
        },
    },
    {
        slug: "bac-10ml",
        name: "BAC",
        amount: "10ml",
        moleculeKey: "BAC",
        priceCents: 800,
        research: {
            summary: "Laboratory diluent handling + sterility-support workflow checks",
            paragraphs: [
                "BAC is commonly used in laboratory preparation workflows as a diluent material for reconstitution practice, compatibility checks, and handling consistency.",
            ],
            bullets: [
                "Compatibility testing with common lab containers and transfer tools.",
                "Workflow validation for dilution, aliquoting, and short-term storage.",
                "Handling and preparation consistency checks under controlled conditions.",
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
    "ss-31-50mg": "/products/SS-31-50mg-vial.png",
    "tirzepatide-15mg": "/products/tirzepatide-15mg-vial.png",
    "tirzepatide-30mg": "/products/tirzepatide-30mg-vial.png",
    "retatrutide-10mg": "/products/retatrutide-10mg-vial.png",
    "retatrutide-20mg": "/products/retatrutide-20mg-vial.png",
    "retatrutide-30mg": "/products/retatrutide-30mg-vial.png",
    "bpc-157-10mg": "/products/bpc-157-10mg-vial.png",
    "tb-500-10mg": "/products/tb-500-10mg-vial.png",
    "mots-c-10mg": "/products/mots-c-10mg-vial.png",
    "ghk-cu-50mg": "/products/ghk-cu-50mg-vial.png",
    "ipamorelin-5mg": "/products/ipamorelin-5mg-vial.png",
    "cjc-1295-no-dac-5mg": "/products/cjc-1295-no-dac-5mg-vial.png",
    "cjc-1295-ipa-5mg": "/products/cjc-1295-ipa-5mg-vial.png",
    "tesamorelin-10mg": "/products/tesamorelin-10mg-vial.png",
    "epithalon-10mg": "/products/epithalon-10mg-vial.png",
    "melanotan-ii-10mg": "/products/melanotan-II-10mg-vial .png",
    "pt-141-10mg": "/products/pt-141-10mg-vial.png",
    "nad-plus-500mg": "/products/nad-500mg-vial.png",
    "glutathione-600mg": "/products/glutathione-600mg-vial.png",
    "hgh-5mg": "/products/hgh-5mg-vial.png",
    "kpv-10mg": "/products/kpv-10mg-vial.png",
    "snap-8-10mg": "/products/SNAP-8-10mg-vial.png",
    "5-amino-1mq-50mg": "/products/5-amino-1mq-50mg-vial.png",
    "glow-70mg": "/products/glow-70mg-vial.png",
    "klow-80mg": "/products/klow-80mg-vial.png",
    "b-12-1mg": "/products/B-12-1mg-vial.png",
    "dsip-5mg": "/products/dsip-5mg-vial.png",
    "oxytocin-2mg": "/products/oxytocin-2mg-vial.png",
    "bac-3ml": "/products/bac-3ml-vial.png",
    "bac-10ml": "/products/bac-10ml-vial.png",
};

export function getProductImagePath (slug: string): string | null
{
    return productImagePathBySlug[slug] ?? null;
}


