import CircuitTraces from "@/app/components/CircuitTraces";

type Variant = "hero" | "footer" | "panel";

type Props = {
  className?: string;
  variant?: Variant;
  animated?: boolean;
};

export default function CircuitOverlay ({
  className,
  variant = "panel",
  animated = true,
}: Props)
{
  return (
    <div
      aria-hidden="true"
      className={`circuit-overlay circuit-overlay--${variant}${className ? ` ${className}` : ""}`}
    >
      <CircuitTraces animated={animated} />
    </div>
  );
}

