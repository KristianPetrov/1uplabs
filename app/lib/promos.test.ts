import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  describePromo,
  isValidPromoCode,
  normalizePromoCode,
  orderTotalAfterPromo,
  promoDraftError,
  promoLifecycle,
  quotePromo,
  type PromoDefinition,
  type PromoDraft,
} from "./promos";

const NOW = new Date("2026-09-24T18:00:00.000Z");

function promo (overrides: Partial<PromoDefinition> = {}): PromoDefinition
{
  return {
    code: "SAVE10",
    name: "Save 10",
    description: null,
    active: true,
    discountType: "percent",
    percentOff: 10,
    amountOffCents: null,
    shippingMode: "none",
    shippingAmountOffCents: null,
    productSlugs: [],
    minSubtotalCents: 0,
    maxDiscountCents: null,
    usageLimit: null,
    usedCount: 0,
    perCustomerLimit: null,
    customerRedemptionCount: 0,
    firstOrderOnly: false,
    priorOrderCount: 0,
    startsAt: null,
    endsAt: null,
    ...overrides,
  };
}

function draft (overrides: Partial<PromoDraft> = {}): PromoDraft
{
  return {
    code: "WELCOME",
    name: "Welcome",
    description: null,
    active: true,
    discountType: "percent",
    percentOff: 15,
    amountOffCents: null,
    shippingMode: "none",
    shippingAmountOffCents: null,
    productSlugs: [],
    minSubtotalCents: 0,
    maxDiscountCents: null,
    usageLimit: null,
    perCustomerLimit: null,
    firstOrderOnly: false,
    startsAt: null,
    endsAt: null,
    ...overrides,
  };
}

