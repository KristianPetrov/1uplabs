"use client";

import { useState, useTransition } from "react";
import { CopyButton } from "@ap/shared-ui/copy-button";

import type { ManualPaymentMethod } from "@/app/lib/paymentMethods";
import { sendPaymentInstructionsForOrder } from "@/app/orders/[id]/actions";

type Props = {
  orderId: string;
  memo: string;
  methods: ManualPaymentMethod[];
};

function openExternalUrl (url: string): void
{
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function PaymentMethodsPanel ({ orderId, memo, methods }: Props)
{
  const [pending, startTransition] = useTransition();
  const [emailState, setEmailState] = useState<string | null>(null);

  function handlePayClick (method: ManualPaymentMethod): void
  {
    if (method.paymentUrl) openExternalUrl(method.paymentUrl);

    if (method.key === "cashapp" || method.key === "venmo")
    {
      setEmailState(null);
      startTransition(async () =>
      {
        try
        {
          const { result } = await sendPaymentInstructionsForOrder(orderId);
          if (result === "sent") setEmailState("Payment instructions emailed.");
          else if (result === "already-sent") setEmailState("Payment instructions were already emailed.");
          else if (result === "skipped-no-provider") setEmailState("Email sending is not configured yet.");
          else setEmailState("Could not send payment instructions right now.");
        }
        catch
        {
          setEmailState("Could not send payment instructions right now.");
        }
      });
    }
  }

  return (
    <div className="mt-6">
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
        Manual payment options
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        {methods.map((method) => (
          <div key={method.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">{method.title}</div>
                <div className="mt-1 text-xs text-white/60">{method.note}</div>
              </div>
              {(method.key === "cashapp" || method.key === "venmo") && method.paymentUrl ? (
                <button
                  type="button"
                  onClick={() => handlePayClick(method)}
                  className="shrink-0 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100 transition hover:bg-emerald-500/20"
                >
                  Open {method.title}
                </button>
              ) : (
                <CopyButton
                  text={method.destinationValue}
                  label={method.key === "zelle" ? "Copy recipient" : "Copy address"}
                  className="shrink-0 border-white/10 bg-white/5 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.2em] text-white transition hover:border-emerald-500/35 hover:bg-white/10"
                />
              )}
            </div>

            <div className="mt-3 rounded-xl bg-zinc-950/45 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">{method.destinationLabel}</div>
              <div className="mt-1 text-sm text-white">{method.destinationValue}</div>
            </div>

            {method.key === "bitcoin" && method.bitcoinAmountBtc ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="text-xs text-white/70">
                  Send exactly: <span className="font-semibold text-white">{method.bitcoinAmountBtc} BTC</span>
                  {method.bitcoinRateUsd ? (
                    <span className="text-white/55">{` (rate: $${method.bitcoinRateUsd}/BTC)`}</span>
                  ) : null}
                </div>
                <CopyButton
                  text={method.bitcoinAmountBtc}
                  label="Copy BTC amount"
                  className="shrink-0 border-white/10 bg-white/5 px-3 py-1 text-[0.6rem] font-semibold tracking-[0.2em] text-white transition hover:border-emerald-500/35 hover:bg-white/10"
                />
              </div>
            ) : null}

            {method.key === "zelle" ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="text-xs text-white/70">
                  Add Order ID in memo: <span className="font-semibold text-white">{orderId}</span>
                </div>
                <CopyButton
                  text={orderId}
                  label="Copy Order ID"
                  className="shrink-0 border-white/10 bg-white/5 px-3 py-1 text-[0.6rem] font-semibold tracking-[0.2em] text-white transition hover:border-emerald-500/35 hover:bg-white/10"
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-xs text-white/60">
        <div>
          Venmo memo is pre-filled as: <span className="font-semibold text-white">{memo}</span>
        </div>
        {pending ? <div className="text-white/70">Sending email…</div> : null}
      </div>

      {emailState ? (
        <div className="mt-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
          {emailState}
        </div>
      ) : null}
    </div>
  );
}
