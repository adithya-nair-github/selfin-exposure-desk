"use client";

import { useEffect, useReducer, type Dispatch } from "react";
import { applyScenario } from "@/lib/applyScenario";
import { SCENARIO_IDS } from "@/data/scenarios";
import type {
  Action,
  DeskState,
  MmQuote,
  ScenarioId,
} from "@/lib/types";

const STORAGE_KEY = "selfin-exposure-desk-scenario";

function isScenarioId(id: string): id is ScenarioId {
  return (SCENARIO_IDS as readonly string[]).includes(id);
}

export function deskReducer(state: DeskState, action: Action): DeskState {
  switch (action.type) {
    case "restore":
    case "setScenario": {
      const next = applyScenario(action.id);
      return { ...next, activeTab: state.activeTab };
    }
    case "reset":
      return applyScenario(state.scenarioId);
    case "setCoverage":
      return {
        ...state,
        coverage: action.value,
        coverageOverride: null,
      };
    case "setCoverageOverride":
      return { ...state, coverageOverride: action.value };
    case "setNetOfPremium":
      return { ...state, netOfPremium: action.value };
    case "setViewProb":
      return { ...state, viewProb: action.value };
    case "setFeePerContract":
      return { ...state, feePerContract: action.value };
    case "setFxUsdPerLocal":
      return { ...state, fxUsdPerLocal: action.value };
    case "setTimingId":
      return { ...state, timingId: action.id };
    case "setMmEdgeCents":
      return { ...state, mmEdgeCents: action.value, quotes: null, quoteRevealStep: 0 };
    case "setQuotes":
      return { ...state, quotes: action.quotes };
    case "setQuoteRevealStep":
      return { ...state, quoteRevealStep: action.step };
    case "setAllocations":
      return { ...state, allocations: action.allocations };
    case "setSelectedMaker":
      return { ...state, selectedMaker: action.maker };
    case "setBlockTicket":
      return { ...state, blockTicket: action.ticket };
    case "tick":
      return { ...state, nowMs: action.nowMs };
    case "setStatusMessage":
      return { ...state, statusMessage: action.message };
    case "setStressPrice":
      return { ...state, stressPrice: action.value };
    case "setLadderRungs":
      return { ...state, ladderRungs: action.value };
    case "setLadderStep":
      return { ...state, ladderStep: action.value };
    case "setLadderVol":
      return { ...state, ladderVol: action.value };
    case "setLadderForward":
      return { ...state, ladderForward: action.value };
    case "updateLineItem":
      return {
        ...state,
        lineItems: state.lineItems.map((li) =>
          li.id === action.id
            ? {
                ...li,
                amount: {
                  ...li.amount,
                  value: action.amount,
                },
              }
            : li,
        ),
      };
    case "setBaseline":
      return {
        ...state,
        baseline: state.baseline
          ? { ...state.baseline, value: action.value }
          : {
              value: action.value,
              prov: { kind: "illustrative" },
            },
      };
    case "setEcpAssets":
      return { ...state, ecpAssets: action.value };
    case "setEcpNetWorth":
      return { ...state, ecpNetWorth: action.value };
    case "setEcpHedging":
      return { ...state, ecpHedging: action.value };
    case "setActiveTab":
      return { ...state, activeTab: action.tab };
    case "setObjectionsOpen":
      return { ...state, objectionsOpen: action.open };
    case "setTicketModalOpen":
      return { ...state, ticketModalOpen: action.open };
    case "setPriceOverride":
      return { ...state, priceOverride: action.value };
    case "setPayoutTargetOverride":
      return { ...state, payoutTargetOverride: action.value };
    case "advanceTicketStep": {
      const t = state.blockTicket;
      if (!t) return state;
      const order: BlockTicket["step"][] = [
        "negotiate",
        "prefund",
        "submit",
        "execute",
        "settle",
      ];
      const idx = order.indexOf(t.step);
      const nextStep = idx < order.length - 1 ? order[idx + 1] : t.step;
      return {
        ...state,
        blockTicket: { ...t, step: nextStep },
      };
    }
    case "setSettleOutcome": {
      const t = state.blockTicket;
      if (!t) return state;
      return {
        ...state,
        blockTicket: { ...t, settleOutcome: action.outcome, step: "settle" },
      };
    }
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

type BlockTicket = NonNullable<DeskState["blockTicket"]>;

function readStoredScenarioId(): ScenarioId | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && isScenarioId(raw)) {
      return raw;
    }
  } catch {
    return null;
  }
  return null;
}

export function persistScenarioId(id: ScenarioId): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore quota / privacy */
  }
}

export type DeskStore = {
  state: DeskState;
  dispatch: Dispatch<Action>;
};

export function useDesk(): DeskStore {
  const [state, dispatch] = useReducer(deskReducer, undefined, () =>
    applyScenario("coventry"),
  );

  // Restore once on mount only. Depending on scenarioId here fights the
  // persist effect and ping-pongs scenarios (visible as UI blinking).
  useEffect(() => {
    const stored = readStoredScenarioId();
    if (stored !== null) {
      dispatch({ type: "restore", id: stored });
    }
  }, []);

  useEffect(() => {
    persistScenarioId(state.scenarioId);
  }, [state.scenarioId]);

  return { state, dispatch };
}

export type { Action, DeskState, MmQuote, ScenarioId };