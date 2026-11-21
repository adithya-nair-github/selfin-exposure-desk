import { computeRoute } from "@/lib/routing";
import { bestQuote } from "@/lib/quotes";
import {
  type BinaryHedgeInputs,
  computeHedgeOutputs,
  computeLadderOutputs,
  ecpPass,
  executionPrice,
  ladderBaselineM,
  marketMid,
} from "@/lib/math";
import {
  fmtCents,
  fmtContracts,
  fmtMoneyMillions,
  fmtPct,
} from "@/lib/format";
import type { DeskState, MemoViewModel, Scenario } from "@/lib/types";

export type MemoInputs = {
  state: DeskState;
  hedgeModeBinary: boolean;
};

function collectSourceIds(scenario: Scenario): string[] {
  const ids = new Set<string>();
  for (const f of scenario.company.facts) {
    if (f.prov.kind === "sourced") ids.add(f.prov.sourceId);
    if (f.prov.kind === "unverified") ids.add(f.prov.sourceId);
  }
  if (scenario.market.last?.prov.kind === "sourced") {
    ids.add(scenario.market.last.prov.sourceId);
  }
  for (const b of scenario.basis) {
    if (b.sourceId) ids.add(b.sourceId);
  }
  return [...ids];
}

function worstBasisRisks(scenario: Scenario, n = 3): string[] {
  const sorted = [...scenario.basis].sort((a, b) => a.score - b.score);
  return sorted.slice(0, n).map((b) => `${b.label}: ${b.detail}`);
}

export function buildMemoViewModel(inputs: MemoInputs): MemoViewModel {
  const { state } = inputs;
  const scenario = state.scenario;
  const mid = marketMid(scenario.market);
  const ecpOk = ecpPass(state.ecpAssets, state.ecpNetWorth, state.ecpHedging);

  let contractsN = 0;
  let premiumLocal = 0;
  let premiumUsd = 0;
  let payoutTarget = 0;
  let price = mid;
  let liquidityNote = "";
  let payoffRows: MemoViewModel["payoffRows"] = [];

  if (scenario.hedgeMode === "binary") {
    const selectedOffer =
      state.allocations.length > 0 && state.quotes
        ? state.quotes.find((q) => q.maker === state.allocations[0]?.maker)
            ?.offer ?? null
        : null;

    const bin: BinaryHedgeInputs = {
      lineItems: state.lineItems,
      baseline: state.baseline,
      scenario,
      coverage: state.coverage,
      coverageOverride: state.coverageOverride,
      netOfPremium: state.netOfPremium,
      fxUsdPerLocal: state.fxUsdPerLocal,
      feePerContract: state.feePerContract,
      viewProb: state.viewProb,
      timingId: state.timingId,
      priceOverride: state.priceOverride,
      selectedQuoteOffer: selectedOffer,
      payoutTargetOverride: state.payoutTargetOverride,
    };
    const h = computeHedgeOutputs(bin);
    contractsN = h.contractsN;
    premiumLocal = h.premiumLocal;
    premiumUsd = h.premiumUsd;
    payoutTarget = h.payoutTarget;
    price = executionPrice(bin);
    payoffRows = [
      {
        label: "No event",
        unhedged: fmtMoneyMillions(h.baseline, scenario.ccy),
        hedged: fmtMoneyMillions(h.outcomeNoEvent, scenario.ccy),
      },
      {
        label: "Event",
        unhedged: fmtMoneyMillions(h.baseline - h.lossL, scenario.ccy),
        hedged: fmtMoneyMillions(h.outcomeEvent, scenario.ccy),
      },
    ];
  } else if (scenario.ladder) {
    const ladder = computeLadderOutputs({
      gpus: scenario.ladder.gpus.value,
      underwrite: scenario.ladder.underwriteRate.value,
      hours: scenario.ladder.hours.value,
      forward: state.ladderForward,
      vol: state.ladderVol,
      tYears: scenario.ladder.tYears.value,
      step: state.ladderStep,
      rungs: state.ladderRungs,
      coverage: state.coverage,
      stressPrice: state.stressPrice,
      mmEdge: state.mmEdgeCents / 100,
    });
    premiumLocal = ladder.execPremium;
    premiumUsd = ladder.execPremium * 1e6;
    payoutTarget = ladder.payoutAtStress;
    const base = ladderBaselineM(scenario.ladder);
    payoffRows = [
      {
        label: `Stress @ $${state.stressPrice.toFixed(2)}/hr`,
        unhedged: fmtMoneyMillions(base - ladder.lossAtStress, scenario.ccy),
        hedged: fmtMoneyMillions(ladder.outcomeAtStress, scenario.ccy),
      },
      {
        label: "At underwrite",
        unhedged: fmtMoneyMillions(base, scenario.ccy),
        hedged: fmtMoneyMillions(base - ladder.execPremium, scenario.ccy),
      },
    ];
  }

  const route = computeRoute({
    contractsN,
    market: scenario.market,
    scenario,
    ecpPass: ecpOk,
  });

  const oi = scenario.market.openInterest?.value;
  if (oi) {
    liquidityNote = `Hedge ${fmtContracts(contractsN)} vs OI ${fmtContracts(oi)} (${(contractsN / oi).toFixed(0)}×)`;
  } else if (scenario.market.askBook) {
    const total = scenario.market.askBook.levels.reduce(
      (s, l) => s + l.size,
      0,
    );
    liquidityNote = `Visible ask book ~${Math.round(total).toLocaleString("en-US")} contracts vs hedge ${fmtContracts(contractsN)}`;
  } else {
    liquidityNote = "No listed book: custom listing or OTC";
  }

  if (state.blockTicket && state.blockTicket.allocations.length > 0) {
    const vwap =
      state.blockTicket.allocations.reduce(
        (s, a) => s + a.size * a.price,
        0,
      ) /
      state.blockTicket.allocations.reduce((s, a) => s + a.size, 0);
    price = vwap;
  } else if (state.quotes) {
    const best = bestQuote(state.quotes);
    if (best) price = best.offer;
  }

  const premPct =
    payoutTarget > 0 ? (premiumLocal / payoutTarget) * 100 : 0;

  return {
    scenarioName: scenario.name,
    companyName: scenario.company.name,
    preparedDate: "21 Nov 2026",
    stamp:
      "Illustrative · Not an offer or solicitation · Not legal, tax or accounting advice",
    marketImplied: fmtPct(mid),
    venueTicker: scenario.market.ticker
      ? `${scenario.market.venue} · ${scenario.market.ticker}`
      : scenario.market.title,
    snapshotLabel: scenario.market.snapshotLabel,
    liquidityNote,
    hedgeCost: fmtMoneyMillions(premiumLocal, scenario.ccy),
    contractsFormatted: fmtContracts(contractsN),
    priceFormatted: fmtCents(price),
    premiumLocal: fmtMoneyMillions(premiumLocal, scenario.ccy),
    premiumUsd: fmtMoneyMillions(premiumUsd / 1e6, "USD"),
    premiumPctPayout: `${premPct.toFixed(1)}%`,
    unhedgedNote: `Unhedged swing ${scenario.hedgeMode === "binary" ? "per payoff table" : "at stress"}`,
    payoffRows,
    route: route.route ?? "Blocked",
    routeReasons: route.reasons,
    basisRisks: worstBasisRisks(scenario),
    whyNow: scenario.memoContext.whyNow,
    nextSteps: scenario.memoContext.nextSteps,
    sourceIds: collectSourceIds(scenario),
    disclaimer:
      "This memo is illustrative only. Not an offer, solicitation, or advice.",
  };
}

