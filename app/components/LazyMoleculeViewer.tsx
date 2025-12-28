"use client";

import { useEffect, useRef, useState } from "react";

import type { MoleculeDefinition } from "@/app/lib/molecules";
import MoleculeViewer from "@/app/components/MoleculeViewer";

type Props = {
    productName: string;
    molecules: MoleculeDefinition[];
    variant?: "card" | "hero";
    className?: string;
};

export default function LazyMoleculeViewer ({
    productName,
    molecules,
    variant = "hero",
    className = "",
}: Props)
{
    const rootRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() =>
    {
        if (shouldRender) return;
        const el = rootRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) =>
            {
                if (entries.some((e) => e.isIntersecting)) {
                    setShouldRender(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [shouldRender]);

    return (
        <div ref={rootRef} className={className}>
            {shouldRender ? (
                <MoleculeViewer
                    productName={productName}
                    molecules={molecules}
                    variant={variant}
                    className="h-full rounded-2xl"
                />
            ) : (
                <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                    Loading preview…
                </div>
            )}
        </div>
    );
}



