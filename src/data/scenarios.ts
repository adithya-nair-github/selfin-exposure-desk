import type { DepthLevel, Scenario, ScenarioId } from "@/lib/types";

const COVENTRY_ASK_BOOK: DepthLevel[] = [
  { price: 0.59, size: 41.77 },
  { price: 0.6, size: 2600 },
  { price: 0.61, size: 260.14 },
  { price: 0.62, size: 43.77 },
  { price: 0.63, size: 696.43 },
  { price: 0.64, size: 99.04 },
  { price: 0.68, size: 161.75 },
  { price: 0.69, size: 215.72 },
  { price: 0.74, size: 138.73 },
  { price: 0.75, size: 1.64 },
  { price: 0.79, size: 285.93 },
  { price: 0.81, size: 2078 },
  { price: 0.86, size: 141.85 },
  { price: 0.89, size: 100 },
  { price: 0.93, size: 4.91 },
  { price: 0.94, size: 151 },
  { price: 0.95, size: 10000 },
  { price: 0.97, size: 507.85 },
  { price: 0.98, size: 100 },
  { price: 0.99, size: 112 },
];

export const SCENARIO_IDS: ScenarioId[] = [
  "coventry",
  "aircanada",
  "gpu",
  "calibration",
];

const coventry: Scenario = {
  id: "coventry",
  name: "Coventry City FC · EPL relegation 2026-27",
  vertical: "sports",
  company: {
    name: "Coventry City FC",
    descriptor:
      "Promoted to the Premier League for 2026-27 as Championship winners",
    ownership: "Private · owner Doug King",
    facts: [
      {
        label: "Promotion uplift (3 seasons, minimum)",
        value: "≥ £210m",
        prov: { kind: "sourced", sourceId: "deloitte-cov" },
      },
      {
        label: "Uplift if they survive year one",
        value: "up to £365m",
        prov: { kind: "sourced", sourceId: "deloitte-cov" },
      },
      {
        label: "Owner profile",
        value: "Commodities trader (FT)",
        prov: { kind: "sourced", sourceId: "ft-king" },
      },
    ],
  },
  eventLabel: "Relegated from the Premier League at the end of 2026-27",
  ccy: "GBP",
  fxUsdPerLocal: {
    value: 1.33,
    prov: { kind: "illustrative", note: "Set to today's GBP/USD" },
  },
  baseline: {
    value: 150,
    prov: { kind: "illustrative" },
  },
  baselineLabel: "Budgeted 2027-28 revenue if they stay up",
  lineItems: [
    {
      id: "pl-central",
      label: "Premier League central payments (lost)",
      amount: { value: 109, prov: { kind: "sourced", sourceId: "pl-central" } },
      sign: 1,
    },
    {
      id: "champ-central",
      label: "Championship central distribution (gained)",
      amount: { value: 11, prov: { kind: "sourced", sourceId: "parachute" } },
      sign: -1,
    },
    {
      id: "parachute",
      label: "Parachute payment, year 1 (55% of relegated-club share)",
      amount: { value: 55, prov: { kind: "sourced", sourceId: "parachute" } },
      sign: -1,
    },
    {
      id: "mc-drop",
      label: "Matchday & commercial drop",
      amount: { value: 18, prov: { kind: "illustrative" } },
      sign: 1,
    },
    {
      id: "wage-clauses",
      label: "Relegation wage-clause savings (natural hedge)",
      amount: { value: 12, prov: { kind: "illustrative" } },
      sign: -1,
    },
  ],
  market: {
    venue: "kalshi",
    ticker: "KXEPLRELEGATION-27-COV",
    title: "Will Coventry City be relegated from EPL in 2026-27 Season?",
    last: { value: 0.54, prov: { kind: "sourced", sourceId: "kalshi-api-epl" } },
    bid: { value: 0.54, prov: { kind: "sourced", sourceId: "kalshi-api-epl" } },
    ask: { value: 0.59, prov: { kind: "sourced", sourceId: "kalshi-api-epl" } },
    bidSize: 9,
    askSize: 42,
    openInterest: {
      value: 11714,
      prov: { kind: "sourced", sourceId: "kalshi-api-epl" },
    },
    volume: {
      value: 26493,
      prov: { kind: "sourced", sourceId: "kalshi-api-epl" },
    },
    snapshotLabel: "Kalshi public API · 21 Nov 2026, 02:40 IST",
    listed: true,
    category: "sports",
    notes: [
      "Thin book: 42 contracts at the best ask; 17,741 contracts on the whole visible ask side",
      "Peer clubs: Hull City 53¢ (OI 23.1k), Crystal Palace 39¢ (OI 4.3k), Ipswich 35¢ (OI 6.9k), Sunderland 29¢ (OI 3.4k)",
    ],
    askBook: {
      levels: COVENTRY_ASK_BOOK,
      prov: { kind: "sourced", sourceId: "kalshi-book-cov" },
      snapshotLabel: "Kalshi order book · 21 Nov 2026, ~02:55 IST",
    },
  },
  hedgeMode: "binary",
  defaults: {
    coverage: 0.5,
    netOfPremium: false,
    viewProb: 0.5,
    feePerContract: 0,
    rfqEnabled: true,
  },
  timing: [
    {
      id: "early",
      label: "August, pre-season",
      price: { value: 0.38, prov: { kind: "illustrative" } },
    },
    {
      id: "now",
      label: "Today (screen mid)",
      price: null,
    },
    {
      id: "late",
      label: "February, in the bottom three",
      price: { value: 0.78, prov: { kind: "illustrative" } },
    },
  ],
  basis: [
    {
      id: "resolution",
      label: "Resolution match",
      score: 5,
      detail: "Contract resolves on the club's own relegation",
    },
    {
      id: "amount",
      label: "Amount match",
      score: 3,
      detail:
        "Revenue loss is an estimate; parachute and wage clauses move it",
    },
    {
      id: "currency",
      label: "Currency",
      score: 3,
      detail: "GBP exposure vs USD contract; FX moves the cover",
    },
    {
      id: "venue",
      label: "Venue/legal",
      score: 2,
      detail:
        "6th Cir. (25 Sep 2026) held sports event contracts are not swaps because sporting events lack an economic consequence; a club's relegation revenue loss is exactly that consequence. Still keep an OTC fallback",
      sourceId: "ca6-schuler",
    },
    {
      id: "integrity",
      label: "Integrity",
      score: 4,
      detail: "Club insiders must not trade; document the insider policy",
    },
  ],
  ecp: {
    totalAssetsUsd: {
      value: 250_000_000,
      prov: { kind: "illustrative" },
    },
    netWorthUsd: {
      value: 20_000_000,
      prov: { kind: "illustrative" },
    },
    hedgingPurpose: true,
  },
  memoContext: {
    whyNow:
      "The market prices Coventry's relegation near a coin flip. Every week in the bottom half raises the cost of protection.",
    nextSteps: [
      "Confirm the 2027-28 budget and covenant headroom with the CFO",
      "Choose cover: covenant gap vs full revenue gap",
      "RFQ to three market makers for a sports block (≥50,000 contracts)",
      "Board approval and ECP/onboarding pack",
    ],
  },
};

