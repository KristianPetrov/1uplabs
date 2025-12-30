"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type PricingRow = {
  slug: string;
  priceCents: number | null;
  inventory: number | null;
};

type PricingContextValue = {
  revision: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getPriceCents: (slug: string, fallbackCents: number) => number;
  getInventory: (slug: string, fallbackInventory?: number) => number | undefined;
};

const PricingContext = createContext<PricingContextValue | null>(null);

async function fetchPricing (): Promise<PricingRow[]>
{
  const res = await fetch("/api/pricing", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load pricing (${res.status})`);
  const data = (await res.json()) as { rows?: unknown };
  const rows = Array.isArray((data as any).rows) ? ((data as any).rows as PricingRow[]) : [];
  return rows
    .filter((r) => typeof r?.slug === "string")
    .map((r) =>
    {
      const priceCents = (r as any).priceCents;
      const inventory = (r as any).inventory;

      const nextPrice =
        priceCents == null ? null : (Number.isFinite(Number(priceCents)) ? Number(priceCents) : null);
      const nextInv =
        inventory == null ? null : (Number.isFinite(Number(inventory)) ? Number(inventory) : null);

      return {
        slug: (r as any).slug,
        priceCents: nextPrice,
        inventory: nextInv,
      } as PricingRow;
    });
}

export function PricingProvider ({ children }: { children: React.ReactNode }): React.JSX.Element
{
  const [bySlug, setBySlug] = useState<Record<string, PricingRow>>({});
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () =>
  {
    try
    {
      setError(null);
      const rows = await fetchPricing();
      const next: Record<string, PricingRow> = {};
      for (const row of rows) next[row.slug] = row;
      setBySlug(next);
      setRevision((r) => r + 1);
    }
    catch (e)
    {
      setError(e instanceof Error ? e.message : "Failed to load pricing");
    }
    finally
    {
      setLoading(false);
    }
  }, []);

  useEffect(() =>
  {
    void refresh();

    // Keep prices fresh if you change them in the admin dashboard.
    const id = window.setInterval(() => void refresh(), 45_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const getPriceCents = useCallback((slug: string, fallbackCents: number): number =>
  {
    const row = bySlug[slug];
    if (row?.priceCents != null && Number.isFinite(row.priceCents)) return row.priceCents;
    return fallbackCents;
  }, [bySlug]);

  const getInventory = useCallback((slug: string, fallbackInventory?: number): number | undefined =>
  {
    const row = bySlug[slug];
    if (row?.inventory != null && Number.isFinite(row.inventory)) return row.inventory;
    return fallbackInventory;
  }, [bySlug]);

  const value: PricingContextValue = useMemo(() => ({
    revision,
    loading,
    error,
    refresh,
    getPriceCents,
    getInventory,
  }), [error, getInventory, getPriceCents, loading, refresh, revision]);

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing (): PricingContextValue
{
  const ctx = useContext(PricingContext);
  if (!ctx) throw new Error("usePricing must be used within PricingProvider");
  return ctx;
}


