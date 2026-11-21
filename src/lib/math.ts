import type {
  BookAnalytics,
  DepthLevel,
  HedgeMode,
  HedgeOutputs,
  LadderOutputs,
  LadderRungOutput,
  LineItem,
  MarketSnapshot,
  Num,
  Scenario,
} from "@/lib/types";

/** Abramowitz & Stegun 7.1.26 — |error| < 7.5e-8 */
export function normCdf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * ax);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1 + sign * y);
}

export function computeLoss(lineItems: LineItem[]): number {
  let total = 0;
  for (const item of lineItems) {
    total += item.sign * item.amount.value;
  }
  return total;
}

export function marketMid(market: MarketSnapshot): number {
  const bid = market.bid?.value ?? null;
  const ask = market.ask?.value ?? null;
  if (bid !== null && ask !== null) {
    return (bid + ask) / 2;
  }
  if (market.last?.value !== undefined && market.last !== null) {
    return market.last.value;
  }
  return 0.5;
}

export function timingPrice(
  scenario: Scenario,
  timingId: "early" | "now" | "late",
  market: MarketSnapshot,
): number {
  const point = scenario.timing.find((t) => t.id === timingId);
  if (point?.price !== null && point?.price !== undefined) {
    return point.price.value;
  }
  return marketMid(market);
}

export function payoutTargetGross(c: number, L: number): number {
  return c * L;
}

export function payoutTargetNet(c: number, L: number, q: number): number {
  const denom = 1 - q;
  if (denom <= 0) {
    return c * L;
  }
  return (c * L) / denom;
}

export function contractsN(P: number, fxUsdPerLocal: number): number {
  return Math.round(P * 1e6 * fxUsdPerLocal);
}

export function premiumUsd(N: number, q: number, feePerContract: number): number {
  return N * q + N * feePerContract;
}

export function premiumLocal(premiumUsd: number, fxUsdPerLocal: number): number {
  return premiumUsd / fxUsdPerLocal / 1e6;
}

export function computeBaseline(
  scenario: Scenario,
  baselineOverride: Num | null,
  ladderBaseline?: number,
): number {
  if (baselineOverride !== null) {
    return baselineOverride.value;
  }
  if (ladderBaseline !== undefined) {
    return ladderBaseline;
  }
  if (scenario.baseline !== null) {
    return scenario.baseline.value;
  }
  return 0;
}

export function ladderBaselineM(spec: NonNullable<Scenario["ladder"]>): number {
  return (spec.gpus.value * spec.underwriteRate.value * spec.hours.value) / 1e6;
}

export type BinaryHedgeInputs = {
  lineItems: LineItem[];
  baseline: Num | null;
  scenario: Scenario;
  coverage: number;
  coverageOverride: number | null;
  netOfPremium: boolean;
  fxUsdPerLocal: number;
  feePerContract: number;
  viewProb: number;
  timingId: "early" | "now" | "late";
  priceOverride: number | null;
  selectedQuoteOffer: number | null;
  payoutTargetOverride: number | null;
};

export function executionPrice(inputs: BinaryHedgeInputs): number {
  if (inputs.priceOverride !== null) {
    return inputs.priceOverride;
  }
  if (inputs.selectedQuoteOffer !== null) {
    return inputs.selectedQuoteOffer;
  }
  const timing = timingPrice(
    inputs.scenario,
    inputs.timingId,
    inputs.scenario.market,
  );
  if (
    inputs.scenario.timing.length > 0 &&
    inputs.timingId !== "now"
  ) {
    const tp = inputs.scenario.timing.find((t) => t.id === inputs.timingId);
    if (tp?.price !== null && tp?.price !== undefined) {
      return tp.price.value;
    }
  }
  if (inputs.timingId === "now" || inputs.scenario.timing.length === 0) {
    return marketMid(inputs.scenario.market);
  }
  return timing;
}

