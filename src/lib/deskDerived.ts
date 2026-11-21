import { kalshiBlockMin } from "@/data/venues";
import {
  type BinaryHedgeInputs,
  analyzeAskBook,
  computeHedgeOutputs,
  computeLadderOutputs,
  ecpPass,
  marketMid,
} from "@/lib/math";
import { allocationVwap, bestQuote } from "@/lib/quotes";
import { computeRoute } from "@/lib/routing";
import type { BookAnalytics, DeskState, HedgeOutputs, LadderOutputs, RouteDecision } from "@/lib/types";

export function binaryInputsFromState(state: DeskState): BinaryHedgeInputs {
  let selectedQuoteOffer: number | null = null;
  if (state.quotes && state.allocations.length > 0) {
    const vwap = allocationVwap(state.allocations, state.quotes);
    if (vwap > 0) {
      selectedQuoteOffer = vwap;
    }
  } else if (state.quotes) {
    const best = bestQuote(state.quotes);
    if (best) {
      selectedQuoteOffer = best.offer;
    }
  }

  return {
    lineItems: state.lineItems,
    baseline: state.baseline,
    scenario: state.scenario,
    coverage: state.coverage,
    coverageOverride: state.coverageOverride,
    netOfPremium: state.netOfPremium,
    fxUsdPerLocal: state.fxUsdPerLocal,
    feePerContract: state.feePerContract,
    viewProb: state.viewProb,
    timingId: state.timingId,
    priceOverride: state.priceOverride,
    selectedQuoteOffer,
    payoutTargetOverride: state.payoutTargetOverride,
  };
}

export type DeskDerived = {
  ecpOk: boolean;
  hedge: HedgeOutputs | null;
  ladder: LadderOutputs | null;
  route: RouteDecision;
  book: BookAnalytics | null;
  contractsN: number;
  mid: number;
  blockMin: number;
};

export function deriveDesk(state: DeskState): DeskDerived {
  const scenario = state.scenario;
  const mid = marketMid(scenario.market);
  const ecpOk = ecpPass(state.ecpAssets, state.ecpNetWorth, state.ecpHedging);
  const blockMin = kalshiBlockMin(scenario.market.category);

  let hedge: HedgeOutputs | null = null;
  let ladder: LadderOutputs | null = null;
  let contractsN = 0;

  if (scenario.hedgeMode === "binary") {
    hedge = computeHedgeOutputs(binaryInputsFromState(state));
    contractsN = hedge.contractsN;
  } else if (scenario.ladder) {
    ladder = computeLadderOutputs({
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
    contractsN = Math.round(
      ladder.rungs.reduce((s, r) => s + r.contracts, 0) * state.fxUsdPerLocal,
    );
  }

  const route = computeRoute({
    contractsN,
    market: scenario.market,
    scenario,
    ecpPass: ecpOk,
  });

  const book =
    scenario.market.askBook !== null
      ? analyzeAskBook(scenario.market.askBook.levels, contractsN)
      : null;

  return { ecpOk, hedge, ladder, route, book, contractsN, mid, blockMin };
}

export function calibrationModelMatch(state: DeskState): boolean {
  if (state.scenarioId !== "calibration") {
    return false;
  }
  const d = deriveDesk(state);
  if (d.hedge === null) {
    return false;
  }
  const h = d.hedge;
  return (
    Math.abs(h.outcomeNoEvent - 56.0) < 0.1 &&
    Math.abs(h.outcomeEvent - 59.0) < 0.1 &&
    Math.abs(h.swingUnhedged - 22) < 0.1 &&
    Math.abs(h.swingHedged - 3) < 0.1
  );
}