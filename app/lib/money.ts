export function formatUsdFromCents (cents: number): string
{
    const safe = Number.isFinite(cents) ? cents : 0;
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(safe / 100);
}





