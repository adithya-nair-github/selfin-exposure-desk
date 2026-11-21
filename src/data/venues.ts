import type { Provenance, VenueId } from "@/lib/types";

export type VenueRules = {
  id: VenueId;
  name: string;
  blockMin: { sports?: number; "non-sports"?: number; all?: number };
  blockEligibleCategories?: string[];
  priceBand?: { min: number; max: number };
  tick: number;
  displayTick: string;
  reportingWindowMin: number;
  fees: {
    taker?: number;
    maker?: number;
    feePerContractDefault: number;
    promo?: string;
    note?: string;
  };
  aggregation: string;
  positionLimits?: string;
  positionAccountability?: string;
  ecpRequired: boolean;
  priceRule: string;
  customListing?: string;
  steps?: string[];
  note?: string;
  prov?: Provenance;
};

export const VENUES: Record<VenueId, VenueRules> = {
  kalshi: {
    id: "kalshi",
    name: "Kalshi (KalshiEX LLC · DCM; clears via Kalshi Klear LLC · DCO)",
    blockMin: { sports: 50000, "non-sports": 25000 },
    reportingWindowMin: 15,
    aggregation:
      "Not aggregable by ordinary participants to reach the minimum; advisers permitted under Rule 5.3(e)/5.3(m)(i) may aggregate. Check whether Selfin as an IB qualifies.",
    positionLimits: "Member position limits apply; confirm with the exchange",
    prov: {
      kind: "unverified",
      sourceId: "kalshi-inst",
      note: "Confirm position limits with exchange",
    },
    ecpRequired: true,
    priceRule: "fair and reasonable",
    customListing:
      "Existing certified specifications can be listed within days; new terms require CFTC certification.",
    steps: ["Negotiate", "Pre-fund", "Submit", "Execute", "Settle"],
    tick: 0.01,
    displayTick: "1¢",
    fees: {
      feePerContractDefault: 0,
    },
  },
  polymarket: {
    id: "polymarket",
    name: "Polymarket US (QCX LLC · DCM)",
    blockMin: { all: 100000 },
    blockEligibleCategories: ["Politics", "Macroeconomics", "Sports"],
    priceBand: { min: 0.005, max: 0.995 },
    tick: 0.005,
    displayTick: "0.5¢",
    reportingWindowMin: 15,
    fees: {
      taker: 0.005,
      maker: 0.0015,
      feePerContractDefault: 0,
      promo: "No fees on blocks executed on or before 31 Dec 2026",
      note: "No exchange fees on IB-arranged blocks",
    },
    aggregation:
      "Permitted only for a party allowed to aggregate under Rule 5.3(m)(i)",
    positionAccountability:
      "Block positions count toward Position Accountability Levels",
    ecpRequired: true,
    priceRule: "fair and reasonable",
  },
  otc: {
    id: "otc",
    name: "OTC swap with market maker",
    blockMin: {},
    tick: 0.01,
    displayTick: "1¢",
    reportingWindowMin: 15,
    aggregation: "Bilateral negotiation; no exchange minimum",
    ecpRequired: true,
    priceRule: "fair and reasonable",
    note:
      "Bilateral ISDA-style swap; counterparty credit risk is not mutualized by a clearinghouse; used when no listed contract fits",
    fees: { feePerContractDefault: 0 },
    prov: { kind: "sourced", sourceId: "paula-x-otc" },
  },
};

export function getVenue(id: VenueId): VenueRules {
  return VENUES[id];
}

export function kalshiBlockMin(category: "sports" | "non-sports"): number {
  if (category === "sports") {
    return VENUES.kalshi.blockMin.sports ?? 50000;
  }
  return VENUES.kalshi.blockMin["non-sports"] ?? 25000;
}