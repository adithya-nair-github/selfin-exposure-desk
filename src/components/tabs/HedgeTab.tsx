"use client";

import { LadderChart } from "@/components/charts/LadderChart";
import { SwingBars } from "@/components/charts/SwingBars";
import { Badge } from "@/components/ui/Badge";
import { IllustrativeTag } from "@/components/ui/IllustrativeTag";
import { NumberField } from "@/components/ui/NumberField";
import { Segmented } from "@/components/ui/Segmented";
import { Slider } from "@/components/ui/Slider";
import { SourceChip } from "@/components/ui/SourceChip";
import { calibrationModelMatch, deriveDesk } from "@/lib/deskDerived";
import { fmtCents, fmtContracts, fmtMoneyMillions, fmtPct } from "@/lib/format";
import { gpuLossL, runModelChecks } from "@/lib/math";
import type { Action, DeskState } from "@/lib/types";
import { useState, type Dispatch } from "react";

type HedgeTabProps = {
  state: DeskState;
  dispatch: Dispatch<Action>;
};

export function HedgeTab({ state, dispatch }: HedgeTabProps) {
  const { scenario } = state;
  const d = deriveDesk(state);
  const hedge = d.hedge;
  const ladder = d.ladder;
  const [checksOpen, setChecksOpen] = useState(false);
  const calMatch = calibrationModelMatch(state);

  const coveragePct = (state.coverageOverride ?? state.coverage) * 100;
  const coverageLabel =
    state.coverageOverride !== null
      ? `Custom ${coveragePct.toFixed(1)}%`
      : `${coveragePct.toFixed(0)}%`;

  const L =
    hedge?.lossL ??
    (scenario.ladder ? gpuLossL(state.stressPrice, scenario) : 0);

  return (
    <div className="space-y-6">
      {calMatch ? (
        <Badge variant="primary">
          Model check ✓ matches Selfin: £56m / £59m, gap £22m → £3m
        </Badge>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <Slider
          label="Coverage"
          value={state.coverage * 100}
          min={0}
          max={150}
          step={5}
          formatValue={() => coverageLabel}
          onChange={(v) => dispatch({ type: "setCoverage", value: v / 100 })}
        />
        <div className="flex flex-wrap gap-2">
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => dispatch({ type: "setCoverage", value: p })}
              className="h-8 rounded-md border border-border px-2 text-xs hover:bg-accent"
            >
              {(p * 100).toFixed(0)}%
            </button>
          ))}
        </div>
        <Segmented
          label="Payout basis"
          value={state.netOfPremium ? "net" : "gross"}
          options={[
            { value: "gross", label: "Gross" },
            { value: "net", label: "Net-of-premium" },
          ]}
          onChange={(v) =>
            dispatch({ type: "setNetOfPremium", value: v === "net" })
          }
        />
        <NumberField
          label="FX USD per local"
          value={state.fxUsdPerLocal}
          step={0.01}
          min={0.01}
          onChange={(v) => dispatch({ type: "setFxUsdPerLocal", value: v })}
        />
        <div className="flex items-end gap-2">
          <IllustrativeTag note="Set to today's FX" />
        </div>
        <NumberField
          label="Fee per contract"
          value={state.feePerContract}
          step={0.001}
          min={0}
          onChange={(v) => dispatch({ type: "setFeePerContract", value: v })}
        />
      </section>

      {scenario.hedgeMode === "binary" && scenario.timing.length > 0 ? (
        <Segmented
          label="Entry timing"
          value={state.timingId}
          options={scenario.timing.map((t) => ({
            value: t.id,
            label: t.label.split(",")[0],
          }))}
          onChange={(id) =>
            dispatch({ type: "setTimingId", id: id as "early" | "now" | "late" })
          }
        />
      ) : null}

      {scenario.hedgeMode === "ladder" && scenario.ladder ? (
        <section className="space-y-3 rounded-md border border-border p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Ladder controls
          </p>
          <Slider
            label="Stress price ($/GPU-hr)"
            value={state.stressPrice}
            min={1.2}
            max={3.2}
            step={0.05}
            formatValue={(v) => `$${v.toFixed(2)}`}
            onChange={(v) => dispatch({ type: "setStressPrice", value: v })}
          />
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => dispatch({ type: "setStressPrice", value: 1.8 })}
          >
            $1.80 (Selfin&apos;s example)
          </button>
          <Slider
            label="Vol σ"
            value={state.ladderVol * 100}
            min={20}
            max={150}
            step={5}
            formatValue={(v) => `${v.toFixed(0)}%`}
            onChange={(v) =>
              dispatch({ type: "setLadderVol", value: v / 100 })
            }
          />
          <NumberField
            label="Forward F"
            value={state.ladderForward}
            step={0.05}
            onChange={(v) => dispatch({ type: "setLadderForward", value: v })}
          />
          <div className="flex gap-4">
            <NumberField
              label="Rungs"
              value={state.ladderRungs}
              min={1}
              max={6}
              step={1}
              onChange={(v) => dispatch({ type: "setLadderRungs", value: v })}
            />
            <Segmented
              label="Step Δ"
              value={String(state.ladderStep) as "0.1" | "0.2" | "0.3"}
              options={[
                { value: "0.1", label: "0.10" },
                { value: "0.2", label: "0.20" },
                { value: "0.3", label: "0.30" },
              ]}
              onChange={(v) =>
                dispatch({ type: "setLadderStep", value: Number(v) })
              }
            />
          </div>
          {ladder ? (
            <LadderChart
              ladder={ladder}
              underwrite={scenario.ladder.underwriteRate.value}
              forward={state.ladderForward}
              spot={scenario.ladder.spot.value}
              stressPrice={state.stressPrice}
            />
          ) : null}
        </section>
      ) : null}

      {hedge ? (
        <>
          {hedge.overHedged ? (
            <Badge variant="risk">
              Over-hedged: net payout exceeds the exposure; speculative, may
              break the ECP hedging prong and hedge designation.
            </Badge>
          ) : null}

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-1">Outcome</th>
                <th className="py-1 text-right">Unhedged</th>
                <th className="py-1 text-right">Hedged</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              <tr className="border-b border-border">
                <td className="py-2">No event</td>
                <td className="py-2 text-right">
                  {fmtMoneyMillions(hedge.baseline, scenario.ccy)}
                </td>
                <td className="py-2 text-right">
                  {fmtMoneyMillions(hedge.outcomeNoEvent, scenario.ccy)}
                </td>
              </tr>
              <tr>
                <td className="py-2">Event</td>
                <td className="py-2 text-right">
                  {fmtMoneyMillions(
                    hedge.baseline - hedge.lossL,
                    scenario.ccy,
                  )}
                </td>
                <td className="py-2 text-right">
                  {fmtMoneyMillions(hedge.outcomeEvent, scenario.ccy)}
                </td>
              </tr>
            </tbody>
          </table>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Contracts N</dt>
              <dd className="font-mono tabular-nums">
                {fmtContracts(hedge.contractsN)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Premium</dt>
              <dd className="font-mono tabular-nums">
                {fmtMoneyMillions(hedge.premiumLocal, scenario.ccy)} · $
                {(hedge.premiumUsd / 1e6).toFixed(1)}m
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Premium / payout</dt>
              <dd className="font-mono tabular-nums">
                {hedge.payoutTarget > 0
                  ? (
                      (hedge.premiumLocal / hedge.payoutTarget) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Price q</dt>
              <dd className="font-mono tabular-nums">
                {fmtCents(hedge.executionPrice)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Breakeven</dt>
              <dd className="font-mono tabular-nums">
                {fmtPct(hedge.breakevenProb)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Expected P&amp;L @ view</dt>
              <dd className="font-mono tabular-nums">
                {fmtMoneyMillions(hedge.expectedPnlLocal, scenario.ccy)}
                {hedge.expectedPnlLocal < 0 ? " (Cost of certainty)" : ""}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Swing reduction</dt>
              <dd className="font-mono tabular-nums">
                {fmtPct(hedge.swingReductionPct)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">σ reduction</dt>
              <dd className="font-mono tabular-nums">
                {fmtPct(hedge.volReductionPct)}
              </dd>
            </div>
            {scenario.ccy !== "USD" ? (
              <>
                <div>
                  <dt className="text-muted-foreground">FX −10%</dt>
                  <dd className="font-mono tabular-nums">
                    {fmtMoneyMillions(hedge.fxShockDown, scenario.ccy)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">FX +10%</dt>
                  <dd className="font-mono tabular-nums">
                    {fmtMoneyMillions(hedge.fxShockUp, scenario.ccy)}
                  </dd>
                </div>
              </>
            ) : null}
          </dl>

          <SwingBars
            unhedged={hedge.swingUnhedged}
            hedged={hedge.swingHedged}
            ccy={scenario.ccy}
          />
        </>
      ) : ladder ? (
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Loss at stress</dt>
            <dd className="font-mono">
              {fmtMoneyMillions(ladder.lossAtStress, scenario.ccy)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Payout at stress</dt>
            <dd className="font-mono">
              {fmtMoneyMillions(ladder.payoutAtStress, scenario.ccy)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Premium</dt>
            <dd className="font-mono">
              {fmtMoneyMillions(ladder.execPremium, scenario.ccy)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Outcome @ S</dt>
            <dd className="font-mono">
              {fmtMoneyMillions(ladder.outcomeAtStress, scenario.ccy)}
            </dd>
          </div>
        </dl>
      ) : null}

      <section className="rounded-md border border-border p-4">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
          Basis
        </p>
        <ul className="space-y-3">
          {scenario.basis.map((b) => (
            <li key={b.id} className="text-sm">
              <div className="flex items-center justify-between">
                <span>{b.label}</span>
                <span className="flex gap-0.5" aria-label={`Score ${b.score}/5`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        i <= b.score ? "bg-primary" : "bg-border"
                      }`}
                    />
                  ))}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{b.detail}</p>
              {b.sourceId ? (
                <SourceChip
                  prov={{ kind: "sourced", sourceId: b.sourceId }}
                />
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">
          Basis score (mean):{" "}
          <span className="font-mono text-foreground">
            {(
              scenario.basis.reduce((s, b) => s + b.score, 0) /
              Math.max(scenario.basis.length, 1)
            ).toFixed(1)}
          </span>
          /5 · Exposure L {fmtMoneyMillions(L, scenario.ccy)}
        </p>
      </section>

      <button
        type="button"
        onClick={() => setChecksOpen(!checksOpen)}
        className="text-sm text-primary hover:underline"
      >
        {checksOpen ? "Hide" : "Show"} model checks
      </button>
      {checksOpen ? (
        <ul className="space-y-1 text-sm">
          {runModelChecks().map((c) => (
            <li key={c.name} className={c.pass ? "text-primary" : "text-destructive"}>
              {c.pass ? "✓" : "✗"} {c.name} — {c.detail}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}