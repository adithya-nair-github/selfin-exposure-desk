import { kalshiBlockMin } from "@/data/venues";
import type { MarketSnapshot, MmQuote } from "@/lib/types";

const EDGE_MULTIPLIERS: readonly [number, number, number] = [0.7, 1.0, 1.4];
const CAPACITY_FRACTIONS: readonly [number, number, number] = [0.45, 0.35, 0.3];
const MAKERS: readonly ["MM 1", "MM 2", "MM 3"] = ["MM 1", "MM 2", "MM 3"];

export type QuoteInputs = {
  market: MarketSnapshot;
  mid: number;
  contractsN: number;
  userEdgeCents: number;
  polymarketTicks?: boolean;
};

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

function roundToTick(price: number, tick: number): number {
  return Math.round(price / tick) * tick;
}

export function sizePremium(contractsN: number, blockMin: number): number {
  const ratio = Math.max(contractsN / blockMin, 1);
  return 0.004 * Math.log10(ratio);
}

export function buildMmQuotes(inputs: QuoteInputs): MmQuote[] {
  const blockMin = kalshiBlockMin(inputs.market.category);
  const m = inputs.mid;
  const edgeBase = inputs.userEdgeCents / 100;
  const prem = sizePremium(inputs.contractsN, blockMin);
  const tick = inputs.polymarketTicks === true ? 0.005 : 0.001;

  return MAKERS.map((maker, i) => {
    const edgeK = EDGE_MULTIPLIERS[i] * edgeBase;
    const raw = clamp(m + edgeK + prem, 0.01, 0.99);
    const offer = roundToTick(raw, tick);
    const capacity = Math.round(CAPACITY_FRACTIONS[i] * inputs.contractsN / 1000) * 1000;
    return {
      maker,
      offer,
      capacity,
      edgeMultiplier: EDGE_MULTIPLIERS[i],
    };
  });
}

export function bestQuote(quotes: MmQuote[]): MmQuote | null {
  if (quotes.length === 0) {
    return null;
  }
  return quotes.reduce((best, q) => (q.offer < best.offer ? q : best));
}

export function greedyAllocations(
  quotes: MmQuote[],
  targetN: number,
): { maker: MmQuote["maker"]; size: number }[] {
  const sorted = [...quotes].sort((a, b) => a.offer - b.offer);
  let remaining = targetN;
  const out: { maker: MmQuote["maker"]; size: number }[] = [];

  for (const q of sorted) {
    if (remaining <= 0) break;
    const take = Math.min(q.capacity, remaining);
    if (take > 0) {
      out.push({ maker: q.maker, size: take });
      remaining -= take;
    }
  }

  return out;
}

export function allocationVwap(
  allocations: { maker: MmQuote["maker"]; size: number }[],
  quotes: MmQuote[],
): number {
  let cost = 0;
  let total = 0;
  for (const a of allocations) {
    const q = quotes.find((x) => x.maker === a.maker);
    if (!q) continue;
    cost += a.size * q.offer;
    total += a.size;
  }
  return total > 0 ? cost / total : 0;
}

export function sensitivityQuotes(
  inputs: Omit<QuoteInputs, "userEdgeCents">,
  edgeCentsList: number[],
): { edgeCents: number; quotes: MmQuote[]; bestOffer: number }[] {
  return edgeCentsList.map((edgeCents) => {
    const quotes = buildMmQuotes({ ...inputs, userEdgeCents: edgeCents });
    const best = bestQuote(quotes);
    return {
      edgeCents,
      quotes,
      bestOffer: best?.offer ?? 0,
    };
  });
}