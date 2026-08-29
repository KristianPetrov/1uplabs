"use client";

import { useState } from "react";
import { CopyButton } from "@ap/shared-ui/copy-button";

import type { ManualPaymentMethod, ManualPaymentMethodKey } from "@/app/lib/paymentMethods";

type Props = {
  memo: string;
  methods: ManualPaymentMethod[];
  amountLabel: string;
};

function openExternalUrl (url: string): void
{
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function PaymentMethodsPanel ({ memo, methods, amountLabel }: Props)
{
  const [selectedKey, setSelectedKey] = useState<ManualPaymentMethodKey>(methods[0]?.key ?? "cashapp");
  const method = methods.find((item) => item.key === selectedKey) ?? methods[0];

  if (!method)
  {
    return (
      <div className="opaque-panel mt-6 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/70">
        Payment methods are unavailable right now. Please contact support.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="text-sm font-semibold text-white">Choose how to pay</div>
      <p className="mt-1 text-sm leading-6 text-white/65">
        Pick one method and send exactly {amountLabel}. We ship after the payment arrives.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {methods.map((item) =>
        {
          const selected = item.key === method.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedKey(item.key)}
              aria-pressed={selected}
              className={
                selected
                  ? "rounded-2xl border border-emerald-400/40 bg-emerald-500 px-3 py-3 text-sm font-semibold text-zinc-950"
                  : "opaque-field rounded-2xl border border-white/12 px-3 py-3 text-sm font-semibold text-white hover:border-white/25"
              }
            >
              {item.title}
            </button>
          );
        })}
      </div>

      <div className="opaque-field mt-4 rounded-2xl border border-white/12 p-5">
        {method.paymentUrl ? (
          <>
            <button
              type="button"
              onClick={() => openExternalUrl(method.paymentUrl!)}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400"
            >
              Pay {amountLabel} with {method.title}
            </button>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Opens {method.title} with the amount already filled. Send to{" "}
              <span className="font-semibold text-white">{method.destinationValue}</span>.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm leading-6 text-white/70">
              Send exactly{" "}
              <span className="font-semibold text-white">
                {method.bitcoinAmountBtc ? `${method.bitcoinAmountBtc} BTC` : amountLabel}
              </span>{" "}
              to the address below.
            </p>
            {method.bitcoinAmountBtc ? (
              <div className="opaque-panel mt-3 flex items-center justify-between gap-3 rounded-xl px-3 py-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                    BTC amount
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">{method.bitcoinAmountBtc} BTC</div>
                </div>
                <CopyButton
                  text={method.bitcoinAmountBtc}
                  label="Copy amount"
                  className="opaque-field shrink-0 border-white/10 px-3 py-2 text-[0.65rem] font-semibold tracking-[0.16em] text-white hover:border-emerald-500/35"
                />
              </div>
            ) : (
              <p className="mt-3 text-sm text-amber-100">
                BTC quote is unavailable. Please contact support before sending.
              </p>
            )}
          </>
        )}

        <div className="opaque-panel mt-3 flex items-center justify-between gap-3 rounded-xl px-3 py-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
              {method.destinationLabel}
            </div>
            <div className="mt-1 truncate text-sm font-semibold text-white">{method.destinationValue}</div>
          </div>
          <CopyButton
            text={method.destinationValue}
            label="Copy"
            className="opaque-field shrink-0 border-white/10 px-3 py-2 text-[0.65rem] font-semibold tracking-[0.16em] text-white hover:border-emerald-500/35"
          />
        </div>

        {method.key === "bitcoin" ? (
          <p className="mt-3 text-xs leading-5 text-white/55">
            Send the exact amount so we can match your payment.
          </p>
        ) : (
          <p className="mt-3 text-xs leading-5 text-white/55">
            Add this memo so we can match your payment:{" "}
            <span className="font-semibold text-white">{memo}</span>
          </p>
        )}
      </div>
    </div>
  );
}