const aircanada: Scenario = {
  id: "aircanada",
  name: "Air Canada · flight-attendant strike (back-test, Aug 2025)",
  vertical: "aviation",
  company: {
    name: "Air Canada",
    descriptor: "Canada's largest airline · TSX: AC",
    ticker: "TSX: AC",
    ownership: "Public",
    facts: [
      {
        label: "Q3 2025 strike impact on operating income",
        value: "C$375m",
        prov: { kind: "sourced", sourceId: "ac-q3" },
      },
      {
        label: "Lost revenue / avoided costs / incremental costs",
        value: "C$430m / C$145m / C$90m",
        prov: { kind: "sourced", sourceId: "ac-q3" },
      },
      {
        label: "Peer datapoint: WestJet one-day strike (Aug 2026)",
        value: "~C$60m Q3 EBITDA, ~900 cancellations (S&P)",
        prov: { kind: "sourced", sourceId: "sp-westjet" },
      },
      {
        label: "Q3 2025 reported operating income, incl. strike impact",
        value: "C$284m",
        prov: { kind: "sourced", sourceId: "ac-q3" },
      },
    ],
  },
  eventLabel: "CUPE flight attendants strike before 1 Sep 2025",
  ccy: "CAD",
  fxUsdPerLocal: {
    value: 0.72,
    prov: { kind: "illustrative" },
  },
  baseline: {
    value: 1040,
    prov: { kind: "sourced", sourceId: "ac-q3" },
  },
  baselineLabel: "Q3 2024 operating income (pre-strike comparator)",
  lineItems: [
    {
      id: "lost-rev",
      label: "Lost passenger revenue",
      amount: { value: 430, prov: { kind: "sourced", sourceId: "ac-q3" } },
      sign: 1,
    },
    {
      id: "avoided",
      label: "Avoided costs (fuel, landing fees…)",
      amount: { value: 145, prov: { kind: "sourced", sourceId: "ac-q3" } },
      sign: -1,
    },
    {
      id: "incremental",
      label: "Incremental costs (rebooking, crew…)",
      amount: { value: 90, prov: { kind: "sourced", sourceId: "ac-q3" } },
      sign: 1,
    },
  ],
  market: {
    venue: "kalshi",
    ticker: null,
    title: "Custom contract: Will Air Canada flight attendants strike before Sep 1, 2025?",
    last: {
      value: 0.25,
      prov: { kind: "illustrative", note: "Back-test entry price is illustrative" },
    },
    bid: { value: 0.23, prov: { kind: "illustrative" } },
    ask: { value: 0.27, prov: { kind: "illustrative" } },
    bidSize: null,
    askSize: null,
    openInterest: null,
    volume: null,
    snapshotLabel: "Back-test · entry 1 Jul 2025 (illustrative)",
    listed: false,
    category: "non-sports",
    notes: [
      "Back-test entry price is illustrative; Kalshi did list an Air Canada strike-duration market, KXAIRCANADASTRIKE-25",
    ],
    askBook: null,
  },
  hedgeMode: "binary",
  defaults: {
    coverage: 0.8,
    netOfPremium: false,
    viewProb: 0.35,
    feePerContract: 0,
    rfqEnabled: true,
  },
  timing: [
    {
      id: "early",
      label: "June (bargaining stalls)",
      price: { value: 0.18, prov: { kind: "illustrative" } },
    },
    {
      id: "now",
      label: "1 Jul 2025 (entry)",
      price: { value: 0.25, prov: { kind: "illustrative" } },
    },
    {
      id: "late",
      label: "Strike-vote result public",
      price: { value: 0.62, prov: { kind: "illustrative" } },
    },
  ],
  basis: [
    {
      id: "resolution",
      label: "Resolution",
      score: 4,
      detail:
        "Strike occurrence matches the trigger, but partial or rotating strikes need precise terms",
    },
    {
      id: "amount",
      label: "Amount",
      score: 2,
      detail:
        "Binary payout vs strike duration: C$375m multi-day vs ~C$60m one-day (WestJet)",
      sourceId: "sp-westjet",
    },
    {
      id: "currency",
      label: "Currency",
      score: 3,
      detail: "CAD exposure vs USD contract",
    },
    {
      id: "source-agency",
      label: "Source agency",
      score: 3,
      detail:
        "Resolution source must be named (CIRB/union/airline notice). Kalshi paused flight-cancellation contracts in Jul 2026; FlightAware sued over its data, then dismissed the suit without prejudice on 11 Aug 2026, so it can refile",
      sourceId: "fortune-flights",
    },
    {
      id: "integrity",
      label: "Integrity",
      score: 3,
      detail:
        "Union officials and management are insiders; the contract must bar them",
    },
  ],
  ecp: {
    totalAssetsUsd: {
      value: 30_000_000_000,
      prov: { kind: "illustrative" },
    },
    netWorthUsd: {
      value: 1_000_000_000,
      prov: { kind: "illustrative" },
    },
    hedgingPurpose: true,
  },
  memoContext: {
    whyNow:
      "Strike risk is priced cheaply before a strike vote and expensively after it.",
    nextSteps: [
      "Draft custom contract terms and resolution source",
      "Pre-clear listing path with Kalshi (custom contract)",
      "RFQ for ≥25,000-contract non-sports block",
      "Treasury and audit review of hedge designation",
    ],
  },
};

