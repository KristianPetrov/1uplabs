type PulsePath = {
  d: string;
  dur: string;
  delay: string;
};

const PATHS: string[] = [
  "M 84 160 H 284 V 248 H 424 V 332 H 590 V 418 H 784",
  "M 916 188 H 756 V 270 H 642 V 404 H 486 V 520 H 322",
  "M 116 420 H 240 V 344 H 360 V 224 H 520 V 132 H 708",
  "M 96 820 H 280 V 728 H 420 V 628 H 620 V 540 H 780",
  "M 904 844 H 740 V 740 H 616 V 644 H 520 V 576 H 420",
  "M 500 56 V 230 H 640 V 304 H 860",
  "M 500 944 V 770 H 360 V 694 H 140",
  "M 224 520 H 420 V 456 H 560 V 356 H 712",
];

const PULSES: PulsePath[] = [
  { d: PATHS[0]!, dur: "7.8s", delay: "-1.8s" },
  { d: PATHS[1]!, dur: "8.6s", delay: "-3.2s" },
  { d: PATHS[3]!, dur: "7.2s", delay: "-2.6s" },
  { d: PATHS[4]!, dur: "9.4s", delay: "-4.1s" },
  { d: PATHS[5]!, dur: "6.9s", delay: "-1.1s" },
  { d: PATHS[6]!, dur: "10.2s", delay: "-5.0s" },
];

const NODES: Array<{ cx: number; cy: number; r: number; delay: string }> = [
  { cx: 284, cy: 160, r: 4, delay: "-0.2s" },
  { cx: 284, cy: 248, r: 3, delay: "-1.6s" },
  { cx: 424, cy: 248, r: 3, delay: "-2.4s" },
  { cx: 590, cy: 332, r: 4, delay: "-0.9s" },
  { cx: 784, cy: 418, r: 3, delay: "-2.8s" },
  { cx: 756, cy: 188, r: 4, delay: "-1.2s" },
  { cx: 642, cy: 270, r: 3, delay: "-3.0s" },
  { cx: 486, cy: 404, r: 4, delay: "-0.4s" },
  { cx: 322, cy: 520, r: 3, delay: "-2.1s" },
  { cx: 280, cy: 820, r: 4, delay: "-1.7s" },
  { cx: 420, cy: 728, r: 3, delay: "-2.9s" },
  { cx: 620, cy: 628, r: 4, delay: "-0.8s" },
  { cx: 740, cy: 844, r: 4, delay: "-1.3s" },
  { cx: 616, cy: 740, r: 3, delay: "-3.6s" },
  { cx: 500, cy: 230, r: 4, delay: "-2.6s" },
  { cx: 640, cy: 304, r: 3, delay: "-0.6s" },
  { cx: 360, cy: 770, r: 4, delay: "-1.9s" },
  { cx: 360, cy: 694, r: 3, delay: "-3.4s" },
  { cx: 560, cy: 456, r: 4, delay: "-2.0s" },
  { cx: 712, cy: 356, r: 3, delay: "-1.1s" },
];

export default function CircuitTraces ()
{
  return (
    <svg
      className="lab-circuits"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="circuitGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.90)" />
          <stop offset="55%" stopColor="rgba(14, 165, 233, 0.92)" />
          <stop offset="100%" stopColor="rgba(99, 102, 241, 0.88)" />
        </linearGradient>
        <filter id="circuitGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 14 -6"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="circuit-base" filter="url(#circuitGlow)">
        {PATHS.map((d, idx) => (
          <path key={idx} d={d} />
        ))}
      </g>

      <g className="circuit-pulses" filter="url(#circuitGlow)">
        {PULSES.map((p, idx) => (
          <path
            key={idx}
            d={p.d}
            className="circuit-pulse"
            style={{ ["--dur" as any]: p.dur, ["--delay" as any]: p.delay }}
          />
        ))}
      </g>

      <g className="circuit-nodes" filter="url(#circuitGlow)">
        {NODES.map((n, idx) => (
          <circle
            key={idx}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            className="circuit-node"
            style={{ ["--delay" as any]: n.delay }}
          />
        ))}
      </g>

      <rect className="circuit-faint-scan" x="0" y="0" width="1000" height="1000" />
    </svg>
  );
}

