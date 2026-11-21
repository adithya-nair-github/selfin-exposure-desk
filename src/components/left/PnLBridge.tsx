import { NumberField } from "@/components/ui/NumberField";
import { fmtMoneyMillions } from "@/lib/format";
import { computeLoss } from "@/lib/math";
import type { Action, DeskState, LineItem } from "@/lib/types";
import type { Dispatch } from "react";

type PnLBridgeProps = {
  state: DeskState;
  dispatch: Dispatch<Action>;
};

function WaterfallBar({ items, total }: { items: LineItem[]; total: number }) {
  const max = Math.max(total, 0.01);
  return (
    <div className="mt-2 space-y-1">
      {items.map((li) => {
        const contrib = li.sign * li.amount.value;
        const w = (Math.abs(contrib) / max) * 100;
        return (
          <div key={li.id} className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 truncate text-muted-foreground">
              {li.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded bg-muted">
              <div
                className={`h-full ${contrib >= 0 ? "bg-risk/80" : "bg-hedge/60"}`}
                style={{ width: `${w}%` }}
              />
            </div>
            <span className="w-14 text-right font-mono tabular-nums">
              {contrib >= 0 ? "+" : "−"}
              {Math.abs(contrib).toFixed(0)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function PnLBridge({ state, dispatch }: PnLBridgeProps) {
  const { scenario, lineItems, baseline } = state;
  const L = computeLoss(lineItems);
  const showBaseline =
    scenario.hedgeMode === "binary" && lineItems.length > 0;

  return (
    <section className="space-y-3 rounded-md border border-white/[0.08] bg-card p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
        P&amp;L bridge
      </p>
      {showBaseline && baseline !== null ? (
        <NumberField
          label={scenario.baselineLabel || "Baseline"}
          value={baseline.value}
          step={0.5}
          onChange={(v) => dispatch({ type: "setBaseline", value: v })}
        />
      ) : null}
      {lineItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Exposure computed from ladder at stress price.
        </p>
      ) : (
        <ul className="space-y-3">
          {lineItems.map((li) => (
            <li key={li.id} className="border-b border-border pb-2 last:border-0">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {li.sign > 0 ? "+" : "−"} {li.label}
                </span>
              </div>
              <NumberField
                label="Amount (£m)"
                value={li.amount.value}
                step={1}
                min={0}
                onChange={(v) =>
                  dispatch({ type: "updateLineItem", id: li.id, amount: v })
                }
              />
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-sm font-medium">Loss L</span>
        <span className="font-mono text-lg tabular-nums text-risk">
          {fmtMoneyMillions(L, scenario.ccy)}
        </span>
      </div>
      {lineItems.length > 0 ? (
        <WaterfallBar items={lineItems} total={L} />
      ) : null}
    </section>
  );
}