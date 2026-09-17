import type { CSSProperties } from "react";
import { useId } from "react";

type Variant = "hero" | "footer" | "panel";

type Props = {
  variant?: Variant;
  animated?: boolean;
};

type PulsePath = {
  d: string;
  dur: string;
  delay: string;
};

const CORNER_TRACES = [
  "M 108 28 H 214 V 52 H 268",
  "M 108 50 H 168 V 118 H 228 V 172",
  "M 36 72 V 156 H 88 V 236",
  "M 60 72 V 112 H 18 V 188 H 52 V 252",
  "M 214 52 V 92 H 252 V 148",
];

const CORNER_PULSES: PulsePath[] = [
  { d: CORNER_TRACES[0]!, dur: "7.4s", delay: "-1.6s" },
  { d: CORNER_TRACES[2]!, dur: "8.8s", delay: "-3.4s" },
  { d: CORNER_TRACES[3]!, dur: "9.6s", delay: "-2.2s" },
];

const CORNER_VIAS = [
  { cx: 108, cy: 28 },
  { cx: 214, cy: 52 },
  { cx: 168, cy: 118 },
  { cx: 88, cy: 156 },
  { cx: 18, cy: 188 },
  { cx: 252, cy: 148 },
];

const CORNER_PADS = [
  { x: 262, y: 46 },
  { x: 222, y: 166 },
  { x: 82, y: 230 },
  { x: 46, y: 246 },
];

const RAIL_TRACES = [
  "M 24 118 H 1176",
  "M 96 118 V 46 H 168 V 22",
  "M 248 118 V 58 H 320",
  "M 412 118 V 36 H 486 V 64",
  "M 580 118 V 52 H 662 V 24",
  "M 760 118 V 44 H 840",
  "M 932 118 V 60 H 1008 V 28",
  "M 1104 118 V 40 H 1160",
];

const RAIL_PULSES: PulsePath[] = [
  { d: RAIL_TRACES[0]!, dur: "11s", delay: "-2.4s" },
  { d: RAIL_TRACES[2]!, dur: "7.8s", delay: "-1.1s" },
  { d: RAIL_TRACES[4]!, dur: "8.6s", delay: "-4.2s" },
  { d: RAIL_TRACES[6]!, dur: "9.2s", delay: "-3.0s" },
];

const RAIL_VIAS = [
  { cx: 96, cy: 118 },
  { cx: 248, cy: 118 },
  { cx: 412, cy: 118 },
  { cx: 580, cy: 118 },
  { cx: 760, cy: 118 },
  { cx: 932, cy: 118 },
  { cx: 1104, cy: 118 },
  { cx: 168, cy: 46 },
  { cx: 662, cy: 52 },
  { cx: 1008, cy: 60 },
];

const CORNER_POSITIONS = ["tl", "tr", "bl", "br"] as const;

function CircuitDefs ({ uid, animated }: { uid: string; animated: boolean })
{
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.92)" />
          <stop offset="55%" stopColor="rgba(14, 165, 233, 0.90)" />
          <stop offset="100%" stopColor="rgba(99, 102, 241, 0.86)" />
        </linearGradient>
        {animated ? (
          <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 12 -5"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ) : null}
      </defs>
    </svg>
  );
}

function Chip ()
{
  return (
    <g className="circuit-chip-group">
      <rect className="circuit-chip" x="16" y="16" width="80" height="44" rx="2" />
      <path
        className="circuit-pins"
        d="M 30 60 V 72 M 42 60 V 72 M 54 60 V 72 M 66 60 V 72 M 78 60 V 72 M 96 26 H 108 M 96 38 H 108 M 96 50 H 108"
      />
    </g>
  );
}

function Vias ({ points }: { points: Array<{ cx: number; cy: number }> })
{
  return (
    <g className="circuit-vias">
      {points.map((via) => (
        <g key={`${via.cx}-${via.cy}`}>
          <circle className="circuit-via-ring" cx={via.cx} cy={via.cy} r="5" />
          <circle className="circuit-via-hole" cx={via.cx} cy={via.cy} r="1.8" />
        </g>
      ))}
    </g>
  );
}

function Pulses ({
  paths,
  uid,
  animated,
}: {
  paths: PulsePath[];
  uid: string;
  animated: boolean;
})
{
  if (!animated) return null;

  return (
    <g className="circuit-pulses">
      {paths.map((pulse) => (
        <path
          key={`${pulse.d}-${pulse.delay}`}
          d={pulse.d}
          className="circuit-pulse"
          stroke={`url(#${uid}-grad)`}
          style={{ "--dur": pulse.dur, "--delay": pulse.delay } as CSSProperties}
        />
      ))}
    </g>
  );
}

function CircuitCorner ({
  position,
  uid,
  animated,
}: {
  position: (typeof CORNER_POSITIONS)[number];
  uid: string;
  animated: boolean;
})
{
  const filter = animated ? `url(#${uid}-glow)` : undefined;

  return (
    <svg
      className={`circuit-corner circuit-corner--${position}`}
      viewBox="0 0 280 280"
      preserveAspectRatio="xMinYMin meet"
      aria-hidden="true"
    >
      <g className="circuit-base" filter={filter}>
        <Chip />
        {CORNER_TRACES.map((d) => (
          <path key={d} d={d} />
        ))}
        {CORNER_PADS.map((pad) => (
          <rect key={`${pad.x}-${pad.y}`} className="circuit-pad" x={pad.x} y={pad.y} width="7" height="7" />
        ))}
        <Vias points={CORNER_VIAS} />
      </g>
      <Pulses paths={CORNER_PULSES} uid={uid} animated={animated} />
    </svg>
  );
}

function CircuitRail ({
  uid,
  animated,
  placement,
}: {
  uid: string;
  animated: boolean;
  placement: "top" | "bottom";
})
{
  const filter = animated ? `url(#${uid}-glow)` : undefined;

  return (
    <svg
      className={`circuit-rail circuit-rail--${placement}`}
      viewBox="0 0 1200 140"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g className="circuit-base" filter={filter}>
        <rect className="circuit-chip" x="292" y="86" width="56" height="28" rx="2" />
        <rect className="circuit-chip" x="704" y="86" width="56" height="28" rx="2" />
        {RAIL_TRACES.map((d) => (
          <path key={d} d={d} />
        ))}
        <Vias points={RAIL_VIAS} />
      </g>
      <Pulses paths={RAIL_PULSES} uid={uid} animated={animated} />
    </svg>
  );
}

export default function CircuitTraces ({ variant = "panel", animated = true }: Props)
{
  const uid = useId().replace(/:/g, "");

  return (
    <>
      <CircuitDefs uid={uid} animated={animated} />
      {variant !== "footer" ? CORNER_POSITIONS.map((position) => (
        <CircuitCorner key={position} position={position} uid={uid} animated={animated} />
      )) : null}
      {variant === "hero" ? <CircuitRail uid={uid} animated={animated} placement="top" /> : null}
      {variant === "footer" ? <CircuitRail uid={uid} animated={animated} placement="bottom" /> : null}
    </>
  );
}