const gpu: Scenario = {
  id: "gpu",
  name: "Neocloud GPU lessor · H100 rental floor, Q1 2027",
  vertical: "compute",
  company: {
    name: "Neocloud lessor (illustrative)",
    descriptor:
      "Owns and leases H100 SXM capacity; debt sized on an underwritten rental rate",
    ownership: "Illustrative composite; no real company's books",
    facts: [
      {
        label: "OCPI-H100 (19 Nov 2026)",
        value:
          "$2.78/GPU-hr, −18.0% over 7 days, −13.9% over 30 days; 30-day range $2.78–$3.53",
        prov: { kind: "sourced", sourceId: "ornn-h100" },
      },
      {
        label: "Silicon Data H100 implied forward (0–6m)",
        value: "$2.84–$3.13",
        prov: { kind: "sourced", sourceId: "sd-forward" },
      },
      {
        label: "ICE OCPI H100 futures (HPR)",
        value: "Pending CFTC comment period; no listing date",
        prov: { kind: "sourced", sourceId: "ornn-bbg" },
      },
      {
        label: "Kalshi live H100 series",
        value: "KXH100MAX: above $3.23…$3.98 by 31 Dec 2026",
        prov: { kind: "sourced", sourceId: "kalshi-api-h100" },
      },
    ],
  },
  eventLabel: "Q1 2027 average OCPI-H100 below the underwritten rate",
  ccy: "USD",
  fxUsdPerLocal: {
    value: 1,
    prov: { kind: "illustrative", note: "USD" },
  },
  baseline: null,
  baselineLabel: "Q1 2027 rental revenue at underwritten rate",
  lineItems: [],
  ladder: {
    gpus: { value: 16384, prov: { kind: "illustrative" } },
    underwriteRate: { value: 2.4, prov: { kind: "illustrative" } },
    hours: { value: 2160, prov: { kind: "illustrative" } },
    forward: {
      value: 2.95,
      prov: {
        kind: "illustrative",
        note: "anchored to Silicon Data implied forwards $2.84–$3.13 and Ornn spot $2.78",
      },
    },
    vol: {
      value: 0.9,
      prov: {
        kind: "illustrative",
        note: "30-day realized OCPI-H100 vol ≈ 91–109%, computed from Ornn's public daily settles",
      },
    },
    tYears: { value: 0.25, prov: { kind: "illustrative" } },
    step: 0.2,
    rungs: 3,
    spot: { value: 2.78, prov: { kind: "sourced", sourceId: "ornn-h100" } },
  },
  market: {
    venue: "kalshi",
    ticker: null,
    title: "Custom listing: OCPI-H100 Q1-2027 monthly average below $K (strip)",
    last: null,
    bid: null,
    ask: null,
    bidSize: null,
    askSize: null,
    openInterest: null,
    volume: null,
    snapshotLabel: "Custom listing path",
    listed: false,
    category: "non-sports",
    notes: [
      "Index already listed on Kalshi (KXH100MAX upside strikes) → a floor strip likely uses an existing certified index spec",
      "Monthly average settlement mirrors ICE HPR design",
    ],
    askBook: null,
  },
  hedgeMode: "ladder",
  defaults: {
    coverage: 1.0,
    netOfPremium: false,
    viewProb: null,
    feePerContract: 0,
    stressPrice: 2.25,
    rfqEnabled: true,
  },
  timing: [],
  basis: [
    {
      id: "index",
      label: "Index match",
      score: 3,
      detail:
        "OCPI is a volume-weighted average of transacted neocloud prices; your contracts may be reserved or term",
      sourceId: "ornn-h100",
    },
    {
      id: "averaging",
      label: "Averaging",
      score: 4,
      detail:
        "Monthly-average settlement smooths spikes; matches revenue accrual",
    },
    {
      id: "ladder-step",
      label: "Ladder step",
      score: 3,
      detail: "Step error up to half a rung (shown in chart)",
    },
    {
      id: "counterparty",
      label: "Counterparty",
      score: 4,
      detail:
        "Exchange-cleared if listed; OTC swap fallback carries MM credit risk",
    },
  ],
  ecp: {
    totalAssetsUsd: {
      value: 900_000_000,
      prov: { kind: "illustrative" },
    },
    netWorthUsd: {
      value: 150_000_000,
      prov: { kind: "illustrative" },
    },
    hedgingPurpose: true,
  },
  memoContext: {
    whyNow:
      "GPU rental spot is below the underwritten rate that debt covenants assume. A floor strip caps downside if Q1 averages stay weak.",
    nextSteps: [
      "Align index spec with OCPI-H100 monthly average",
      "Stress-test covenants at $1.80–$2.25/hr",
      "RFQ ladder strip to market makers",
      "Board sign-off on hedge designation",
    ],
  },
};

