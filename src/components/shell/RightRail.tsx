import { depthCaption } from "@/components/charts/DepthLadder";
import { Badge } from "@/components/ui/Badge";
import { deriveDesk } from "@/lib/deskDerived";
import { fmtCents, fmtContracts, fmtMoneyMillions, fmtPct } from "@/lib/format";
import { routeBadgeLabel } from "@/lib/routing";
import type { Action, DeskState } from "@/lib/types";
import type { Dispatch } from "react";

type RightRailProps = {
  state: DeskState;
  dispatch: Dispatch<Action>;
};

export function RightRail({ state, dispatch }: RightRailProps) {
  const d = deriveDesk(state);
  const { scenario } = state;
  const hedge = d.hedge;
  const premiumLocal = hedge?.premiumLocal ?? d.ladder?.execPremium ?? 0;
  const swingU = hedge?.swingUnhedged ?? scenario.ladder?.underwriteRate.value ?? 0;
  const swingH = hedge?.swingHedged ?? d.ladder?.payoutAtStress ?? 0;

  return (
    <aside className="space-y-3 rounded-md border border-white/[0.08] bg-card p-3 sm:p-4 xl:sticky xl:top-20 print:hidden">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
        Live summary
      </p>
      <h3 className="font-serif text-base leading-snug">{scenario.name}</h3>
      <p className="text-xs text-muted-foreground">{scenario.eventLabel}</p>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Implied</dt>
          <dd className="font-mono tabular-nums">{fmtPct(d.mid)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Contracts</dt>
          <dd className="font-mono tabular-nums">{fmtContracts(d.contractsN)}</dd>
        </div>
        {d.book ? (
          <div className="text-xs text-muted-foreground">
            {depthCaption(d.book, d.contractsN)}
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Premium</dt>
          <dd className="font-mono tabular-nums">
            {fmtMoneyMillions(premiumLocal, scenario.ccy)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Swing</dt>
          <dd className="font-mono text-xs tabular-nums">
            {fmtMoneyMillions(swingU, scenario.ccy)} →{" "}
            {fmtMoneyMillions(swingH, scenario.ccy)}
          </dd>
        </div>
      </dl>
      <Badge variant="primary">{routeBadgeLabel(d.route)}</Badge>
      <Badge variant={d.ecpOk ? "primary" : "risk"}>
        {d.ecpOk ? "ECP ✓" : "ECP ✗"}
      </Badge>
      {hedge ? (
        <p className="font-mono text-xs text-muted-foreground">
          Exec {fmtCents(hedge.executionPrice)}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => dispatch({ type: "setActiveTab", tab: "memo" })}
        className="h-9 w-full rounded-md bg-primary px-3 text-sm text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        Open memo
      </button>
    </aside>
  );
}