export function computeHedgeOutputs(inputs: BinaryHedgeInputs): HedgeOutputs {
  const L = computeLoss(inputs.lineItems);
  const m = marketMid(inputs.scenario.market);
  const q = executionPrice(inputs);
  const c = inputs.coverageOverride ?? inputs.coverage;
  const P =
    inputs.payoutTargetOverride ??
    (inputs.netOfPremium
      ? payoutTargetNet(c, L, q)
      : payoutTargetGross(c, L));
  const N = contractsN(P, inputs.fxUsdPerLocal);
  const premUsd = premiumUsd(N, q, inputs.feePerContract);
  const premLocal = premiumLocal(premUsd, inputs.fxUsdPerLocal);
  const B = computeBaseline(inputs.scenario, inputs.baseline);
  const p = m;
  const outcomeNoEvent = B - premLocal;
  const outcomeEvent = B - L + P - premLocal;
  const swingUnhedged = L;
  const swingHedged = Math.abs(L - P);
  const swingReductionPct =
    swingUnhedged > 0 ? 1 - swingHedged / swingUnhedged : 0;
  const sigmaUnhedged = Math.sqrt(p * (1 - p)) * L;
  const sigmaHedged = Math.sqrt(p * (1 - p)) * Math.abs(L - P);
  const volReductionPct =
    sigmaUnhedged > 0 ? 1 - sigmaHedged / sigmaUnhedged : 0;
  const v = inputs.viewProb;
  const expectedPnlLocal = (N * (v - q)) / inputs.fxUsdPerLocal / 1e6;
  const breakevenProb = q + inputs.feePerContract;
  const overHedged = P - premLocal > L;
  const fxShockDown = P * (1 - 1 / 1.1);
  const fxShockUp = P * (1 / 0.9 - 1);

  return {
    lossL: L,
    marketMid: m,
    executionPrice: q,
    coverage: c,
    payoutTarget: P,
    contractsN: N,
    premiumUsd: premUsd,
    premiumLocal: premLocal,
    baseline: B,
    outcomeNoEvent,
    outcomeEvent,
    swingUnhedged,
    swingHedged,
    swingReductionPct,
    sigmaUnhedged,
    sigmaHedged,
    volReductionPct,
    expectedPnlLocal,
    breakevenProb,
    overHedged,
    fxShockDown,
    fxShockUp,
  };
}

export function ecpPass(
  totalAssetsUsd: number,
  netWorthUsd: number,
  hedgingPurpose: boolean,
): boolean {
  return totalAssetsUsd > 10_000_000 || (netWorthUsd > 1_000_000 && hedgingPurpose);
}

export function ladderStrikeK(
  underwrite: number,
  step: number,
  rungIndex: number,
): number {
  return underwrite - (rungIndex - 0.5) * step;
}

export function fairRungPrice(
  K: number,
  forward: number,
  vol: number,
  tYears: number,
): number {
  if (vol <= 0 || tYears <= 0 || forward <= 0 || K <= 0) {
    return 0;
  }
  const sigmaSqrtT = vol * Math.sqrt(tYears);
  const d =
    (Math.log(K / forward) + (vol * vol * tYears) / 2) / sigmaSqrtT;
  return normCdf(d);
}

export type LadderInputs = {
  gpus: number;
  underwrite: number;
  hours: number;
  forward: number;
  vol: number;
  tYears: number;
  step: number;
  rungs: number;
  coverage: number;
  stressPrice: number;
  mmEdge: number;
};

function payoutAtStress(
  stressS: number,
  rungs: LadderRungOutput[],
): number {
  let payoutContracts = 0;
  for (const r of rungs) {
    if (stressS < r.strikeK) {
      payoutContracts += r.contracts;
    }
  }
  return payoutContracts / 1e6;
}

export function computeLadderOutputs(inputs: LadderInputs): LadderOutputs {
  const nPerRung = inputs.gpus * inputs.hours * inputs.step * inputs.coverage;
  const rungs: LadderRungOutput[] = [];
  let fairPremium = 0;
  let execPremium = 0;

  for (let i = 1; i <= inputs.rungs; i++) {
    const K = ladderStrikeK(inputs.underwrite, inputs.step, i);
    const fair = fairRungPrice(K, inputs.forward, inputs.vol, inputs.tYears);
    const exec = fair + inputs.mmEdge;
    fairPremium += nPerRung * fair;
    execPremium += nPerRung * exec;
    rungs.push({
      rung: i,
      strikeK: K,
      contracts: nPerRung,
      fairPrice: fair,
      execPrice: exec,
    });
  }

  const U = inputs.underwrite;
  const S = inputs.stressPrice;
  const lossAtStress =
    (Math.max(U - S, 0) * inputs.gpus * inputs.hours) / 1e6;
  const payoutAtS = payoutAtStress(S, rungs);
  const baseline = (inputs.gpus * U * inputs.hours) / 1e6;
  const premM = execPremium / 1e6;
  const outcomeAtStress = baseline - lossAtStress + payoutAtS - premM;

  return {
    rungs,
    fairPremium: fairPremium / 1e6,
    execPremium: premM,
    lossAtStress,
    payoutAtStress: payoutAtS,
    baseline,
    outcomeAtStress,
  };
}

