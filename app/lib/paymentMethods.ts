import { formatUsdFromCents } from "@/app/lib/money";

export type ManualPaymentMethodKey = "cashapp" | "venmo" | "zelle" | "bitcoin";

export type ManualPaymentMethod = {
  key: ManualPaymentMethodKey;
  title: string;
  destinationLabel: string;
  destinationValue: string;
  paymentUrl: string | null;
  note: string;
  bitcoinAmountBtc: string | null;
  bitcoinRateUsd: string | null;
};

function amountFromCents (cents: number): string
{
  const safe = Number.isFinite(cents) ? Math.max(0, cents) : 0;
  return (safe / 100).toFixed(2);
}

function normalizeCashAppTag (tag: string): string
{
  const trimmed = tag.trim().replace(/\s+/g, "");
  if (!trimmed) return "$1uplabs";
  return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
}

function normalizeVenmoHandleForPath (handle: string): string
{
  return handle.trim().replace(/^@+/, "");
}

export function orderIdToMemo (orderId: string): string
{
  return `1UpLabs ${orderId.slice(0, 8)}`;
}

async function fetchBitcoinPriceUsd (): Promise<number | null>
{
  try
  {
    const response = await fetch("https://api.coinbase.com/v2/prices/spot?currency=USD", {
      cache: "no-store",
    });
    if (!response.ok) return null;

    const payload = await response.json() as { data?: { amount?: string } };
    const amountRaw = payload.data?.amount;
    const parsed = Number.parseFloat(typeof amountRaw === "string" ? amountRaw : "");
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  }
  catch
  {
    return null;
  }
}

function formatBtcFromUsdCents (totalCents: number, btcPriceUsd: number): string
{
  const usdAmount = Math.max(0, totalCents) / 100;
  const btcAmount = usdAmount / btcPriceUsd;
  return btcAmount.toFixed(8);
}

function formatUsdRate (usd: number): string
{
  return usd.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function getManualPaymentMethods (orderId: string, totalCents: number): Promise<ManualPaymentMethod[]>
{
  const amount = amountFromCents(totalCents);
  const memo = orderIdToMemo(orderId);

  const cashAppTag = normalizeCashAppTag(
    process.env.NEXT_PUBLIC_CASHAPP_TAG ?? process.env.CASHAPP_TAG ?? "$1uplabs",
  );

  const venmoHandleRaw = (process.env.NEXT_PUBLIC_VENMO_HANDLE ?? process.env.VENMO_HANDLE ?? "@Shop_1-upLabs").trim();
  const venmoHandlePath = normalizeVenmoHandleForPath(venmoHandleRaw) || "Shop_1-upLabs";

  const zelleRecipient = (process.env.NEXT_PUBLIC_ZELLE_RECIPIENT ?? process.env.ZELLE_RECIPIENT ?? "you@example.com").trim();
  const btcAddress = (process.env.NEXT_PUBLIC_BTC_ADDRESS ?? process.env.BTC_ADDRESS ?? "bc1q8rtqf33xn8mjhcwuwrrcamcpvcyvg39u0qfn36").trim();
  const btcPriceUsd = await fetchBitcoinPriceUsd();
  const btcAmount = btcPriceUsd ? formatBtcFromUsdCents(totalCents, btcPriceUsd) : null;
  const btcRateLabel = btcPriceUsd ? formatUsdRate(btcPriceUsd) : null;

  return [
    {
      key: "cashapp",
      title: "Cash App",
      destinationLabel: "Cash App tag",
      destinationValue: cashAppTag,
      paymentUrl: `https://cash.app/${cashAppTag}/${amount}`,
      note: "Tap to open Cash App. Amount is pre-filled.",
      bitcoinAmountBtc: null,
      bitcoinRateUsd: null,
    },
    {
      key: "venmo",
      title: "Venmo",
      destinationLabel: "Venmo handle",
      destinationValue: venmoHandleRaw,
      paymentUrl: `https://venmo.com/${encodeURIComponent(venmoHandlePath)}?txn=pay&amount=${amount}&note=${encodeURIComponent(memo)}`,
      note: "Tap to open Venmo. Amount and memo are pre-filled.",
      bitcoinAmountBtc: null,
      bitcoinRateUsd: null,
    },
    {
      key: "zelle",
      title: "Zelle",
      destinationLabel: "Zelle recipient",
      destinationValue: zelleRecipient,
      paymentUrl: null,
      note: "Copy recipient and add your Order ID in the memo.",
      bitcoinAmountBtc: null,
      bitcoinRateUsd: null,
    },
    {
      key: "bitcoin",
      title: "Bitcoin",
      destinationLabel: "BTC address",
      destinationValue: btcAddress,
      paymentUrl: null,
      note: btcAmount
        ? `Send exactly ${btcAmount} BTC for this order (network fee is separate).`
        : "BTC quote temporarily unavailable. Please check with support for exact amount before sending.",
      bitcoinAmountBtc: btcAmount,
      bitcoinRateUsd: btcRateLabel,
    },
  ];
}

export async function buildPaymentInstructionsText (orderId: string, totalCents: number): Promise<string>
{
  const methods = await getManualPaymentMethods(orderId, totalCents);
  const amountLabel = formatUsdFromCents(totalCents);
  const memo = orderIdToMemo(orderId);

  return [
    `Order ID: ${orderId}`,
    `Total amount: ${amountLabel}`,
    "",
    "Manual payment methods:",
    ...methods.map((method) =>
    {
      const lines = [
        `- ${method.title}: ${method.destinationLabel} ${method.destinationValue}`,
      ];
      if (method.key === "bitcoin" && method.bitcoinAmountBtc)
      {
        lines.push(`  Amount to send: ${method.bitcoinAmountBtc} BTC`);
        if (method.bitcoinRateUsd) lines.push(`  Rate used: $${method.bitcoinRateUsd} per BTC`);
      }
      if (method.paymentUrl) lines.push(`  Link: ${method.paymentUrl}`);
      lines.push(`  Note: ${method.note}`);
      return lines.join("\n");
    }),
    "",
    `Memo to include: ${memo}`,
    "For Zelle, add the Order ID in the memo before sending.",
  ].join("\n");
}
