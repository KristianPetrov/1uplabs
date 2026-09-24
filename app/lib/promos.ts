import { formatUsdFromCents } from "@/app/lib/money";

export const PROMO_CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{1,31}$/;

export type PromoDiscountType = "none" | "percent" | "fixed";
export type PromoShippingMode = "none" | "free" | "fixed";
export type PromoLifecycle = "active" | "inactive" | "scheduled" | "expired" | "exhausted";

export type PromoDefinition = {
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
  customerRedemptionCount: number;
  firstOrderOnly: boolean;
  priorOrderCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
};

export type PromoDraft = {
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
  perCustomerLimit: number | null;
  firstOrderOnly: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
};

export type PromoCartLine = {
  slug: string;
  lineTotalCents: number;
};

export type PromoQuoteSuccess = {
  ok: true;
  code: string;
  name: string;
  description: string | null;
  summary: string;
  eligibleSubtotalCents: number;
  merchandiseDiscountCents: number;
  shippingDiscountCents: number;
  discountCents: number;
};

export type PromoQuote = PromoQuoteSuccess | { ok: false; error: string };

const MAX_MONEY_CENTS = 10_000_000;

export function normalizePromoCode (raw: string): string
{
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidPromoCode (raw: string): boolean
{
  return PROMO_CODE_PATTERN.test(normalizePromoCode(raw));
}

export function promoCodeFormatError (): string
{
  return "Use 2–32 letters, numbers, hyphens, or underscores.";
}

export function promoLifecycle (
  promo: Pick<PromoDefinition, "active" | "startsAt" | "endsAt" | "usageLimit" | "usedCount">,
  now: Date = new Date(),
): PromoLifecycle
{
  if (!promo.active) return "inactive";
  if (promo.startsAt && now.getTime() < promo.startsAt.getTime()) return "scheduled";
  if (promo.endsAt && now.getTime() > promo.endsAt.getTime()) return "expired";
  if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) return "exhausted";
  return "active";
}

export function describePromo (
  promo: Pick<
    PromoDefinition,
    "discountType" | "percentOff" | "amountOffCents" | "shippingMode" | "shippingAmountOffCents" | "productSlugs" | "maxDiscountCents"
  >,
): string
{
  const parts: string[] = [];
  const scoped = promo.productSlugs.length > 0;

  if (promo.discountType === "percent" && promo.percentOff)
  {
    let label = `${promo.percentOff}% off`;
    if (scoped) label += " select products";
    if (promo.maxDiscountCents != null)
    {
      label += ` (up to ${formatUsdFromCents(promo.maxDiscountCents)})`;
    }
    parts.push(label);
  }
  else if (promo.discountType === "fixed" && promo.amountOffCents)
  {
    let label = `${formatUsdFromCents(promo.amountOffCents)} off`;
    if (scoped) label += " select products";
    parts.push(label);
  }

  if (promo.shippingMode === "free")
  {
    parts.push("free shipping");
  }
  else if (promo.shippingMode === "fixed" && promo.shippingAmountOffCents)
  {
    parts.push(`${formatUsdFromCents(promo.shippingAmountOffCents)} off shipping`);
  }

  return parts.join(" + ") || "Discount";
}

function cartSubtotal (lines: PromoCartLine[]): number
{
  return lines.reduce((sum, line) => sum + Math.max(0, line.lineTotalCents), 0);
}

function eligibleSubtotal (lines: PromoCartLine[], productSlugs: string[]): number
{
  if (productSlugs.length === 0) return cartSubtotal(lines);
  const allowed = new Set(productSlugs);
  return lines.reduce((sum, line) =>
  {
    if (!allowed.has(line.slug)) return sum;
    return sum + Math.max(0, line.lineTotalCents);
  }, 0);
}

