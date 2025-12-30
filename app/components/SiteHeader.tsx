import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import AuthNav from "@/app/components/AuthNav";

type Props = {
  subtitle?: string;
  actions?: ReactNode;
  showLabPill?: boolean;
};

export default function SiteHeader ({ subtitle = "Research peptides", actions, showLabPill = true }: Props)
{
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/70 backdrop-blur neon-header">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-lg ring-1 ring-white/10 neon-edge">
            <Image
              src="/1uplabs-mushroom-molecule.png"
              alt="1UpLabs mushroom peptide logo"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-white">
              1UpLabs
            </div>
            <div className="text-xs text-white/60">{subtitle}</div>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {showLabPill ? (
            <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 sm:inline neon-edge">
              Laboratory research only
            </span>
          ) : null}

          <AuthNav />

          {actions}
        </div>
      </div>
    </header>
  );
}


