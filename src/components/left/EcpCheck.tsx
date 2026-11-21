import { Badge } from "@/components/ui/Badge";
import { NumberField } from "@/components/ui/NumberField";
import { SourceChip } from "@/components/ui/SourceChip";
import { ecpPass } from "@/lib/math";
import type { Action, DeskState } from "@/lib/types";
import type { Dispatch } from "react";

type EcpCheckProps = {
  state: DeskState;
  dispatch: Dispatch<Action>;
};

export function EcpCheck({ state, dispatch }: EcpCheckProps) {
  const pass = ecpPass(
    state.ecpAssets,
    state.ecpNetWorth,
    state.ecpHedging,
  );

  return (
    <section className="space-y-3 rounded-md border border-white/[0.08] bg-card p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
        ECP check
      </p>
      <NumberField
        label="Total assets (USD)"
        value={state.ecpAssets}
        step={1_000_000}
        min={0}
        onChange={(v) => dispatch({ type: "setEcpAssets", value: v })}
      />
      <NumberField
        label="Net worth (USD)"
        value={state.ecpNetWorth}
        step={100_000}
        min={0}
        onChange={(v) => dispatch({ type: "setEcpNetWorth", value: v })}
      />
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={state.ecpHedging}
          onChange={(e) =>
            dispatch({ type: "setEcpHedging", value: e.target.checked })
          }
          className="h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        />
        Hedging purpose (not speculation)
      </label>
      <div className="flex items-center gap-2">
        {pass ? (
          <Badge variant="primary">ECP ✓</Badge>
        ) : (
          <Badge variant="risk">Not an ECP</Badge>
        )}
        <SourceChip prov={{ kind: "sourced", sourceId: "ecp" }} />
      </div>
    </section>
  );
}