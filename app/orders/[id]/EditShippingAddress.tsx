"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { forgetPendingOrder, rememberPendingOrder } from "@/app/lib/pendingOrder";
import { updatePendingOrderShipping } from "@/app/orders/[id]/actions";

const fieldClassName =
  "opaque-field h-11 rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/50";

type ShippingFields = {
  phone: string;
  shippingName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
};

type Props = ShippingFields & {
  orderId: string;
};

export function PendingOrderBookmark ({ orderId, pending }: { orderId: string; pending: boolean })
{
  useEffect(() =>
  {
    if (pending) rememberPendingOrder(orderId);
    else forgetPendingOrder(orderId);
  }, [orderId, pending]);

  return null;
}

function fieldsFromProps (props: Props): ShippingFields
{
  return {
    phone: props.phone,
    shippingName: props.shippingName,
    shippingAddress1: props.shippingAddress1,
    shippingAddress2: props.shippingAddress2,
    shippingCity: props.shippingCity,
    shippingState: props.shippingState,
    shippingZip: props.shippingZip,
    shippingCountry: props.shippingCountry === "CA" ? "CA" : "US",
  };
}

export default function EditShippingAddress (props: Props)
{
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [override, setOverride] = useState<ShippingFields | null>(null);
  const [draft, setDraft] = useState<ShippingFields>(() => fieldsFromProps(props));

  const shown = override ?? {
    phone: props.phone,
    shippingName: props.shippingName,
    shippingAddress1: props.shippingAddress1,
    shippingAddress2: props.shippingAddress2,
    shippingCity: props.shippingCity,
    shippingState: props.shippingState,
    shippingZip: props.shippingZip,
    shippingCountry: props.shippingCountry,
  };

  function openEditor ()
  {
    setDraft(override ?? fieldsFromProps(props));
    setError(null);
    setSaved(false);
    setEditing(true);
  }

  function closeEditor ()
  {
    setEditing(false);
    setError(null);
  }

  const summaryLines = [
    shown.shippingName,
    shown.shippingAddress1,
    shown.shippingAddress2,
    `${shown.shippingCity}, ${shown.shippingState} ${shown.shippingZip}`,
    shown.shippingCountry,
    shown.phone,
  ].filter((line) => Boolean(line && line.trim()));

  return (
    <div id="shipping-address" className="opaque-field mt-6 scroll-mt-24 rounded-2xl border border-white/12 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">Shipping address</div>
          <p className="mt-1 text-xs leading-5 text-white/55">
            Edit it here. Your order, total, and payment details stay the same.
          </p>
        </div>
        {editing ? null : (
          <button
            type="button"
            onClick={openEditor}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Edit address
          </button>
        )}
      </div>

      {saved && !editing ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Address updated. This order is still waiting for payment.
        </div>
      ) : null}

      {editing ? (
        <form
          className="mt-4 grid grid-cols-1 gap-4"
          onSubmit={(event) =>
          {
            event.preventDefault();
            setError(null);
            const next = draft;
            startTransition(async () =>
            {
              try
              {
                const result = await updatePendingOrderShipping({
                  orderId: props.orderId,
                  ...next,
                });
                if (!result.ok)
                {
                  setError(result.error);
                  return;
                }
                setOverride(next);
                setSaved(true);
                setEditing(false);
                router.refresh();
              }
              catch (err)
              {
                setError(err instanceof Error ? err.message : "Couldn't update that address.");
              }
            });
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-semibold text-white/75">Full name</span>
              <input
                value={draft.shippingName}
                onChange={(event) => setDraft((current) => ({ ...current, shippingName: event.target.value }))}
                autoComplete="name"
                autoFocus
                required
                className={fieldClassName}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-semibold text-white/75">Phone (optional)</span>
              <input
                value={draft.phone}
                onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                type="tel"
                autoComplete="tel"
                className={fieldClassName}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/75">Address line 1</span>
            <input
              value={draft.shippingAddress1}
              onChange={(event) => setDraft((current) => ({ ...current, shippingAddress1: event.target.value }))}
              autoComplete="address-line1"
              required
              className={fieldClassName}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/75">Address line 2 (optional)</span>
            <input
              value={draft.shippingAddress2}
              onChange={(event) => setDraft((current) => ({ ...current, shippingAddress2: event.target.value }))}
              autoComplete="address-line2"
              className={fieldClassName}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/75">City</span>
              <input
                value={draft.shippingCity}
                onChange={(event) => setDraft((current) => ({ ...current, shippingCity: event.target.value }))}
                autoComplete="address-level2"
                required
                className={fieldClassName}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/75">State</span>
              <input
                value={draft.shippingState}
                onChange={(event) => setDraft((current) => ({ ...current, shippingState: event.target.value }))}
                autoComplete="address-level1"
                required
                className={fieldClassName}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/75">ZIP</span>
              <input
                value={draft.shippingZip}
                onChange={(event) => setDraft((current) => ({ ...current, shippingZip: event.target.value }))}
                autoComplete="postal-code"
                required
                className={fieldClassName}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/75">Country</span>
            <select
              value={draft.shippingCountry}
              onChange={(event) => setDraft((current) => ({ ...current, shippingCountry: event.target.value }))}
              autoComplete="country"
              className={fieldClassName}
            >
              <option value="US">US</option>
              <option value="CA">CA</option>
            </select>
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100" role="alert">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save address"}
            </button>
            <button
              type="button"
              onClick={closeEditor}
              disabled={pending}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <address className="mt-4 text-sm not-italic leading-6 text-white/80">
          {summaryLines.map((line, index) => (
            <span key={`${index}-${line}`} className="block">
              {line}
            </span>
          ))}
        </address>
      )}
    </div>
  );
}
