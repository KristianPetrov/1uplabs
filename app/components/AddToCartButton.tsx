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
            className={className ?? "inline-flex min-h-10 items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-center text-sm font-semibold leading-none tracking-normal text-zinc-950 whitespace-nowrap transition hover:bg-emerald-400"}
        >
            {added ? "Added" : "Add to cart"}
        </button>
    );
}