export function quotePromo (input: {
  promo: PromoDefinition;
  lines: PromoCartLine[];
  shippingCents: number;
  now?: Date;
  enforceCustomerRules: boolean;
}): PromoQuote
{
  const { promo, lines } = input;
  const now = input.now ?? new Date();
  const shippingCents = Math.max(0, Math.round(input.shippingCents));

  if (!promo.active)
  {
    return { ok: false, error: "That code isn't valid." };
  }

  if (promo.startsAt && now.getTime() < promo.startsAt.getTime())
  {
    return { ok: false, error: "That code isn't active yet." };
  }

  if (promo.endsAt && now.getTime() > promo.endsAt.getTime())
  {
    return { ok: false, error: "That code has expired." };
  }

  if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit)
  {
    return { ok: false, error: "That code has reached its usage limit." };
  }

  if (input.enforceCustomerRules)
  {
    if (promo.perCustomerLimit != null && promo.customerRedemptionCount >= promo.perCustomerLimit)
    {
      return { ok: false, error: "You've already used that code." };
    }

    if (promo.firstOrderOnly && promo.priorOrderCount > 0)
    {
      return { ok: false, error: "That code is for first orders only." };
    }
  }

  const subtotal = cartSubtotal(lines);
  if (promo.minSubtotalCents > 0 && subtotal < promo.minSubtotalCents)
  {
    return {
      ok: false,
      error: `This code requires a minimum subtotal of ${formatUsdFromCents(promo.minSubtotalCents)}.`,
    };
  }

  const eligible = eligibleSubtotal(lines, promo.productSlugs);
  if (promo.productSlugs.length > 0 && eligible <= 0)
  {
    return { ok: false, error: "This code doesn't apply to the items in your cart." };
  }

  let merchandiseDiscountCents = 0;
  if (promo.discountType === "percent")
  {
    const percent = promo.percentOff ?? 0;
    merchandiseDiscountCents = Math.round((eligible * percent) / 100);
  }
  else if (promo.discountType === "fixed")
  {
    merchandiseDiscountCents = Math.min(promo.amountOffCents ?? 0, eligible);
  }

  if (promo.maxDiscountCents != null)
  {
    merchandiseDiscountCents = Math.min(merchandiseDiscountCents, promo.maxDiscountCents);
  }

  merchandiseDiscountCents = Math.max(0, Math.min(merchandiseDiscountCents, eligible));

  let shippingDiscountCents = 0;
  if (promo.shippingMode === "free")
  {
    shippingDiscountCents = shippingCents;
  }
  else if (promo.shippingMode === "fixed")
  {
    shippingDiscountCents = Math.min(Math.max(0, promo.shippingAmountOffCents ?? 0), shippingCents);
  }

  const discountCents = merchandiseDiscountCents + shippingDiscountCents;
  if (discountCents <= 0)
  {
    return { ok: false, error: "This code doesn't reduce this order." };
  }

  return {
    ok: true,
    code: promo.code,
    name: promo.name,
    description: promo.description,
    summary: describePromo(promo),
    eligibleSubtotalCents: eligible,
    merchandiseDiscountCents,
    shippingDiscountCents,
    discountCents,
  };
}

export function orderTotalAfterPromo (
  subtotalCents: number,
  shippingCents: number,
  merchandiseDiscountCents: number,
  shippingDiscountCents: number,
): number
{
  return Math.max(
    0,
    subtotalCents + shippingCents - merchandiseDiscountCents - shippingDiscountCents,
  );
}

function invalidMoney (value: number | null, label: string): string | null
{
  if (value == null) return null;
  if (!Number.isInteger(value) || value < 1 || value > MAX_MONEY_CENTS)
  {
    return `${label} must be between $0.01 and $100,000.00.`;
  }
  return null;
}

export function promoDraftError (draft: PromoDraft): string | null
{
  if (!draft.name.trim()) return "Name is required.";
  if (draft.name.trim().length > 80) return "Name must be 80 characters or fewer.";
  if (draft.description && draft.description.trim().length > 240)
  {
    return "Description must be 240 characters or fewer.";
  }
  if (!isValidPromoCode(draft.code)) return promoCodeFormatError();

  if (draft.discountType === "percent")
  {
    if (draft.percentOff == null || !Number.isInteger(draft.percentOff) || draft.percentOff < 1 || draft.percentOff > 100)
    {
      return "Percent off must be a whole number from 1 to 100.";
    }
  }

  if (draft.discountType === "fixed")
  {
    const amountError = invalidMoney(draft.amountOffCents, "Amount off");
    if (draft.amountOffCents == null) return "Enter a dollar amount off.";
    if (amountError) return amountError;
  }

  if (draft.shippingMode === "fixed")
  {
    if (draft.shippingAmountOffCents == null) return "Enter a shipping discount amount.";
    const shippingError = invalidMoney(draft.shippingAmountOffCents, "Shipping discount");
    if (shippingError) return shippingError;
  }

  if (draft.discountType === "none" && draft.shippingMode === "none")
  {
    return "Add a product discount, a shipping discount, or both.";
  }

  if (!Number.isInteger(draft.minSubtotalCents) || draft.minSubtotalCents < 0 || draft.minSubtotalCents > MAX_MONEY_CENTS)
  {
    return "Minimum subtotal must be between $0.00 and $100,000.00.";
  }

  const capError = invalidMoney(draft.maxDiscountCents, "Maximum discount");
  if (capError) return capError;

  if (draft.usageLimit != null && (!Number.isInteger(draft.usageLimit) || draft.usageLimit < 1 || draft.usageLimit > 1_000_000))
  {
    return "Total usage limit must be a whole number from 1 to 1,000,000.";
  }

  if (
    draft.perCustomerLimit != null
    && (!Number.isInteger(draft.perCustomerLimit) || draft.perCustomerLimit < 1 || draft.perCustomerLimit > 1_000)
  )
  {
    return "Per-customer limit must be a whole number from 1 to 1,000.";
  }

  if (draft.startsAt && draft.endsAt && draft.endsAt.getTime() <= draft.startsAt.getTime())
  {
    return "End time must be after the start time.";
  }

  return null;
}