describe("promo codes", () =>
{
  it("normalizes codes", () =>
  {
    assert.equal(normalizePromoCode("  save-10 "), "SAVE-10");
    assert.equal(isValidPromoCode("ab"), true);
    assert.equal(isValidPromoCode("a"), false);
    assert.equal(isValidPromoCode("bad code!"), false);
  });

  it("applies a percent discount with rounding and a cap", () =>
  {
    const open = quotePromo({
      promo: promo({ percentOff: 10 }),
      lines: [{ slug: "a", lineTotalCents: 1999 }],
      shippingCents: 1000,
      now: NOW,
      enforceCustomerRules: true,
    });
    assert.equal(open.ok, true);
    if (!open.ok) return;
    assert.equal(open.merchandiseDiscountCents, 200);
    assert.equal(orderTotalAfterPromo(1999, 1000, open.merchandiseDiscountCents, open.shippingDiscountCents), 2799);

    const capped = quotePromo({
      promo: promo({ percentOff: 50, maxDiscountCents: 500 }),
      lines: [{ slug: "a", lineTotalCents: 10000 }],
      shippingCents: 0,
      now: NOW,
      enforceCustomerRules: false,
    });
    assert.equal(capped.ok, true);
    if (!capped.ok) return;
    assert.equal(capped.merchandiseDiscountCents, 500);
    assert.match(capped.summary, /50% off \(up to \$5\.00\)/);
  });

  it("caps a fixed discount at the eligible subtotal and selected products", () =>
  {
    const quote = quotePromo({
      promo: promo({
        discountType: "fixed",
        percentOff: null,
        amountOffCents: 5000,
        productSlugs: ["peptide"],
      }),
      lines: [
        { slug: "peptide", lineTotalCents: 3000 },
        { slug: "water", lineTotalCents: 800 },
      ],
      shippingCents: 1000,
      now: NOW,
      enforceCustomerRules: false,
    });
    assert.equal(quote.ok, true);
    if (!quote.ok) return;
    assert.equal(quote.eligibleSubtotalCents, 3000);
    assert.equal(quote.merchandiseDiscountCents, 3000);
    assert.match(quote.summary, /select products/);
  });

  it("combines free shipping with a product discount and rejects empty savings", () =>
  {
    const combined = quotePromo({
      promo: promo({ percentOff: 20, shippingMode: "free" }),
      lines: [{ slug: "a", lineTotalCents: 5000 }],
      shippingCents: 1000,
      now: NOW,
      enforceCustomerRules: false,
    });
    assert.equal(combined.ok, true);
    if (!combined.ok) return;
    assert.equal(combined.merchandiseDiscountCents, 1000);
    assert.equal(combined.shippingDiscountCents, 1000);
    assert.equal(orderTotalAfterPromo(5000, 1000, 1000, 1000), 4000);
    assert.equal(describePromo(promo({ percentOff: 20, shippingMode: "free" })), "20% off + free shipping");

    const nothing = quotePromo({
      promo: promo({
        discountType: "none",
        percentOff: null,
        shippingMode: "fixed",
        shippingAmountOffCents: 500,
      }),
      lines: [{ slug: "a", lineTotalCents: 5000 }],
      shippingCents: 0,
      now: NOW,
      enforceCustomerRules: false,
    });
    assert.deepEqual(nothing, { ok: false, error: "This code doesn't reduce this order." });
  });

  it("enforces schedule, usage, minimum, and customer rules", () =>
  {
    const lines = [{ slug: "a", lineTotalCents: 2000 }];
    const base = { lines, shippingCents: 1000, now: NOW, enforceCustomerRules: true };

    const message = (overrides: Partial<PromoDefinition>): string =>
    {
      const result = quotePromo({ ...base, promo: promo(overrides) });
      assert.equal(result.ok, false);
      return result.ok ? "" : result.error;
    };

    assert.match(message({ active: false }), /isn't valid/);
    assert.match(message({ startsAt: new Date("2026-09-25T00:00:00.000Z") }), /isn't active yet/);
    assert.match(message({ endsAt: new Date("2026-09-24T17:00:00.000Z") }), /expired/);
    assert.match(message({ usageLimit: 1, usedCount: 1 }), /usage limit/);
    assert.match(message({ minSubtotalCents: 5000 }), /minimum subtotal/);
    assert.match(message({ perCustomerLimit: 1, customerRedemptionCount: 1 }), /already used/);
    assert.match(message({ firstOrderOnly: true, priorOrderCount: 2 }), /first orders/);
    assert.match(message({ productSlugs: ["other"] }), /doesn't apply/);
  });

  it("describes lifecycle and rejects invalid drafts", () =>
  {
    assert.equal(promoLifecycle(promo(), NOW), "active");
    assert.equal(promoLifecycle(promo({ active: false }), NOW), "inactive");
    assert.equal(promoLifecycle(promo({ startsAt: new Date("2026-10-01T00:00:00.000Z") }), NOW), "scheduled");
    assert.equal(promoLifecycle(promo({ endsAt: new Date("2026-09-01T00:00:00.000Z") }), NOW), "expired");
    assert.equal(promoLifecycle(promo({ usageLimit: 2, usedCount: 2 }), NOW), "exhausted");

    assert.equal(promoDraftError(draft()), null);
    assert.match(promoDraftError(draft({ discountType: "none", percentOff: null })) ?? "", /product discount/);
    assert.match(promoDraftError(draft({ code: "x" })) ?? "", /2–32/);
    assert.match(
      promoDraftError(draft({
        startsAt: new Date("2026-09-24T18:00:00.000Z"),
        endsAt: new Date("2026-09-24T18:00:00.000Z"),
      })) ?? "",
      /End time/,
    );
  });

  it("lets a full discount bring the order total to zero", () =>
  {
    const quote = quotePromo({
      promo: promo({ percentOff: 100, shippingMode: "free" }),
      lines: [{ slug: "a", lineTotalCents: 12900 }],
      shippingCents: 1000,
      now: NOW,
      enforceCustomerRules: false,
    });
    assert.equal(quote.ok, true);
    if (!quote.ok) return;
    assert.equal(orderTotalAfterPromo(12900, 1000, quote.merchandiseDiscountCents, quote.shippingDiscountCents), 0);
  });
});
