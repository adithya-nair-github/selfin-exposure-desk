import { DepthLadder } from "@/components/charts/DepthLadder";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";
import { SourceChip } from "@/components/ui/SourceChip";
import { deriveDesk } from "@/lib/deskDerived";
import { fmtCents, fmtInt, fmtPct } from "@/lib/format";
import { routeBadgeLabel } from "@/lib/routing";
import type { Action, DeskState } from "@/lib/types";
import type { Dispatch } from "react";

type MarketTabProps = {
  state: DeskState;
  dispatch: Dispatch<Action>;
};

export function MarketTab({ state, dispatch }: MarketTabProps) {
  const { scenario } = state;
  const market = scenario.market;
  const d = deriveDesk(state);
  const bid = market.bid?.value ?? null;
  const ask = market.ask?.value ?? null;
  const spread = bid !== null && ask !== null ? ask - bid : null;
  const wide =
    spread !== null && (spread > 0.04 || (market.askSize ?? 0) < 50);

  const oi = market.openInterest?.value ?? null;

  return (
    <div className="space-y-6">
      <DepthLadder
        levels={market.askBook?.levels ?? null}
        hedgeN={d.contractsN}
        blockMin={d.blockMin}
        openInterest={oi}
        book={d.book}
      />

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
          Implied probability
        </p>
        <p className="font-serif text-4xl tracking-tight text-foreground">
          {fmtPct(d.mid, 1)}
        </p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-1 pr-2 font-normal">Last</th>
            <th className="py-1 pr-2 font-normal">Bid</th>
            <th className="py-1 pr-2 font-normal">Ask</th>
            <th className="py-1 pr-2 font-normal">OI</th>
            <th className="py-1 font-normal">Vol</th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          <tr className="border-b border-border">
            <td className="py-2 pr-2">
              {market.last ? fmtCents(market.last.value) : "—"}
            </td>
            <td className="py-2 pr-2">
              {bid !== null ? fmtCents(bid) : "—"}
              {market.bidSize !== null ? ` (${market.bidSize})` : ""}
            </td>
            <td className="py-2 pr-2">
              {ask !== null ? fmtCents(ask) : "—"}
              {market.askSize !== null ? ` (${market.askSize})` : ""}
            </td>
            <td className="py-2 pr-2 text-right">
              {oi !== null ? fmtInt(oi) : "—"}
            </td>
            <td className="py-2 text-right">
              {market.volume ? fmtInt(market.volume.value) : "—"}
            </td>
          </tr>
        </tbody>
      </table>

      {wide ? (
        <Badge variant="risk">Wide market / thin ask</Badge>
      ) : null}

      <p className="text-xs text-muted-foreground">{market.snapshotLabel}</p>

      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
        {market.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>

      {scenario.defaults.viewProb !== null ? (
        <Slider
          label="Your view"
          value={state.viewProb * 100}
          min={0}
          max={100}
          step={1}
          formatValue={(v) => `${v.toFixed(0)}%`}
          onChange={(v) => dispatch({ type: "setViewProb", value: v / 100 })}
        />
      ) : null}
      {scenario.defaults.viewProb !== null ? (
        <p className="text-sm text-muted-foreground">
          Edge vs market:{" "}
          <span className="font-mono text-foreground">
            {((state.viewProb - d.mid) * 100).toFixed(1)} pp
          </span>
        </p>
      ) : null}

      <section className="rounded-md border border-border bg-muted/50 p-4">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
          Liquidity &amp; route
        </p>
        <Badge className="mb-3" variant="primary">
          {routeBadgeLabel(d.route)}
        </Badge>
        <ul className="mb-3 space-y-1 text-sm">
          {d.route.reasons.map((r) => (
            <li key={r} className="text-muted-foreground">
              {r}
            </li>
          ))}
        </ul>
        <ul className="space-y-2">
          {d.route.checks.map((c) => (
            <li
              key={c.label}
              className="flex items-start gap-2 border-t border-border pt-2 text-sm first:border-0 first:pt-0"
            >
              <span className="font-mono w-4 shrink-0">
                {c.pass === null ? "?" : c.pass ? "✓" : "✗"}
              </span>
              <span>
                <span className="text-foreground">{c.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {c.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
        {d.route.polymarketAlternative ? (
          <Badge variant="hedge" className="mt-2">
            Polymarket US alternative (listing to be confirmed)
          </Badge>
        ) : null}
      </section>

      {market.last?.prov.kind === "sourced" ? (
        <SourceChip prov={market.last.prov} />
      ) : null}
      {market.askBook ? (
        <SourceChip prov={market.askBook.prov} />
      ) : null}
    </div>
  );
}