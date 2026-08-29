"use client";

import { useEffect, useId, useRef, useState } from "react";

const STORAGE_KEY = "1uplabs.revamp-notice.v1";

export default function RevampNotice ()
{
    const titleId = useId();
    const descriptionId = useId();
    const enterRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(true);

    useEffect(() =>
    {
        try
        {
            if (sessionStorage.getItem(STORAGE_KEY) === "1")
            {
                setOpen(false);
                return;
            }
        }
        catch
        {
            // Private mode / blocked storage should still show the notice.
        }

        enterRef.current?.focus();
    }, []);

    useEffect(() =>
    {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () =>
        {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    function enterSite ()
    {
        try
        {
            sessionStorage.setItem(STORAGE_KEY, "1");
        }
        catch
        {
            // Ignore storage failures; the notice still dismisses for this view.
        }

        setOpen(false);
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
            <div className="relative flex min-h-full items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950/92 p-6 shadow-2xl shadow-black/50 neon-edge sm:p-8"
                >
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                        Notice
                    </div>
                    <h2
                        id={titleId}
                        className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
                    >
                        Site is currently under a revamp
                    </h2>
                    <p
                        id={descriptionId}
                        className="mt-4 text-sm leading-6 text-white/70 sm:text-base"
                    >
                        While the site is undergoing a revamp, some features may be unavailable
                        and products may not match. If you encounter any issues, please contact us.
                    </p>
                    <button
                        ref={enterRef}
                        type="button"
                        onClick={enterSite}
                        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400 neon-edge"
                    >
                        Enter site
                    </button>
                </div>
            </div>
        </div>
    );
}