export function gpuLossL(stressPrice: number, scenario: Scenario): number {
  const ladder = scenario.ladder;
  if (!ladder) {
    return 0;
  }
  const U = ladder.underwriteRate.value;
  const S = stressPrice;
  return (Math.max(U - S, 0) * ladder.gpus.value * ladder.hours.value) / 1e6;
}

export function analyzeAskBook(
  levels: DepthLevel[],
  hedgeN: number,
): BookAnalytics {
  const sorted = [...levels].sort((a, b) => a.price - b.price);
  let total = 0;
  let cost = 0;
  let filled = 0;
  const cumulativeByPrice: { price: number; cumulative: number }[] = [];

  for (const lvl of sorted) {
    total += lvl.size;
    cumulativeByPrice.push({ price: lvl.price, cumulative: total });
  }

  for (const lvl of sorted) {
    if (filled >= hedgeN) break;
    const take = Math.min(lvl.size, hedgeN - filled);
    cost += take * lvl.price;
    filled += take;
  }

  const vwapSlippage = filled > 0 ? cost / filled : 0;
  const pctOfHedge = hedgeN > 0 ? (total / hedgeN) * 100 : 0;

  return {
    totalContracts: total,
    pctOfHedge,
    vwapSlippage,
    cumulativeByPrice,
  };
}

export type ModelCheckResult = {
  name: string;
  pass: boolean;
  detail: string;
};

