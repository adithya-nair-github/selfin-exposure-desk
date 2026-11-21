export type Provenance =
  | { kind: "sourced"; sourceId: string }
  | { kind: "unverified"; sourceId: string; note: string }
  | { kind: "illustrative"; note?: string };

export type Source = {
  id: string;
  label: string;
  url: string;
  accessed: "2026-11-21";
  status: "checked" | "unverified";
};

export type ScenarioId = "coventry" | "aircanada" | "gpu" | "calibration";

export type DepthLevel = { price: number; size: number };

export type Num = { value: number; prov: Provenance };

export type Ccy = "GBP" | "USD" | "CAD";

export type Vertical = "sports" | "aviation" | "compute";

export type VenueId = "kalshi" | "polymarket" | "otc";

export type HedgeMode = "binary" | "ladder";

export type LineItem = {
  id: string;
  label: string;
  amount: Num;
  sign: 1 | -1;
};

export type MarketSnapshot = {
  venue: VenueId;
  ticker: string | null;
  title: string;
  last: Num | null;
  bid: Num | null;
  ask: Num | null;
  bidSize: number | null;
  askSize: number | null;
  openInterest: Num | null;
  volume: Num | null;
  snapshotLabel: string;
  listed: boolean;
  category: "sports" | "non-sports";
  notes: string[];
  askBook: {
    levels: DepthLevel[];
    prov: Provenance;
    snapshotLabel: string;
  } | null;
};

export type LadderSpec = {
  gpus: Num;
  underwriteRate: Num;
  hours: Num;
  forward: Num;
  vol: Num;
  tYears: Num;
  step: number;
  rungs: number;
  spot: Num;
};

export type BasisFactor = {
  id: string;
  label: string;
  score: 1 | 2 | 3 | 4 | 5;
  detail: string;
  sourceId?: string;
};

export type Fact = { label: string; value: string; prov: Provenance };

export type TimingPoint = {
  id: "early" | "now" | "late";
  label: string;
  price: Num | null;
};

export type Scenario = {
  id: ScenarioId;
  name: string;
  vertical: Vertical;
  company: {
    name: string;
    descriptor: string;
    ticker?: string;
    ownership: string;
    facts: Fact[];
  };
  eventLabel: string;
  ccy: Ccy;
  fxUsdPerLocal: Num;
  baseline: Num | null;
  baselineLabel: string;
  lineItems: LineItem[];
  market: MarketSnapshot;
  hedgeMode: HedgeMode;
  ladder?: LadderSpec;
  defaults: {
    coverage: number;
    coverageOverride?: number;
    netOfPremium: boolean;
    viewProb: number | null;
    feePerContract: number;
    priceOverride?: number;
    stressPrice?: number;
    payoutTargetOverride?: number;
    rfqEnabled: boolean;
  };
  timing: TimingPoint[];
  basis: BasisFactor[];
  ecp: {
    totalAssetsUsd: Num;
    netWorthUsd: Num;
    hedgingPurpose: boolean;
  };
  memoContext: { whyNow: string; nextSteps: string[] };
};

export type ListedStatus = "listed-snapshot" | "listed-series" | "custom";

export type Account = {
  id: string;
  company: string;
  vertical: Vertical;
  tickerOrOwnership: string;
  keyEvent: string;
  mappedSeries: string;
  listedStatus: ListedStatus;
  openInterest: number | null;
  exposureAnchor: Fact | null;
  scenarioId: ScenarioId | null;
};

export type MmQuote = {
  maker: "MM 1" | "MM 2" | "MM 3";
  offer: number;
  capacity: number;
  edgeMultiplier: number;
};

export type BlockTicket = {
  allocations: { maker: MmQuote["maker"]; size: number; price: number }[];
  agreedAtMs: number;
  step: "negotiate" | "prefund" | "submit" | "execute" | "settle";
  settleOutcome: "event" | "no-event" | null;
};

export type DeskTab =
  | "coverage"
  | "exposure"
  | "market"
  | "hedge"
  | "quote"
  | "memo";

export type Allocation = { maker: MmQuote["maker"]; size: number };

export type RouteKind =
  | "CLOB"
  | "Kalshi block"
  | "Polymarket US block"
  | "Custom listing → block"
  | "OTC swap";

export type RouteDecision = {
  route: RouteKind | null;
  reasons: string[];
  checks: { label: string; pass: boolean | null; detail: string }[];
  polymarketAlternative: boolean;
};

