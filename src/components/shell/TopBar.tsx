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
    <header className="fixed left-1/2 top-2 z-30 flex h-12 w-[calc(100%-1rem)] max-w-[1400px] -translate-x-1/2 items-center gap-2 rounded-md border border-white/[0.08] bg-background/70 px-2 backdrop-blur-md sm:top-3 sm:h-14 sm:w-[calc(100%-1.5rem)] sm:gap-3 sm:px-3 print:hidden">
      <SelfinMark compact className="min-w-0 shrink" />
      <div className="hidden min-w-0 flex-1 lg:block">
        <ScenarioSwitcher scenarioId={state.scenarioId} dispatch={dispatch} />
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <span className="hidden max-w-[220px] items-center gap-2 truncate rounded-md border border-border bg-muted px-2 py-1 text-[10px] text-muted-foreground md:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <span className="truncate">{state.scenario.market.snapshotLabel}</span>
        </span>
        <button
          type="button"
          onClick={() => dispatch({ type: "setObjectionsOpen", open: true })}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-transparent text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:h-9 sm:w-auto sm:gap-1 sm:px-2"
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
          className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-transparent text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:h-9 sm:w-auto sm:gap-1 sm:px-2"
          aria-label="Reset scenario"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
}
