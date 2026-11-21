import type { LadderOutputs } from "@/lib/types";

type LadderChartProps = {
  ladder: LadderOutputs;
  underwrite: number;
  forward: number;
  spot: number;
  stressPrice: number;
  minPrice?: number;
  maxPrice?: number;
  onStressChange?: (value: number) => void;
  className?: string;
};

const W = 520;
const H = 200;
const PAD = { l: 44, r: 12, t: 12, b: 32 };

export function LadderChart({
  ladder,
  underwrite,
  forward,
  spot,
  stressPrice,
  minPrice = 1.2,
  maxPrice = 3.2,
  className = "",
}: LadderChartProps) {
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const range = maxPrice - minPrice;

  const xFor = (price: number) =>
    PAD.l + ((price - minPrice) / range) * innerW;

  const maxLoss = Math.max(
    (underwrite - minPrice) * 1,
    ladder.lossAtStress,
    0.01,
  );
  const yForLoss = (lossM: number) =>
    PAD.t + innerH - (lossM / maxLoss) * innerH * 0.9;

  const lossLine = `M ${xFor(minPrice)} ${yForLoss(underwrite - minPrice)} L ${xFor(maxPrice)} ${yForLoss(0)}`;

  const stepW = innerW / ladder.rungs.length / 4;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full max-w-full ${className}`}
      role="img"
      aria-label="GPU ladder loss and payout"
    >
      <rect
        x={PAD.l}
        y={PAD.t}
        width={innerW}
        height={innerH}
        fill="hsl(var(--muted))"
        stroke="hsl(var(--border))"
      />
      <path
        d={lossLine}
        fill="none"
        stroke="hsl(var(--risk))"
        strokeWidth={2}
      />
      {ladder.rungs.map((r, i) => {
        const x = xFor(r.strikeK);
        const h = (ladder.payoutAtStress / maxLoss) * innerH * 0.5;
        return (
          <rect
            key={r.rung}
            x={x - stepW / 2 + i * 2}
            y={PAD.t + innerH - h}
            width={stepW}
            height={h}
            fill="hsl(var(--hedge))"
            opacity={0.85}
          />
        );
      })}
      {[
        { p: spot, label: "Spot", color: "hsl(var(--foreground))" },
        { p: forward, label: "Fwd", color: "hsl(var(--muted-foreground))" },
        { p: underwrite, label: "U", color: "hsl(var(--primary))" },
        { p: stressPrice, label: "S", color: "hsl(var(--destructive))" },
      ].map((m) => (
        <g key={m.label}>
          <line
            x1={xFor(m.p)}
            x2={xFor(m.p)}
            y1={PAD.t}
            y2={PAD.t + innerH}
            stroke={m.color}
            strokeDasharray={m.label === "S" ? "0" : "3 2"}
            strokeWidth={1}
          />
          <text
            x={xFor(m.p)}
            y={H - 6}
            textAnchor="middle"
            fontSize={9}
            fill={m.color}
            className="font-mono"
          >
            {m.label}
          </text>
        </g>
      ))}
    </svg>
  );
}