export type HedgeOutputs = {
  lossL: number;
  marketMid: number;
  executionPrice: number;
  coverage: number;
  payoutTarget: number;
  contractsN: number;
  premiumUsd: number;
  premiumLocal: number;
  baseline: number;
  outcomeNoEvent: number;
  outcomeEvent: number;
  swingUnhedged: number;
  swingHedged: number;
  swingReductionPct: number;
  sigmaUnhedged: number;
  sigmaHedged: number;
  volReductionPct: number;
  expectedPnlLocal: number;
  breakevenProb: number;
  overHedged: boolean;
  fxShockDown: number;
  fxShockUp: number;
};

export type LadderRungOutput = {
  rung: number;
  strikeK: number;
  contracts: number;
  fairPrice: number;
  execPrice: number;
};

export type LadderOutputs = {
  rungs: LadderRungOutput[];
  fairPremium: number;
  execPremium: number;
  lossAtStress: number;
  payoutAtStress: number;
  baseline: number;
  outcomeAtStress: number;
};

export type BookAnalytics = {
  totalContracts: number;
  pctOfHedge: number;
  vwapSlippage: number;
  cumulativeByPrice: { price: number; cumulative: number }[];
};

export type MemoViewModel = {
  scenarioName: string;
  companyName: string;
  preparedDate: string;
  stamp: string;
  marketImplied: string;
  venueTicker: string;
  snapshotLabel: string;
  liquidityNote: string;
  hedgeCost: string;
  contractsFormatted: string;
  priceFormatted: string;
  premiumLocal: string;
  premiumUsd: string;
  premiumPctPayout: string;
  unhedgedNote: string;
  payoffRows: { label: string; unhedged: string; hedged: string }[];
  route: string;
  routeReasons: string[];
  basisRisks: string[];
  whyNow: string;
  nextSteps: string[];
  sourceIds: string[];
  disclaimer: string;
};

export type DeskState = {
  scenarioId: ScenarioId;
  scenario: Scenario;
  coverage: number;
  netOfPremium: boolean;
  viewProb: number;
  feePerContract: number;
  fxUsdPerLocal: number;
  timingId: "early" | "now" | "late";
  mmEdgeCents: number;
  quotes: MmQuote[] | null;
  quoteRevealStep: number;
  allocations: Allocation[];
  selectedMaker: MmQuote["maker"] | null;
  blockTicket: BlockTicket | null;
  nowMs: number | null;
  statusMessage: string;
  stressPrice: number;
  ladderRungs: number;
  ladderStep: number;
  ladderVol: number;
  ladderForward: number;
  lineItems: LineItem[];
  baseline: Num | null;
  ecpAssets: number;
  ecpNetWorth: number;
  ecpHedging: boolean;
  activeTab: DeskTab;
  objectionsOpen: boolean;
  ticketModalOpen: boolean;
  coverageOverride: number | null;
  priceOverride: number | null;
  payoutTargetOverride: number | null;
};

export type Action =
  | { type: "restore"; id: ScenarioId }
  | { type: "setScenario"; id: ScenarioId }
  | { type: "reset" }
  | { type: "setCoverage"; value: number }
  | { type: "setCoverageOverride"; value: number | null }
  | { type: "setNetOfPremium"; value: boolean }
  | { type: "setViewProb"; value: number }
  | { type: "setFeePerContract"; value: number }
  | { type: "setFxUsdPerLocal"; value: number }
  | { type: "setTimingId"; id: "early" | "now" | "late" }
  | { type: "setMmEdgeCents"; value: number }
  | { type: "setQuotes"; quotes: MmQuote[] | null }
  | { type: "setQuoteRevealStep"; step: number }
  | { type: "setAllocations"; allocations: Allocation[] }
  | { type: "setSelectedMaker"; maker: MmQuote["maker"] | null }
  | { type: "setBlockTicket"; ticket: BlockTicket | null }
  | { type: "tick"; nowMs: number }
  | { type: "setStatusMessage"; message: string }
  | { type: "setStressPrice"; value: number }
  | { type: "setLadderRungs"; value: number }
  | { type: "setLadderStep"; value: number }
  | { type: "setLadderVol"; value: number }
  | { type: "setLadderForward"; value: number }
  | { type: "updateLineItem"; id: string; amount: number }
  | { type: "setBaseline"; value: number }
  | { type: "setEcpAssets"; value: number }
  | { type: "setEcpNetWorth"; value: number }
  | { type: "setEcpHedging"; value: boolean }
  | { type: "setActiveTab"; tab: DeskTab }
  | { type: "setObjectionsOpen"; open: boolean }
  | { type: "setTicketModalOpen"; open: boolean }
  | { type: "setPriceOverride"; value: number | null }
  | { type: "setPayoutTargetOverride"; value: number | null }
  | { type: "advanceTicketStep" }
  | { type: "setSettleOutcome"; outcome: "event" | "no-event" };