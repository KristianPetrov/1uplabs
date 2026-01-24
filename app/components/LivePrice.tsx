"use client";

import { formatUsdFromCents } from "@/app/lib/money";
import { usePricing } from "@/app/pricing/PricingProvider";

type Props = {
  slug: string;
  fallbackCents: number;
  className?: string;
};

export default function LivePrice ({ slug, fallbackCents, className }: Props)
{
  const pricing = usePricing();
  const cents = pricing.getPriceCents(slug, fallbackCents);
  return <span className={className}>{formatUsdFromCents(cents)}</span>;
}