export function runModelChecks(): ModelCheckResult[] {
  const results: ModelCheckResult[] = [];

  const calInputs: BinaryHedgeInputs = {
    lineItems: [
      {
        id: "revenue-drop",
        label: "Revenue drop if relegated to League One",
        amount: { value: 22, prov: { kind: "sourced", sourceId: "selfin-hotw" } },
        sign: 1,
      },
    ],
    baseline: { value: 60, prov: { kind: "sourced", sourceId: "selfin-hotw" } },
    scenario: {
      id: "calibration",
      name: "Calibrate",
      vertical: "sports",
      company: {
        name: "Calibration",
        descriptor: "",
        ownership: "",
        facts: [],
      },
      eventLabel: "",
      ccy: "GBP",
      fxUsdPerLocal: { value: 1, prov: { kind: "illustrative" } },
      baseline: { value: 60, prov: { kind: "sourced", sourceId: "selfin-hotw" } },
      baselineLabel: "",
      lineItems: [],
      market: {
        venue: "kalshi",
        ticker: null,
        title: "",
        last: null,
        bid: null,
        ask: null,
        bidSize: null,
        askSize: null,
        openInterest: null,
        volume: null,
        snapshotLabel: "",
        listed: false,
        category: "sports",
        notes: [],
        askBook: null,
      },
      hedgeMode: "binary",
      defaults: {
        coverage: 1,
        netOfPremium: false,
        viewProb: 0.5,
        feePerContract: 0,
        rfqEnabled: false,
      },
      timing: [],
      basis: [],
      ecp: {
        totalAssetsUsd: { value: 0, prov: { kind: "illustrative" } },
        netWorthUsd: { value: 0, prov: { kind: "illustrative" } },
        hedgingPurpose: true,
      },
      memoContext: { whyNow: "", nextSteps: [] },
    },
    coverage: 1,
    coverageOverride: 25 / 22,
    netOfPremium: false,
    fxUsdPerLocal: 1,
    feePerContract: 0,
    viewProb: 0.5,
    timingId: "now",
    priceOverride: 0.16,
    selectedQuoteOffer: null,
    payoutTargetOverride: 25,
  };

  const cal = computeHedgeOutputs(calInputs);
  const calPremiumOk = Math.abs(cal.premiumLocal - 4.0) < 0.05;
  const calOutOk =
    Math.abs(cal.outcomeNoEvent - 56.0) < 0.1 &&
    Math.abs(cal.outcomeEvent - 59.0) < 0.1;
  const calSwingOk =
    Math.abs(cal.swingUnhedged - 22) < 0.1 &&
    Math.abs(cal.swingHedged - 3) < 0.1;
  const calOverOk = !cal.overHedged;

  results.push({
    name: "Calibration premium £4.0m",
    pass: calPremiumOk,
    detail: `premiumLocal=${cal.premiumLocal.toFixed(2)}`,
  });
  results.push({
    name: "Calibration outcomes £56.0 / £59.0",
    pass: calOutOk,
    detail: `no-event=${cal.outcomeNoEvent.toFixed(1)}, event=${cal.outcomeEvent.toFixed(1)}`,
  });
  results.push({
    name: "Calibration swing £22 → £3",
    pass: calSwingOk,
    detail: `unhedged=${cal.swingUnhedged.toFixed(1)}, hedged=${cal.swingHedged.toFixed(1)}`,
  });
  results.push({
    name: "Calibration not over-hedged",
    pass: calOverOk,
    detail: `net payout ${(cal.payoutTarget - cal.premiumLocal).toFixed(1)} vs L ${cal.lossL}`,
  });

  const ladder = computeLadderOutputs({
    gpus: 16384,
    underwrite: 2.4,
    hours: 2160,
    forward: 2.95,
    vol: 0.9,
    tYears: 0.25,
    step: 0.2,
    rungs: 3,
    coverage: 1,
    stressPrice: 2.25,
    mmEdge: 0,
  });

  const nExpected = 7077888;
  const nOk = ladder.rungs.every((r) => r.contracts === nExpected);
  const pExpected = [0.371, 0.298, 0.226];
  const pOk = ladder.rungs.every(
    (r, i) => Math.abs(r.fairPrice - pExpected[i]) < 0.002,
  );
  const premOk = Math.abs(ladder.fairPremium - 6.34) / 6.34 < 0.01;
  const lossOk = Math.abs(ladder.lossAtStress - 5.31) / 5.31 < 0.01;
  const payOk = Math.abs(ladder.payoutAtStress - 7.08) / 7.08 < 0.01;

  results.push({
    name: "GPU ladder n=7,077,888 per rung",
    pass: nOk,
    detail: ladder.rungs.map((r) => r.contracts).join(", "),
  });
  results.push({
    name: "GPU fair p ≈ 0.371 / 0.298 / 0.226",
    pass: pOk,
    detail: ladder.rungs.map((r) => r.fairPrice.toFixed(3)).join(", "),
  });
  results.push({
    name: "GPU fair premium ≈ $6.34m",
    pass: premOk,
    detail: `$${ladder.fairPremium.toFixed(2)}m`,
  });
  results.push({
    name: "GPU S=$2.25 loss $5.31m / payout $7.08m",
    pass: lossOk && payOk,
    detail: `loss=$${ladder.lossAtStress.toFixed(2)}m, payout=$${ladder.payoutAtStress.toFixed(2)}m`,
  });

  const ladder180 = computeLadderOutputs({
    gpus: 16384,
    underwrite: 2.4,
    hours: 2160,
    forward: 2.95,
    vol: 0.9,
    tYears: 0.25,
    step: 0.2,
    rungs: 3,
    coverage: 1,
    stressPrice: 1.8,
    mmEdge: 0,
  });
  const s180LossOk = Math.abs(ladder180.lossAtStress - 21.23) / 21.23 < 0.01;
  const s180PayOk = Math.abs(ladder180.payoutAtStress - 21.23) / 21.23 < 0.01;
  results.push({
    name: "GPU S=$1.80 loss & payout ≈ $21.23m",
    pass: s180LossOk && s180PayOk,
    detail: `loss=$${ladder180.lossAtStress.toFixed(2)}m, payout=$${ladder180.payoutAtStress.toFixed(2)}m`,
  });

  const cdfZero = Math.abs(normCdf(0) - 0.5) < 1e-6;
  results.push({
    name: "normCdf(0) = 0.5",
    pass: cdfZero,
    detail: `normCdf(0)=${normCdf(0)}`,
  });

  return results;
}

export function hedgeModeLoss(
  mode: HedgeMode,
  lineItems: LineItem[],
  stressPrice: number,
  scenario: Scenario,
): number {
  if (mode === "ladder") {
    return gpuLossL(stressPrice, scenario);
  }
  return computeLoss(lineItems);
}