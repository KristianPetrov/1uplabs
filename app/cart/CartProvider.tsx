"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { products } from "@/app/lib/products";

export type CartLine = {
    slug: string;
    qty: number;
};

type CartState = {
    lines: CartLine[];
};

type CartContextValue = {
    lines: CartLine[];
    add: (slug: string, qty?: number) => void;
    remove: (slug: string) => void;
    setQty: (slug: string, qty: number) => void;
    clear: () => void;
    totalItems: number;
    subtotalCents: number;
};

const CART_STORAGE_KEY = "1uplabs_cart_v1";

const CartContext = createContext<CartContextValue | null>(null);

function clampQty (qty: number): number
{
    if (!Number.isFinite(qty)) return 1;
    return Math.max(1, Math.min(99, Math.round(qty)));
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
                .map((l: any) => ({ slug: String(l?.slug ?? ""), qty: clampQty(Number(l?.qty ?? 1)) }))
                .filter((l) => Boolean(l.slug)),
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

export function CartProvider ({ children }: { children: React.ReactNode }): React.JSX.Element
{
    const [state, setState] = useState<CartState>({ lines: [] });

    useEffect(() =>
    {
        setState(readStoredCart());
    }, []);

    useEffect(() =>
    {
        writeStoredCart(state);
    }, [state]);

    const add = useCallback((slug: string, qty = 1) =>
    {
        setState((prev) =>
        {
            const nextQty = clampQty(qty);
            const existing = prev.lines.find((l) => l.slug === slug);
            if (!existing) return { lines: [...prev.lines, { slug, qty: nextQty }] };
            return {
                lines: prev.lines.map((l) =>
                    l.slug === slug ? { ...l, qty: clampQty(l.qty + nextQty) } : l
                ),
            };
        });
    }, []);

    const remove = useCallback((slug: string) =>
    {
        setState((prev) => ({ lines: prev.lines.filter((l) => l.slug !== slug) }));
    }, []);

    const setQty = useCallback((slug: string, qty: number) =>
    {
        setState((prev) =>
        {
            const next = clampQty(qty);
            return { lines: prev.lines.map((l) => (l.slug === slug ? { ...l, qty: next } : l)) };
        });
    }, []);

    const clear = useCallback(() =>
    {
        setState({ lines: [] });
    }, []);

    const { totalItems, subtotalCents } = useMemo(() =>
    {
        const productBySlug = new Map(products.map((p) => [p.slug, p]));
        let items = 0;
        let subtotal = 0;
        for (const line of state.lines)
        {
            items += line.qty;
            const p = productBySlug.get(line.slug);
            if (p) subtotal += p.priceCents * line.qty;
        }
        return { totalItems: items, subtotalCents: subtotal };
    }, [state.lines]);

    const value: CartContextValue = useMemo(() => ({
        lines: state.lines,
        add,
        remove,
        setQty,
        clear,
        totalItems,
        subtotalCents,
    }), [add, clear, remove, setQty, state.lines, subtotalCents, totalItems]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart (): CartContextValue
{
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}


