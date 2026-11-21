import { fmtContracts, fmtInt } from "@/lib/format";
import type { BookAnalytics, DepthLevel } from "@/lib/types";

type DepthLadderProps = {
  levels: DepthLevel[] | null;
  hedgeN: number;
  blockMin: number;
  openInterest: number | null;
  book: BookAnalytics | null;
  className?: string;
};

const W = 560;
const H = 220;
const PAD = { l: 48, r: 16, t: 24, b: 40 };

function logX(cumulative: number, maxC: number, innerW: number): number {
  const lo = Math.log10(1);
  const hi = Math.log10(Math.max(maxC, 10));
  const v = Math.log10(Math.max(cumulative, 1));
  return PAD.l + ((v - lo) / (hi - lo)) * innerW;
}

export function depthCaption(book: BookAnalytics | null, hedgeN: number): string {
  if (!book || hedgeN <= 0) {
    return "No listed book: custom listing or OTC";
  }
  const total = Math.round(book.totalContracts);
  return `Visible ask book: ${total.toLocaleString("en-US")} contracts = ${book.pctOfHedge.toFixed(2)}% of the hedge.`;
}

export function DepthLadder({
  levels,
  hedgeN,
  blockMin,
  openInterest,
  book,
  className = "",
}: DepthLadderProps) {
  if (!levels || levels.length === 0 || !book) {
    return (
      <p className={`text-sm text-muted-foreground ${className}`}>
        No listed book: custom listing or OTC
      </p>
    );
  }

  const sorted = [...levels].sort((a, b) => a.price - b.price);
  const steps = sorted.reduce<
    { price: number; cumulative: number; size: number }[]
  >((acc, lvl) => {
    const cumulative =
      (acc.length > 0 ? acc[acc.length - 1].cumulative : 0) + lvl.size;
    acc.push({ price: lvl.price, cumulative, size: lvl.size });
    return acc;
  }, []);

  const totalDepth =
    steps.length > 0 ? steps[steps.length - 1].cumulative : 0;
  const maxC = Math.max(
    totalDepth,
    hedgeN,
    blockMin,
    openInterest ?? 0,
    10,
  );
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const priceMin = sorted[0].price;
  const priceMax = sorted[sorted.length - 1].price;
  const priceRange = priceMax - priceMin || 0.01;

  const yForPrice = (p: number) =>
    PAD.t + innerH - ((p - priceMin) / priceRange) * innerH;

  const markers: { label: string; x: number; color: string }[] = [];
  const addMarker = (n: number, label: string, color: string) => {
    if (n > 0) {
      markers.push({ label, x: logX(n, maxC, innerW), color });
    }
  };
  addMarker(hedgeN, "N", "hsl(var(--primary))");
  addMarker(blockMin, "Block min", "hsl(var(--muted-foreground))");
  if (openInterest !== null && openInterest > 0) {
    addMarker(openInterest, "OI", "hsl(var(--hedge))");
  }

  const pathD = steps
    .map((s, i) => {
      const x = logX(s.cumulative, maxC, innerW);
      const y = yForPrice(s.price);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const caption = depthCaption(book, hedgeN);
  const bigLot = sorted.find((l) => l.size >= 10000);

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
        What the market implies
      </p>
      <p className="text-sm text-foreground">{caption}</p>
      {bigLot ? (
        <p className="text-xs text-muted-foreground">
          Notable lot: {fmtInt(Math.round(bigLot.size))} contracts at{" "}
          {(bigLot.price * 100).toFixed(0)}¢
        </p>
      ) : null}
      <p className="font-serif text-sm text-muted-foreground">
        The screen can&apos;t fill this. The price has to come from market makers
        on a block.
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-full text-muted-foreground"
        role="img"
        aria-label="Cumulative ask depth versus hedge size"
      >
        <rect
          x={PAD.l}
          y={PAD.t}
          width={innerW}
          height={innerH}
          fill="hsl(var(--muted))"
          stroke="hsl(var(--border))"
          strokeWidth={1}
          rx={4}
        />
        <path
          d={pathD}
          fill="none"
          stroke="hsl(var(--hedge))"
          strokeWidth={2}
        />
        {steps.map((s) => (
          <circle
            key={s.price}
            cx={logX(s.cumulative, maxC, innerW)}
            cy={yForPrice(s.price)}
            r={3}
            fill="hsl(var(--primary))"
          />
        ))}
        {markers.map((m) => (
          <g key={m.label}>
            <line
              x1={m.x}
              x2={m.x}
              y1={PAD.t}
              y2={PAD.t + innerH}
              stroke={m.color}
              strokeDasharray="4 3"
              strokeWidth={1}
            />
            <text
              x={m.x}
              y={PAD.t - 6}
              textAnchor="middle"
              fill={m.color}
              fontSize={10}
              className="font-mono"
            >
              {m.label}
            </text>
          </g>
        ))}
        <text
          x={PAD.l + innerW / 2}
          y={H - 8}
          textAnchor="middle"
          fontSize={11}
          fill="currentColor"
          className="font-mono"
        >
          Cumulative contracts (log scale) · hedge {fmtContracts(hedgeN)}
        </text>
      </svg>
    </div>
  );
}