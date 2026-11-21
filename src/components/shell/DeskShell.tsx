"use client";

import { BlockTicketModal } from "@/components/modals/BlockTicketModal";
import { ObjectionsDrawer } from "@/components/drawers/ObjectionsDrawer";
import { CompanyCard } from "@/components/left/CompanyCard";
import { EcpCheck } from "@/components/left/EcpCheck";
import { PnLBridge } from "@/components/left/PnLBridge";
import { Footer } from "@/components/shell/Footer";
import { RightRail } from "@/components/shell/RightRail";
import { TopBar } from "@/components/shell/TopBar";
import { ScenarioSwitcher } from "@/components/shell/ScenarioSwitcher";
import { CoverageTab } from "@/components/tabs/CoverageTab";
import { HedgeTab } from "@/components/tabs/HedgeTab";
import { MarketTab } from "@/components/tabs/MarketTab";
import { MemoTab } from "@/components/tabs/MemoTab";
import { QuoteTab } from "@/components/tabs/QuoteTab";
import { StatusText } from "@/components/ui/StatusText";
import { useDesk } from "@/state/useDesk";
import type { DeskTab } from "@/lib/types";

const TABS: { id: DeskTab; label: string; mobileOnly?: boolean }[] = [
  { id: "coverage", label: "Coverage" },
  { id: "exposure", label: "Exposure", mobileOnly: true },
  { id: "market", label: "Market" },
  { id: "hedge", label: "Hedge" },
  { id: "quote", label: "Quote" },
  { id: "memo", label: "Memo" },
];

export function DeskShell() {
  const { state, dispatch } = useDesk();

  return (
    <div className="relative min-h-screen pb-16 pt-[4.5rem] print:pt-0">
      <div
        className="pointer-events-none absolute right-0 top-0 h-64 w-96 max-w-[50vw] rounded-full bg-primary-light/35 blur-3xl"
        aria-hidden
      />

      <TopBar state={state} dispatch={dispatch} />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-3 xl:flex-row xl:items-start">
        <div className="hidden w-full shrink-0 space-y-4 xl:block xl:w-[320px]">
          <CompanyCard scenario={state.scenario} />
          <PnLBridge state={state} dispatch={dispatch} />
          <EcpCheck state={state} dispatch={dispatch} />
        </div>

        <main className="min-w-0 flex-1 space-y-3">
          <div className="lg:hidden">
            <ScenarioSwitcher scenarioId={state.scenarioId} dispatch={dispatch} />
          </div>

          <nav
            className="flex gap-1 overflow-x-auto border-b border-border pb-px print:hidden"
            aria-label="Desk tabs"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => dispatch({ type: "setActiveTab", tab: tab.id })}
                className={`shrink-0 rounded-t-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                  tab.mobileOnly ? "xl:hidden" : ""
                } ${
                  state.activeTab === tab.id
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={state.activeTab === tab.id ? "page" : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <StatusText message={state.statusMessage} />

          <section className="rounded-md border border-white/[0.08] bg-card p-4 print:border-0 print:bg-transparent print:p-0">
            {state.activeTab === "coverage" ? (
              <CoverageTab state={state} dispatch={dispatch} />
            ) : null}
            {state.activeTab === "exposure" ? (
              <div className="space-y-4 xl:hidden">
                <CompanyCard scenario={state.scenario} />
                <PnLBridge state={state} dispatch={dispatch} />
                <EcpCheck state={state} dispatch={dispatch} />
              </div>
            ) : null}
            {state.activeTab === "market" ? (
              <MarketTab state={state} dispatch={dispatch} />
            ) : null}
            {state.activeTab === "hedge" ? (
              <HedgeTab state={state} dispatch={dispatch} />
            ) : null}
            {state.activeTab === "quote" ? (
              <QuoteTab state={state} dispatch={dispatch} />
            ) : null}
            {state.activeTab === "memo" ? (
              <MemoTab state={state} dispatch={dispatch} />
            ) : null}
          </section>
        </main>

        <div className="w-full shrink-0 xl:w-[300px]">
          <RightRail state={state} dispatch={dispatch} />
        </div>
      </div>

      <Footer />
      <ObjectionsDrawer state={state} dispatch={dispatch} />
      <BlockTicketModal state={state} dispatch={dispatch} />
    </div>
  );
}