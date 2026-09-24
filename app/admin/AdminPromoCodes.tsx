"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deletePromoCode, savePromoCode, setPromoActive } from "@/app/admin/promoActions";
import { formatUsdFromCents } from "@/app/lib/money";
import {
  describePromo,
  promoDraftError,
  promoLifecycle,
  type PromoDiscountType,
  type PromoDraft,
  type PromoLifecycle,
  type PromoShippingMode,
} from "@/app/lib/promos";

export type AdminPromoCode = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  discountType: PromoDiscountType;
  percentOff: number | null;
  amountOffCents: number | null;
  shippingMode: PromoShippingMode;
  shippingAmountOffCents: number | null;
  productSlugs: string[];
  minSubtotalCents: number;
  maxDiscountCents: number | null;
  usageLimit: number | null;
  usedCount: number;
  perCustomerLimit: number | null;
  firstOrderOnly: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

type PromoProduct = {
  slug: string;
  name: string;
  amount: string;
};

type Draft = {
  id: string | null;
  code: string;
  name: string;
  description: string;
  active: boolean;
  discountType: PromoDiscountType;
  percentOff: string;
  amountOff: string;
  shippingMode: PromoShippingMode;
  shippingAmountOff: string;
  limitProducts: boolean;
  productSlugs: string[];
  minSubtotal: string;
  maxDiscount: string;
  usageLimit: string;
  perCustomerLimit: string;
  firstOrderOnly: boolean;
  startsAt: string;
  endsAt: string;
};

type Props = {
  codes: AdminPromoCode[];
  products: PromoProduct[];
};

const inputClassName =
  "h-10 w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-3 text-sm font-semibold text-white outline-none transition focus:border-emerald-500/35";

function emptyDraft (): Draft
{
  return {
    id: null,
    code: "",
    name: "",
    description: "",
    active: true,
    discountType: "percent",
    percentOff: "10",
    amountOff: "",
    shippingMode: "none",
    shippingAmountOff: "",
    limitProducts: false,
    productSlugs: [],
    minSubtotal: "",
    maxDiscount: "",
    usageLimit: "",
    perCustomerLimit: "",
    firstOrderOnly: false,
    startsAt: "",
    endsAt: "",
  };
}

