"use client";

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import { products } from "@/app/lib/products";
import { usePricing } from "@/app/pricing/PricingProvider";

export type CartLine = {
    slug: string;
    qty: number;
};

type CartState = {
    lines: CartLine[];
};

type CartSnapshot = {
    lines: CartLine[];
    ready: boolean;
};

type CartContextValue = {
    lines: CartLine[];
    ready: boolean;
    add: (slug: string, qty?: number) => void;
    remove: (slug: string) => void;
    setQty: (slug: string, qty: number) => void;
    clear: () => void;
    totalItems: number;
    subtotalCents: number;
};

const CART_STORAGE_KEY = "1uplabs_cart_v1";
const EMPTY_LINES: CartLine[] = [];
const SERVER_SNAPSHOT: CartSnapshot = { lines: EMPTY_LINES, ready: false };
const STORAGE_UNAVAILABLE: CartSnapshot = { lines: EMPTY_LINES, ready: true };

const CartContext = createContext<CartContextValue | null>(null);

let cachedRaw: string | null = null;
let clientSnapshot: CartSnapshot = { lines: EMPTY_LINES, ready: true };
const listeners = new Set<() => void>();

function clampQty (qty: number): number
{
    if (!Number.isFinite(qty)) return 1;
    return Math.max(1, Math.min(99, Math.round(qty)));
}

function parseStoredLine (value: unknown): CartLine | null
{
    if (!value || typeof value !== "object") return null;
    const record = value as { slug?: unknown; qty?: unknown };
    const slug = typeof record.slug === "string" ? record.slug : "";
    if (!slug) return null;
    return { slug, qty: clampQty(Number(record.qty ?? 1)) };
}

function readStoredCart (): CartState
{
    if (typeof window === "undefined") return { lines: [] };
    try
    {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return { lines: [] };
        const parsed = JSON.parse(raw) as Partial<CartState>;
        const lines = Array.isArray(parsed.lines) ? parsed.lines : [];
        return {
            lines: lines
                .map(parseStoredLine)
                .filter((line): line is CartLine => line !== null),
        };
    }
    catch
    {
        return { lines: [] };
    }
}

function writeStoredCart (state: CartState): void
{
    if (typeof window === "undefined") return;
    try
    {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    }
    catch
    {
        // ignore
    }
}

function emitCart (): void
{
    for (const listener of listeners) listener();
}

function subscribeCart (listener: () => void): () => void
{
    listeners.add(listener);
    return () =>
    {
        listeners.delete(listener);
    };
}

function getServerSnapshot (): CartSnapshot
{
    return SERVER_SNAPSHOT;
}

function getClientSnapshot (): CartSnapshot
{
    try
    {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY) ?? "";
        if (raw === cachedRaw) return clientSnapshot;
        cachedRaw = raw;
        clientSnapshot = { lines: readStoredCart().lines, ready: true };
        return clientSnapshot;
    }
    catch
    {
        cachedRaw = "";
        clientSnapshot = STORAGE_UNAVAILABLE;
        return clientSnapshot;
    }
}

function commitCart (lines: CartLine[]): void
{
    const next = { lines };
    writeStoredCart(next);
    cachedRaw = window.localStorage.getItem(CART_STORAGE_KEY) ?? JSON.stringify(next);
    clientSnapshot = { lines, ready: true };
    emitCart();
}

export function CartProvider ({ children }: { children: React.ReactNode }): React.JSX.Element
{
    const pricing = usePricing();
    const snapshot = useSyncExternalStore(subscribeCart, getClientSnapshot, getServerSnapshot);

    const add = useCallback((slug: string, qty = 1) =>
    {
        const lines = getClientSnapshot().lines;
        const nextQty = clampQty(qty);
        const existing = lines.find((l) => l.slug === slug);
        if (!existing)
        {
            commitCart([...lines, { slug, qty: nextQty }]);
            return;
        }
        commitCart(lines.map((l) =>
            l.slug === slug ? { ...l, qty: clampQty(l.qty + nextQty) } : l
        ));
    }, []);

    const remove = useCallback((slug: string) =>
    {
        commitCart(getClientSnapshot().lines.filter((l) => l.slug !== slug));
    }, []);

    const setQty = useCallback((slug: string, qty: number) =>
    {
        const next = clampQty(qty);
        commitCart(getClientSnapshot().lines.map((l) => (l.slug === slug ? { ...l, qty: next } : l)));
    }, []);

    const clear = useCallback(() =>
    {
        commitCart([]);
    }, []);

    const { totalItems, subtotalCents } = useMemo(() =>
    {
        const productBySlug = new Map(products.map((p) => [p.slug, p]));
        let items = 0;
        let subtotal = 0;
        for (const line of snapshot.lines)
        {
            items += line.qty;
            const p = productBySlug.get(line.slug);
            if (p)
            {
                const priceCents = pricing.getPriceCents(line.slug, p.priceCents);
                subtotal += priceCents * line.qty;
            }
        }
        return { totalItems: items, subtotalCents: subtotal };
    }, [pricing, snapshot.lines]);

    const value: CartContextValue = useMemo(() => ({
        lines: snapshot.lines,
        ready: snapshot.ready,
        add,
        remove,
        setQty,
        clear,
        totalItems,
        subtotalCents,
    }), [add, clear, remove, setQty, snapshot.lines, snapshot.ready, subtotalCents, totalItems]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart (): CartContextValue
{
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
