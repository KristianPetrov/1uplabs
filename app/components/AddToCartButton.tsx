"use client";

import { useState } from "react";

import { useCart } from "@/app/cart/CartProvider";

type Props = {
    slug: string;
    className?: string;
    qty?: number;
};

export default function AddToCartButton ({ slug, className, qty = 1 }: Props)
{
    const cart = useCart();
    const [added, setAdded] = useState(false);

    return (
        <button
            type="button"
            onClick={() =>
            {
                cart.add(slug, qty);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 900);
            }}
            className={className ?? "inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"}
        >
            {added ? "Added" : "Add to cart"}
        </button>
    );
}