function centsToInput (cents: number | null): string
{
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

function isoToDatetimeLocal (iso: string | null): string
{
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function datetimeLocalToIso (value: string): string | null
{
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function draftFromCode (code: AdminPromoCode): Draft
{
  return {
    id: code.id,
    code: code.code,
    name: code.name,
    description: code.description ?? "",
    active: code.active,
    discountType: code.discountType,
    percentOff: code.percentOff == null ? "" : String(code.percentOff),
    amountOff: centsToInput(code.amountOffCents),
    shippingMode: code.shippingMode,
    shippingAmountOff: centsToInput(code.shippingAmountOffCents),
    limitProducts: code.productSlugs.length > 0,
    productSlugs: code.productSlugs,
    minSubtotal: code.minSubtotalCents > 0 ? centsToInput(code.minSubtotalCents) : "",
    maxDiscount: centsToInput(code.maxDiscountCents),
    usageLimit: code.usageLimit == null ? "" : String(code.usageLimit),
    perCustomerLimit: code.perCustomerLimit == null ? "" : String(code.perCustomerLimit),
    firstOrderOnly: code.firstOrderOnly,
    startsAt: isoToDatetimeLocal(code.startsAt),
    endsAt: isoToDatetimeLocal(code.endsAt),
  };
}

function parseUsdToCents (raw: string): number | null
{
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const amount = Number.parseFloat(cleaned);
  if (!Number.isFinite(amount)) return null;
  return Math.max(0, Math.round(amount * 100));
}

function parseWholeNumber (raw: string): number | null
{
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return Number.parseInt(trimmed, 10);
}

function generatePromoCode (): string
{
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function buildDraft (draft: Draft): { ok: true; value: PromoDraft } | { ok: false; error: string }
{
  const percentOff = draft.discountType === "percent" ? parseWholeNumber(draft.percentOff) : null;
  if (draft.discountType === "percent" && percentOff == null)
  {
    return { ok: false, error: "Percent off must be a whole number from 1 to 100." };
  }

  if (draft.limitProducts && draft.productSlugs.length === 0)
  {
    return { ok: false, error: "Select at least one product, or turn off the product limit." };
  }

  const amountOffCents = draft.discountType === "fixed" ? parseUsdToCents(draft.amountOff) : null;
  if (draft.discountType === "fixed" && (!draft.amountOff.trim() || amountOffCents == null || amountOffCents < 1))
  {
    return { ok: false, error: "Enter a dollar amount off." };
  }

  const shippingAmountOffCents = draft.shippingMode === "fixed" ? parseUsdToCents(draft.shippingAmountOff) : null;
  if (draft.shippingMode === "fixed" && (!draft.shippingAmountOff.trim() || shippingAmountOffCents == null || shippingAmountOffCents < 1))
  {
    return { ok: false, error: "Enter a shipping discount amount." };
  }

  const minSubtotalCents = draft.minSubtotal.trim() ? parseUsdToCents(draft.minSubtotal) : 0;
  if (minSubtotalCents == null) return { ok: false, error: "Enter a valid minimum subtotal." };

  const maxDiscountCents = draft.maxDiscount.trim() ? parseUsdToCents(draft.maxDiscount) : null;
  if (draft.maxDiscount.trim() && (maxDiscountCents == null || maxDiscountCents < 1))
  {
    return { ok: false, error: "Enter a valid maximum discount." };
  }

  const usageLimit = draft.usageLimit.trim() ? parseWholeNumber(draft.usageLimit) : null;
  if (draft.usageLimit.trim() && usageLimit == null) return { ok: false, error: "Total usage limit must be a whole number." };

  const perCustomerLimit = draft.perCustomerLimit.trim() ? parseWholeNumber(draft.perCustomerLimit) : null;
  if (draft.perCustomerLimit.trim() && perCustomerLimit == null)
  {
    return { ok: false, error: "Per-customer limit must be a whole number." };
  }

  const startsAtIso = datetimeLocalToIso(draft.startsAt);
  const endsAtIso = datetimeLocalToIso(draft.endsAt);
  if (draft.startsAt.trim() && !startsAtIso) return { ok: false, error: "Enter a valid start time." };
  if (draft.endsAt.trim() && !endsAtIso) return { ok: false, error: "Enter a valid end time." };

  const value: PromoDraft = {
    code: draft.code,
    name: draft.name,
    description: draft.description.trim() ? draft.description.trim() : null,
    active: draft.active,
    discountType: draft.discountType,
    percentOff,
    amountOffCents,
    shippingMode: draft.shippingMode,
    shippingAmountOffCents,
    productSlugs: draft.limitProducts ? draft.productSlugs : [],
    minSubtotalCents,
    maxDiscountCents,
    usageLimit,
    perCustomerLimit,
    firstOrderOnly: draft.firstOrderOnly,
    startsAt: startsAtIso ? new Date(startsAtIso) : null,
    endsAt: endsAtIso ? new Date(endsAtIso) : null,
  };

  const draftError = promoDraftError(value);
  if (draftError) return { ok: false, error: draftError };
  return { ok: true, value };
}

function lifecycleLabel (status: PromoLifecycle): string
{
  switch (status)
  {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "scheduled":
      return "Scheduled";
    case "expired":
      return "Expired";
    case "exhausted":
      return "Used up";
    default:
      return status;
  }
}

function lifecycleClassName (status: PromoLifecycle): string
{
  switch (status)
  {
    case "active":
      return "bg-emerald-500/15 text-emerald-100";
    case "scheduled":
      return "bg-sky-500/15 text-sky-100";
    case "expired":
      return "bg-amber-500/15 text-amber-100";
    case "exhausted":
      return "bg-rose-500/15 text-rose-100";
    default:
      return "bg-white/10 text-white/70";
  }
}

function formatWhen (iso: string | null): string | null
{
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function AdminPromoCodes ({ codes, products }: Props)
{
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editor, setEditor] = useState<Draft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");

  const filtered = useMemo(() =>
  {
    const needle = query.trim().toLowerCase();
    if (!needle) return codes;
    return codes.filter((code) =>
      code.code.toLowerCase().includes(needle)
      || code.name.toLowerCase().includes(needle)
      || (code.description ?? "").toLowerCase().includes(needle));
  }, [codes, query]);

  const visibleProducts = useMemo(() =>
  {
    const needle = productQuery.trim().toLowerCase();
    return products.filter((product) =>
    {
      if (!needle) return true;
      return product.name.toLowerCase().includes(needle)
        || product.amount.toLowerCase().includes(needle)
        || product.slug.toLowerCase().includes(needle);
    });
  }, [productQuery, products]);

  const editingUsedCount = editor?.id
    ? (codes.find((code) => code.id === editor.id)?.usedCount ?? 0)
    : 0;

  const liveSummary = useMemo(() =>
  {
    if (!editor) return null;
    const built = buildDraft(editor);
    if (!built.ok) return null;
    return describePromo({
      ...built.value,
      productSlugs: built.value.productSlugs,
    });
  }, [editor]);

  function showToast (message: string)
  {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }

  function updateEditor (patch: Partial<Draft>)
  {
    setEditor((current) => current ? { ...current, ...patch } : current);
  }

  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 lg:mt-8">
      <div className="relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Checkout discounts
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Promo codes
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              Create codes for a percent or dollar amount off, free or discounted shipping, selected products, spending minimums, usage limits, and a schedule.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
            {
              setFormError(null);
              setProductQuery("");
              setEditor(emptyDraft());
            }}
            className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
          >
            Create promo code
          </button>
        </div>

        {toast ? (
          <div className="mt-4 text-sm font-semibold text-emerald-200">{toast}</div>
        ) : null}

        {editor ? (
          <form
            className="mt-6 rounded-3xl border border-white/10 bg-zinc-950/40 p-5"
            onSubmit={(event) =>
            {
              event.preventDefault();
              const built = buildDraft(editor);
              if (!built.ok)
              {
                setFormError(built.error);
                return;
              }
              setFormError(null);
              const payload = built.value;
              startTransition(async () =>
              {
                try
                {
                  await savePromoCode({
                    id: editor.id,
                    code: payload.code,
                    name: payload.name,
                    description: payload.description ?? "",
                    active: payload.active,
                    discountType: payload.discountType,
                    percentOff: payload.percentOff,
                    amountOffCents: payload.amountOffCents,
                    shippingMode: payload.shippingMode,
                    shippingAmountOffCents: payload.shippingAmountOffCents,
                    productSlugs: payload.productSlugs,
                    minSubtotalCents: payload.minSubtotalCents,
                    maxDiscountCents: payload.maxDiscountCents,
                    usageLimit: payload.usageLimit,
                    perCustomerLimit: payload.perCustomerLimit,
                    firstOrderOnly: payload.firstOrderOnly,
                    startsAt: payload.startsAt ? payload.startsAt.toISOString() : null,
                    endsAt: payload.endsAt ? payload.endsAt.toISOString() : null,
                  });
                  setEditor(null);
                  showToast(editor.id ? "Promo code updated" : "Promo code created");
                  router.refresh();
                }
                catch (error)
                {
                  setFormError(error instanceof Error ? error.message : "Couldn't save that promo code.");
                }
              });
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">
                {editor.id ? "Edit promo code" : "New promo code"}
              </h3>
              {liveSummary ? (
                <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  Customers see: {liveSummary}
                </div>
              ) : null}
            </div>

            {formError ? (
              <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {formError}
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white/60">Code</span>
                <div className="flex gap-2">
                  <input
                    value={editor.code}
                    onChange={(event) => updateEditor({ code: event.target.value.toUpperCase() })}
                    required
                    spellCheck={false}
                    autoComplete="off"
                    className={`${inputClassName} font-mono tracking-wide`}
                  />
                  <button
                    type="button"
                    onClick={() => updateEditor({ code: generatePromoCode() })}
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-white/10 px-4 text-sm font-semibold text-white transition hover:border-emerald-500/30"
                  >
                    Generate
                  </button>
                </div>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white/60">Internal name</span>
                <input
                  value={editor.name}
                  onChange={(event) => updateEditor({ name: event.target.value })}
                  required
                  className={inputClassName}
                />
              </label>
            </div>

            <label className="mt-4 flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">Customer note (optional)</span>
              <input
                value={editor.description}
                onChange={(event) => updateEditor({ description: event.target.value })}
                placeholder="Shown under the code after it's applied"
                className={inputClassName}
              />
            </label>

            <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-white">
              <input
                type="checkbox"
                checked={editor.active}
                onChange={(event) => updateEditor({ active: event.target.checked })}
                className="h-4 w-4 accent-emerald-500"
              />
              Active
            </label>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Product discount</div>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Type</span>
                  <select
                    value={editor.discountType}
                    onChange={(event) => updateEditor({ discountType: event.target.value as PromoDiscountType })}
                    className={inputClassName}
                  >
                    <option value="none">None</option>
                    <option value="percent">Percent off</option>
                    <option value="fixed">Fixed amount off</option>
                  </select>
                </label>
                {editor.discountType === "percent" ? (
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white/60">Percent</span>
                    <input
                      value={editor.percentOff}
                      onChange={(event) => updateEditor({ percentOff: event.target.value })}
                      inputMode="numeric"
                      className={inputClassName}
                    />
                  </label>
                ) : null}
                {editor.discountType === "fixed" ? (
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white/60">Amount (USD)</span>
                    <input
                      value={editor.amountOff}
                      onChange={(event) => updateEditor({ amountOff: event.target.value })}
                      inputMode="decimal"
                      className={inputClassName}
                    />
                  </label>
                ) : null}
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Max product discount (optional)</span>
                  <input
                    value={editor.maxDiscount}
                    onChange={(event) => updateEditor({ maxDiscount: event.target.value })}
                    inputMode="decimal"
                    placeholder="No cap"
                    className={inputClassName}
                  />
                </label>
              </div>
              <p className="mt-2 text-xs leading-5 text-white/50">
                The cap applies to the product discount only. A fixed amount stops at the eligible product total.
              </p>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Shipping discount</div>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Shipping</span>
                  <select
                    value={editor.shippingMode}
                    onChange={(event) => updateEditor({ shippingMode: event.target.value as PromoShippingMode })}
                    className={inputClassName}
                  >
                    <option value="none">No shipping discount</option>
                    <option value="free">Free shipping</option>
                    <option value="fixed">Fixed amount off shipping</option>
                  </select>
                </label>
                {editor.shippingMode === "fixed" ? (
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white/60">Amount off shipping (USD)</span>
                    <input
                      value={editor.shippingAmountOff}
                      onChange={(event) => updateEditor({ shippingAmountOff: event.target.value })}
                      inputMode="decimal"
                      className={inputClassName}
                    />
                  </label>
                ) : null}
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Products</div>
              <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-white">
                <input
                  type="checkbox"
                  checked={editor.limitProducts}
                  onChange={(event) => updateEditor({ limitProducts: event.target.checked })}
                  className="h-4 w-4 accent-emerald-500"
                />
                Limit the product discount to selected products
              </label>
              <p className="mt-2 text-xs leading-5 text-white/50">
                Leave this off to include every product. A limited code only discounts the selected items, and the cart must contain at least one of them.
              </p>
              {editor.limitProducts ? (
                <div className="mt-3">
                  <input
                    value={productQuery}
                    onChange={(event) => setProductQuery(event.target.value)}
                    placeholder="Search products"
                    className={inputClassName}
                  />
                  <div className="mt-3 max-h-52 space-y-2 overflow-y-auto rounded-2xl border border-white/10 p-3">
                    {visibleProducts.map((product) =>
                    {
                      const checked = editor.productSlugs.includes(product.slug);
                      return (
                        <label key={product.slug} className="flex items-center gap-2 text-sm text-white/85">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                            {
                              const next = event.target.checked
                                ? [...editor.productSlugs, product.slug]
                                : editor.productSlugs.filter((slug) => slug !== product.slug);
                              updateEditor({ productSlugs: next });
                            }}
                            className="h-4 w-4 accent-emerald-500"
                          />
                          <span>{product.name} <span className="text-white/50">{product.amount}</span></span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Requirements and limits</div>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Minimum subtotal (USD)</span>
                  <input
                    value={editor.minSubtotal}
                    onChange={(event) => updateEditor({ minSubtotal: event.target.value })}
                    inputMode="decimal"
                    placeholder="0.00"
                    className={inputClassName}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Total uses</span>
                  <input
                    value={editor.usageLimit}
                    onChange={(event) => updateEditor({ usageLimit: event.target.value })}
                    inputMode="numeric"
                    placeholder="Unlimited"
                    className={inputClassName}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Uses per email</span>
                  <input
                    value={editor.perCustomerLimit}
                    onChange={(event) => updateEditor({ perCustomerLimit: event.target.value })}
                    inputMode="numeric"
                    placeholder="Unlimited"
                    className={inputClassName}
                  />
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-white">
                  <input
                    type="checkbox"
                    checked={editor.firstOrderOnly}
                    onChange={(event) => updateEditor({ firstOrderOnly: event.target.checked })}
                    className="h-4 w-4 accent-emerald-500"
                  />
                  First order only
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Starts</span>
                  <input
                    type="datetime-local"
                    value={editor.startsAt}
                    onChange={(event) => updateEditor({ startsAt: event.target.value })}
                    className={inputClassName}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">Ends</span>
                  <input
                    type="datetime-local"
                    value={editor.endsAt}
                    onChange={(event) => updateEditor({ endsAt: event.target.value })}
                    className={inputClassName}
                  />
                </label>
              </div>
              <p className="mt-2 text-xs leading-5 text-white/50">
                The minimum uses the full cart subtotal, before shipping. Per-email limits and first-order checks use the checkout email. Canceled orders release the redemption and no longer count as a previous order.
              </p>
              {editor.id ? (
                <p className="mt-2 text-xs text-white/55">
                  Redeemed {editingUsedCount} {editingUsedCount === 1 ? "time" : "times"}.
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save promo code"}
              </button>
              <button
                type="button"
                onClick={() =>
                {
                  setEditor(null);
                  setFormError(null);
                }}
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-semibold text-white transition hover:border-white/25"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-6">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search codes"
            className={`${inputClassName} max-w-sm`}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {filtered.length ? filtered.map((code) =>
          {
            const status = promoLifecycle({
              active: code.active,
              startsAt: code.startsAt ? new Date(code.startsAt) : null,
              endsAt: code.endsAt ? new Date(code.endsAt) : null,
              usageLimit: code.usageLimit,
              usedCount: code.usedCount,
            });
            const summary = describePromo(code);
            const starts = formatWhen(code.startsAt);
            const ends = formatWhen(code.endsAt);
            return (
              <article key={code.id} className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-mono text-sm font-semibold tracking-wide text-white">{code.code}</div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${lifecycleClassName(status)}`}>
                        {lifecycleLabel(status)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-white/80">{code.name}</div>
                    <div className="mt-1 text-sm text-emerald-100/90">{summary}</div>
                    {code.description ? (
                      <div className="mt-1 text-xs text-white/55">{code.description}</div>
                    ) : null}
                    <div className="mt-2 text-xs leading-5 text-white/55">
                      {code.usedCount} used{code.usageLimit != null ? ` / ${code.usageLimit}` : ""}
                      {code.perCustomerLimit != null ? ` · ${code.perCustomerLimit} per email` : ""}
                      {code.firstOrderOnly ? " · first order" : ""}
                      {code.minSubtotalCents > 0 ? ` · min ${formatUsdFromCents(code.minSubtotalCents)}` : ""}
                      {code.productSlugs.length ? ` · ${code.productSlugs.length} product${code.productSlugs.length === 1 ? "" : "s"}` : " · all products"}
                    </div>
                    {starts || ends ? (
                      <div className="mt-1 text-xs text-white/45">
                        {starts ? `Starts ${starts}` : "Starts immediately"}
                        {" · "}
                        {ends ? `Ends ${ends}` : "No end date"}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                      {
                        setFormError(null);
                        setProductQuery("");
                        setEditor(draftFromCode(code));
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 px-3 text-xs font-semibold text-white transition hover:border-emerald-500/30"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                      {
                        const next = draftFromCode(code);
                        setFormError(null);
                        setProductQuery("");
                        setEditor({
                          ...next,
                          id: null,
                          code: generatePromoCode(),
                          name: `${code.name} copy`.slice(0, 80),
                        });
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 px-3 text-xs font-semibold text-white transition hover:border-emerald-500/30"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                      {
                        startTransition(async () =>
                        {
                          try
                          {
                            await setPromoActive({ id: code.id, active: !code.active });
                            setEditor((current) => current?.id === code.id ? { ...current, active: !code.active } : current);
                            showToast(code.active ? "Promo code deactivated" : "Promo code activated");
                            router.refresh();
                          }
                          catch (error)
                          {
                            setFormError(error instanceof Error ? error.message : "Couldn't update that promo code.");
                          }
                        });
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 px-3 text-xs font-semibold text-white transition hover:border-emerald-500/30 disabled:opacity-60"
                    >
                      {code.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      disabled={pending || code.usedCount > 0}
                      title={code.usedCount > 0 ? "Used codes stay on past orders. Deactivate the code instead." : "Delete promo code"}
                      onClick={() =>
                      {
                        if (!window.confirm(`Delete promo code ${code.code}?`)) return;
                        startTransition(async () =>
                        {
                          try
                          {
                            await deletePromoCode(code.id);
                            if (editor?.id === code.id) setEditor(null);
                            showToast("Promo code deleted");
                            router.refresh();
                          }
                          catch (error)
                          {
                            setFormError(error instanceof Error ? error.message : "Couldn't delete that promo code.");
                          }
                        });
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-rose-400/20 px-3 text-xs font-semibold text-rose-100 transition hover:border-rose-400/40 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          }) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              {codes.length ? "No codes match that search." : "No promo codes yet."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
