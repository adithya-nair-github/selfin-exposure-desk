import { getScenario } from "@/data/scenarios";
import type { DeskState, LineItem, Scenario, ScenarioId } from "@/lib/types";

function cloneLineItems(items: LineItem[]): LineItem[] {
  return items.map((li) => ({
    ...li,
    amount: { ...li.amount, prov: { ...li.amount.prov } },
  }));
}

export function applyScenario(id: ScenarioId): DeskState {
  const scenario: Scenario = getScenario(id);
  const d = scenario.defaults;

  const ladder = scenario.ladder;

  const state: DeskState = {
    scenarioId: id,
    scenario,
    coverage: d.coverage,
    netOfPremium: d.netOfPremium,
    viewProb: d.viewProb ?? 0.5,
    feePerContract: d.feePerContract,
    fxUsdPerLocal: scenario.fxUsdPerLocal.value,
    timingId: "now",
    mmEdgeCents: 3,
    quotes: null,
    quoteRevealStep: 0,
    allocations: [],
    selectedMaker: null,
    blockTicket: null,
    nowMs: null,
    statusMessage: "",
    stressPrice: d.stressPrice ?? 2.25,
    ladderRungs: ladder?.rungs ?? 3,
    ladderStep: ladder?.step ?? 0.2,
    ladderVol: ladder?.vol.value ?? 0.9,
    ladderForward: ladder?.forward.value ?? 2.95,
    lineItems: cloneLineItems(scenario.lineItems),
    baseline: scenario.baseline,
    ecpAssets: scenario.ecp.totalAssetsUsd.value,
    ecpNetWorth: scenario.ecp.netWorthUsd.value,
    ecpHedging: scenario.ecp.hedgingPurpose,
    activeTab: "hedge",
    objectionsOpen: false,
    ticketModalOpen: false,
    coverageOverride:
      d.coverageOverride !== undefined ? d.coverageOverride : null,
    priceOverride: d.priceOverride !== undefined ? d.priceOverride : null,
    payoutTargetOverride:
      d.payoutTargetOverride !== undefined ? d.payoutTargetOverride : null,
  };

  return state;
}