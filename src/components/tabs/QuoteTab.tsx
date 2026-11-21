"use client";

import { NumberField } from "@/components/ui/NumberField";
import { Badge } from "@/components/ui/Badge";
import {
  allocationVwap,
  bestQuote,
  buildMmQuotes,
  greedyAllocations,
  sensitivityQuotes,
} from "@/lib/quotes";
import { deriveDesk } from "@/lib/deskDerived";
import { fmtCents, fmtContracts, fmtMoneyMillions } from "@/lib/format";
import { kalshiBlockMin } from "@/data/venues";
import type { Action, DeskState, MmQuote } from "@/lib/types";
import { useEffect, useRef, type Dispatch } from "react";

type QuoteTabProps = {
  state: DeskState;
  dispatch: Dispatch<Action>;
};

export function QuoteTab({ state, dispatch }: QuoteTabProps) {
  const { scenario } = state;
  const d = deriveDesk(state);
  const hedge = d.hedge;
  const N = hedge?.contractsN ?? d.contractsN;
  const revealRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      for (const t of revealRef.current) {
        clearTimeout(t);
      }
      revealRef.current = [];
    };
  }, []);

  const quotes = state.quotes ?? [];
  const revealStep = state.quoteRevealStep;
  const best = bestQuote(quotes);
  const canRfq = scenario.defaults.rfqEnabled && d.ecpOk && d.route.route !== null;

  const totalAlloc = state.allocations.reduce((s, a) => s + a.size, 0);
  const vwap =
    quotes.length > 0 ? allocationVwap(state.allocations, quotes) : 0;
  const premLocal =
    hedge && vwap > 0
      ? (N * vwap + N * state.feePerContract) /
        state.fxUsdPerLocal /
        1e6
      : hedge?.premiumLocal ?? 0;

  const blockMin = kalshiBlockMin(scenario.market.category);
  const sensitivity = sensitivityQuotes(
    {
      market: scenario.market,
      mid: d.mid,
      contractsN: N,
    },
    [1, 3, 5, 10],
  );

  function requestQuotes() {
    for (const t of revealRef.current) {
      clearTimeout(t);
    }
    revealRef.current = [];
    const built = buildMmQuotes({
      market: scenario.market,
      mid: d.mid,
      contractsN: N,
      userEdgeCents: state.mmEdgeCents,
    });
    dispatch({ type: "setQuotes", quotes: built });
    dispatch({ type: "setQuoteRevealStep", step: 0 });
    const makers: MmQuote["maker"][] = ["MM 1", "MM 2", "MM 3"];
    makers.forEach((_, i) => {
      const t = setTimeout(() => {
        dispatch({ type: "setQuoteRevealStep", step: i + 1 });
        if (i === makers.length - 1) {
          const alloc = greedyAllocations(built, N);
          dispatch({ type: "setAllocations", allocations: alloc });
          const b = bestQuote(built);
          if (b) {
            dispatch({ type: "setSelectedMaker", maker: b.maker });
          }
        }
      }, 1200 * (i + 1));
      revealRef.current.push(t);
    });
  }

  function updateAllocation(maker: MmQuote["maker"], size: number) {
    const rest = state.allocations.filter((a) => a.maker !== maker);
    const next = size > 0 ? [...rest, { maker, size }] : rest;
    dispatch({ type: "setAllocations", allocations: next });
  }

  const fullyAllocated = N > 0 && totalAlloc === N;

  return (
    <div className="space-y-6">
      <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
        Simulated quotes, not Selfin&apos;s pricing.
      </p>

      {!scenario.defaults.rfqEnabled ? (
        <p className="text-sm text-muted-foreground">
          Calibration uses the post&apos;s all-in price.
        </p>
      ) : null}

      <NumberField
        label="MM edge (illustrative)"
        value={state.mmEdgeCents}
        min={0.5}
        max={15}
        step={0.5}
        suffix="¢"
        onChange={(v) => dispatch({ type: "setMmEdgeCents", value: v })}
      />

      <button
        type="button"
        disabled={!canRfq}
        onClick={requestQuotes}
        className="h-9 rounded-md bg-primary px-3 text-sm text-white hover:bg-primary-dark disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        Request quotes
      </button>

      {revealStep > 0 && revealStep < 3 ? (
        <p className="flex items-center gap-2 text-sm text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Finding liquidity…
        </p>
      ) : null}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-1">Maker</th>
            <th className="py-1 text-right">Offer</th>
            <th className="py-1 text-right">Capacity</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q, i) => {
            const visible = revealStep > i;
            if (!visible) return null;
            const isBest = best?.maker === q.maker && revealStep >= 3;
            return (
              <tr key={q.maker} className="border-b border-border font-mono">
                <td className="py-2">
                  {q.maker}
                  {isBest ? (
                    <Badge variant="primary" className="ml-2">
                      Best offer
                    </Badge>
                  ) : null}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {fmtCents(q.offer)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {fmtContracts(q.capacity)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <section className="text-sm">
        <p className="mb-2 text-muted-foreground">Sensitivity (best offer)</p>
        <div className="flex flex-wrap gap-2">
          {sensitivity.map((s) => (
            <span
              key={s.edgeCents}
              className={`rounded-md border px-2 py-1 font-mono text-xs ${
                s.edgeCents === state.mmEdgeCents
                  ? "border-primary bg-primary-light text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {s.edgeCents}¢ → {fmtCents(s.bestOffer)} ·{" "}
              {fmtMoneyMillions(
                (N * s.bestOffer) / state.fxUsdPerLocal / 1e6,
                scenario.ccy,
              )}
            </span>
          ))}
        </div>
      </section>

      {revealStep >= 3 && quotes.length > 0 ? (
        <section className="space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Allocation
          </p>
          <table className="w-full text-sm">
            <tbody>
              {quotes.map((q) => {
                const alloc =
                  state.allocations.find((a) => a.maker === q.maker)?.size ??
                  0;
                return (
                  <tr key={q.maker} className="border-b border-border">
                    <td className="py-2">{q.maker}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        className="h-8 w-full rounded border border-border bg-muted px-2 font-mono text-sm"
                        value={alloc}
                        min={0}
                        max={q.capacity}
                        step={1000}
                        onChange={(e) =>
                          updateAllocation(
                            q.maker,
                            Number(e.target.value) || 0,
                          )
                        }
                      />
                    </td>
                    <td className="py-2 text-right font-mono text-xs text-muted-foreground">
                      max {fmtContracts(q.capacity)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="font-mono text-sm">
            Total {fmtContracts(totalAlloc)} / {fmtContracts(N)} · VWAP{" "}
            {vwap > 0 ? fmtCents(vwap) : "—"} · Premium{" "}
            {fmtMoneyMillions(premLocal, scenario.ccy)}
          </p>
          {totalAlloc !== N ? (
            <p className="text-sm text-destructive">
              Allocation must equal {fmtContracts(N)} contracts.
            </p>
          ) : null}
          {state.allocations.some((a) => a.size > 0 && a.size < blockMin) ? (
            <p className="text-sm text-destructive">
              Each block must independently meet the minimum (
              {blockMin.toLocaleString("en-US")}).
            </p>
          ) : null}
          <button
            type="button"
            disabled={!fullyAllocated || !d.ecpOk}
            onClick={() => {
              if (quotes.length === 0) return;
              const agreedAtMs = Date.now();
              const ticket = {
                allocations: state.allocations.map((a) => {
                  const q = quotes.find((x) => x.maker === a.maker);
                  return {
                    maker: a.maker,
                    size: a.size,
                    price: q?.offer ?? 0,
                  };
                }),
                agreedAtMs,
                step: "negotiate" as const,
                settleOutcome: null,
              };
              dispatch({ type: "setBlockTicket", ticket });
              dispatch({ type: "tick", nowMs: agreedAtMs });
              dispatch({ type: "setTicketModalOpen", open: true });
            }}
            className="h-9 rounded-md bg-primary px-3 text-sm text-white hover:bg-primary-dark disabled:opacity-50"
          >
            Agree in principle
          </button>
        </section>
      ) : null}
    </div>
  );
}