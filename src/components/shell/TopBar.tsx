"use client";

import { SelfinMark } from "@/components/brand/SelfinMark";
import { ScenarioSwitcher } from "@/components/shell/ScenarioSwitcher";
import type { Action, DeskState } from "@/lib/types";
import { Gavel, RefreshCw } from "lucide-react";
import type { Dispatch } from "react";

type TopBarProps = {
  state: DeskState;
  dispatch: Dispatch<Action>;
};

export function TopBar({ state, dispatch }: TopBarProps) {
  return (
    <header className="fixed left-1/2 top-3 z-30 flex h-14 w-[calc(100%-1.5rem)] max-w-[1400px] -translate-x-1/2 items-center gap-3 rounded-md border border-white/[0.08] bg-background/70 px-3 backdrop-blur-md print:hidden">
      <SelfinMark compact />
      <div className="hidden min-w-0 flex-1 lg:block">
        <ScenarioSwitcher scenarioId={state.scenarioId} dispatch={dispatch} />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 lg:flex-none">
        <span className="hidden max-w-[200px] items-center gap-2 truncate rounded-md border border-border bg-muted px-2 py-1 text-[10px] text-muted-foreground md:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <span className="truncate">{state.scenario.market.snapshotLabel}</span>
        </span>
        <button
          type="button"
          onClick={() => dispatch({ type: "setObjectionsOpen", open: true })}
          className="flex h-9 items-center gap-1 rounded-md border border-border bg-transparent px-2 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Open objections"
        >
          <Gavel className="h-4 w-4" />
          <span className="hidden sm:inline">Objections</span>
        </button>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "reset" });
            dispatch({
              type: "setStatusMessage",
              message: "Scenario reset",
            });
          }}
          className="flex h-9 items-center gap-1 rounded-md border border-border bg-transparent px-2 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Reset scenario"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
}