const calibration: Scenario = {
  id: "calibration",
  name: "Calibrate · Selfin 'Hedge of the Week'",
  vertical: "sports",
  company: {
    name: "Championship club (illustrative)",
    descriptor:
      "Faces relegation to League One (bottom three) — mirrors Selfin LinkedIn post",
    ownership: "Illustrative",
    facts: [
      {
        label: "Revenue if it stays up",
        value: "£60m",
        prov: { kind: "sourced", sourceId: "selfin-hotw" },
      },
    ],
  },
  eventLabel: "Relegated to League One",
  ccy: "GBP",
  fxUsdPerLocal: { value: 1, prov: { kind: "illustrative" } },
  baseline: { value: 60, prov: { kind: "sourced", sourceId: "selfin-hotw" } },
  baselineLabel: "Revenue if it stays up",
  lineItems: [
    {
      id: "revenue-drop",
      label: "Revenue drop if relegated to League One",
      amount: { value: 22, prov: { kind: "sourced", sourceId: "selfin-hotw" } },
      sign: 1,
    },
  ],
  market: {
    venue: "kalshi",
    ticker: null,
    title: "Selfin Hedge of the Week (calibration)",
    last: { value: 0.16, prov: { kind: "sourced", sourceId: "selfin-hotw" } },
    bid: null,
    ask: null,
    bidSize: null,
    askSize: null,
    openInterest: null,
    volume: null,
    snapshotLabel: "Selfin LinkedIn · illustrative",
    listed: false,
    category: "sports",
    notes: ["Calibration uses the post's all-in price"],
    askBook: null,
  },
  hedgeMode: "binary",
  defaults: {
    coverage: 25 / 22,
    coverageOverride: 25 / 22,
    netOfPremium: false,
    viewProb: 0.5,
    feePerContract: 0,
    priceOverride: 0.16,
    payoutTargetOverride: 25,
    rfqEnabled: false,
  },
  timing: [
    {
      id: "now",
      label: "Post entry",
      price: { value: 0.16, prov: { kind: "sourced", sourceId: "selfin-hotw" } },
    },
    {
      id: "early",
      label: "Early season",
      price: { value: 0.12, prov: { kind: "illustrative" } },
    },
    {
      id: "late",
      label: "Bottom three",
      price: { value: 0.35, prov: { kind: "illustrative" } },
    },
  ],
  basis: [
    {
      id: "calibration",
      label: "Calibration",
      score: 5,
      detail: "Matches Selfin LinkedIn Hedge of the Week post",
      sourceId: "selfin-hotw",
    },
  ],
  ecp: {
    totalAssetsUsd: {
      value: 50_000_000,
      prov: { kind: "illustrative" },
    },
    netWorthUsd: {
      value: 5_000_000,
      prov: { kind: "illustrative" },
    },
    hedgingPurpose: true,
  },
  memoContext: {
    whyNow: "Reproduces the public Hedge of the Week example for model validation.",
    nextSteps: ["Verify outputs against post", "Use as training preset"],
  },
};

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  coventry,
  aircanada,
  gpu,
  calibration,
};

export function getScenario(id: ScenarioId): Scenario {
  return SCENARIOS[id];
}