export function buildMemoMarkdown(vm: MemoViewModel): string {
  const lines: string[] = [];
  lines.push(`# Exposure memo · ${vm.companyName}`);
  lines.push("");
  lines.push(`**${vm.stamp}**`);
  lines.push(`Prepared ${vm.preparedDate}`);
  lines.push("");
  lines.push("## What the market implies");
  lines.push(`- Implied probability: **${vm.marketImplied}**`);
  lines.push(`- ${vm.venueTicker}`);
  lines.push(`- ${vm.snapshotLabel}`);
  lines.push(`- Liquidity: ${vm.liquidityNote}`);
  lines.push("");
  lines.push("## What a hedge would cost");
  lines.push(`- Contracts: **${vm.contractsFormatted}**`);
  lines.push(`- Price (indicative): **${vm.priceFormatted}**`);
  lines.push(
    `- Premium: **${vm.premiumLocal}** (${vm.premiumUsd} USD) · ${vm.premiumPctPayout} of payout`,
  );
  lines.push("");
  lines.push("## Payoffs");
  for (const row of vm.payoffRows) {
    lines.push(
      `- **${row.label}**: unhedged ${row.unhedged} · hedged ${row.hedged}`,
    );
  }
  lines.push("");
  lines.push("## Route");
  lines.push(`**${vm.route}**`);
  for (const r of vm.routeReasons) {
    lines.push(`- ${r}`);
  }
  lines.push("");
  lines.push("## Basis risks");
  for (const b of vm.basisRisks) {
    lines.push(`- ${b}`);
  }
  lines.push("");
  lines.push("## Why now");
  lines.push(vm.whyNow);
  lines.push("");
  lines.push("## Next steps");
  for (const s of vm.nextSteps) {
    lines.push(`1. ${s}`);
  }
  lines.push("");
  lines.push("---");
  lines.push(vm.disclaimer);
  return lines.join("\n");
}

export function buildMemoFromState(state: DeskState): {
  viewModel: MemoViewModel;
  markdown: string;
} {
  const viewModel = buildMemoViewModel({
    state,
    hedgeModeBinary: state.scenario.hedgeMode === "binary",
  });
  const markdown = buildMemoMarkdown(viewModel);
  return { viewModel, markdown };
}