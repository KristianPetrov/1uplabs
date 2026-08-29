type Props = {
  current: "shipping" | "pay";
};

export default function CheckoutSteps ({ current }: Props)
{
  const shippingDone = current === "pay";

  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
      <li
        className={
          current === "shipping"
            ? "rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-200"
            : "text-white/45"
        }
      >
        {shippingDone ? "1 · Shipping saved" : "1 · Shipping"}
      </li>
      <li aria-hidden="true" className="text-white/25">
        →
      </li>
      <li
        className={
          current === "pay"
            ? "rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-200"
            : "text-white/45"
        }
      >
        2 · Pay
      </li>
    </ol>
  );
}
