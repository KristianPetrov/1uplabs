import CircuitTraces from "@/app/components/CircuitTraces";

type Variant = "hero" | "footer" | "panel";

type Props = {
  className?: string;
  variant?: Variant;
};

export default function CircuitOverlay ({ className, variant = "panel" }: Props)
{
  return (
    <div
      aria-hidden="true"
      className={`circuit-overlay circuit-overlay--${variant}${className ? ` ${className}` : ""}`}
    >
      <CircuitTraces />
    </div>
  );
}

