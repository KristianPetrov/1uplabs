"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  label: string;
  value: string;
};

export default function CopyField ({ label, value }: Props)
{
  const [copied, setCopied] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-500/0 blur-2xl transition duration-700 group-hover:bg-sky-500/20" />
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
        {label}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <code className="min-w-0 truncate rounded-xl bg-zinc-950/50 px-3 py-2 text-sm text-white/90">
          {value}
        </code>
        <button
          type="button"
          onClick={async () =>
          {
            try
            {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 900);
            }
            catch
            {
              // ignore
            }
          }}
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-500/30 hover:bg-white/8"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </motion.div>
  );
}


