import { fmtMoneyMillions } from "@/lib/format";
import type { Ccy } from "@/lib/types";

type SwingBarsProps = {
  unhedged: number;
  hedged: number;
  ccy: Ccy;
  className?: string;
};

export function SwingBars({
  unhedged,
  hedged,
  ccy,
  className = "",
}: SwingBarsProps) {
  const maxVal = Math.max(unhedged, hedged, 0.01);
  const uwPct = (unhedged / maxVal) * 100;
  const hPct = (hedged / maxVal) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
        Reduce the swing
      </p>
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-risk">Unhedged</span>
            <span className="font-mono tabular-nums text-risk">
              {fmtMoneyMillions(-unhedged, ccy)}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded bg-muted">
            <div
              className="h-full rounded bg-risk/80"
              style={{ width: `${uwPct}%` }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-hedge">Hedged</span>
            <span className="font-mono tabular-nums text-hedge">
              {fmtMoneyMillions(-hedged, ccy)}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded bg-muted">
            <div
              className="h-full rounded bg-hedge/80"
              style={{ width: `${hPct}%` }}
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Unhedged {fmtMoneyMillions(unhedged, ccy)} · Hedged{" "}
        {fmtMoneyMillions(hedged, ccy)}
      </p>
    </div>
  );
}