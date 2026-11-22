"use client";

import { SourceChip } from "@/components/ui/SourceChip";
import { ACCOUNTS, ACCOUNTS_BANNER } from "@/data/accounts";
import { fmtContracts, fmtInt } from "@/lib/format";
import type { Account, Action, Vertical } from "@/lib/types";
import { useState, type Dispatch } from "react";
import type { DeskState } from "@/lib/types";

type CoverageTabProps = {
  state: DeskState;
  dispatch: Dispatch<Action>;
};

const RESEARCH: Record<Vertical, string[]> = {
  sports: [
    "Latest accounts: promotion/relegation revenue sensitivity",
    "Broadcast and parachute mechanics in league handbook",
    "Owner liquidity and hedging mandate",
    "Listed prediction-market series for the club",
  ],
  aviation: [
    "10-K risk factors: labor/strike language",
    "Union contract expiry dates",
    "Hub seat share",
    "Last disruption cost disclosed",
  ],
  compute: [
    "GPU fleet size and utilization",
    "Debt covenants tied to rental yields",
    "Index exposure (OCPI-H100) vs contract book",
    "Kalshi H100 series vs custom floor strip",
  ],
};

const RESEARCH_PROMPT = `You are researching a corporate event-risk hedge prospect.
Produce: (1) quantified P&L bridge for the named event, (2) listed or custom market mapping,
(3) ECP onboarding checklist, (4) three cited sources. No invented contacts.`;

function availabilityLabel(a: Account): string {
  if (a.listedStatus === "listed-snapshot") {
    return a.openInterest !== null
      ? `Listed snapshot · OI ${fmtInt(a.openInterest)}`
      : "Listed snapshot";
  }
  if (a.listedStatus === "listed-series") {
    return "Listed series";
  }
  return "Custom";
}

function AccountActions({
  account,
  dispatch,
}: {
  account: Account;
  dispatch: Dispatch<Action>;
}) {
  if (account.scenarioId) {
    return (
      <button
        type="button"
        className="mt-2 h-10 w-full rounded-md bg-primary px-3 text-sm text-white hover:bg-primary-dark sm:h-9 sm:w-auto"
        onClick={() => {
          const id = account.scenarioId;
          if (id) {
            dispatch({ type: "setScenario", id });
            dispatch({ type: "setActiveTab", tab: "hedge" });
          }
        }}
      >
        Draft memo
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-3 text-sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
        Research brief
      </p>
      <ul className="list-inside list-disc text-muted-foreground">
        {RESEARCH[account.vertical].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
        Research agent prompt
      </p>
      <pre className="overflow-x-auto rounded-md border border-border bg-muted p-2 text-xs whitespace-pre-wrap">
        {RESEARCH_PROMPT}
      </pre>
      <button
        type="button"
        className="text-xs text-primary hover:underline"
        onClick={() => {
          void navigator.clipboard.writeText(RESEARCH_PROMPT).then(() => {
            dispatch({
              type: "setStatusMessage",
              message: "Prompt copied",
            });
          });
        }}
      >
        Copy prompt
      </button>
    </div>
  );
}

export function CoverageTab({ dispatch }: CoverageTabProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = ACCOUNTS.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
        {ACCOUNTS_BANNER}
      </p>

      {/* Mobile card list */}
      <ul className="space-y-2 md:hidden">
        {ACCOUNTS.map((a) => {
          const open = selectedId === a.id;
          return (
            <li
              key={a.id}
              className="rounded-md border border-border bg-muted/40 p-3"
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setSelectedId(open ? null : a.id)}
                aria-expanded={open}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-primary">{a.company}</span>
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {a.vertical}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.keyEvent}</p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {a.mappedSeries}
                </p>
                <p className="mt-1 text-xs">{availabilityLabel(a)}</p>
              </button>
              {open ? (
                <div className="mt-3 border-t border-border pt-3">
                  {a.exposureAnchor ? (
                    <div className="mb-2 text-xs">
                      <span className="text-muted-foreground">Anchor: </span>
                      <span>{a.exposureAnchor.value}</span>
                      <SourceChip prov={a.exposureAnchor.prov} />
                    </div>
                  ) : null}
                  <AccountActions account={a} dispatch={dispatch} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-2">Company</th>
              <th className="py-2 pr-2">Vertical</th>
              <th className="py-2 pr-2">Ticker / ownership</th>
              <th className="py-2 pr-2">Key event</th>
              <th className="py-2 pr-2">Series</th>
              <th className="py-2 pr-2">Availability</th>
              <th className="py-2">Anchor</th>
            </tr>
          </thead>
          <tbody>
            {ACCOUNTS.map((a) => (
              <tr
                key={a.id}
                className="border-b border-border hover:bg-accent/40"
              >
                <td className="py-2 pr-2">
                  <button
                    type="button"
                    className="text-left text-primary hover:underline"
                    onClick={() => setSelectedId(a.id)}
                  >
                    {a.company}
                  </button>
                </td>
                <td className="py-2 pr-2 capitalize">{a.vertical}</td>
                <td className="py-2 pr-2 text-xs">{a.tickerOrOwnership}</td>
                <td className="max-w-[160px] py-2 pr-2 text-xs">{a.keyEvent}</td>
                <td className="py-2 pr-2 font-mono text-xs">
                  {a.mappedSeries}
                </td>
                <td className="py-2 pr-2 text-xs">
                  {availabilityLabel(a)}
                  {a.openInterest !== null ? (
                    <span className="ml-1 font-mono">
                      ({fmtContracts(a.openInterest)})
                    </span>
                  ) : null}
                </td>
                <td className="py-2">
                  {a.exposureAnchor ? (
                    <div className="text-xs">
                      <span>{a.exposureAnchor.value}</span>
                      <SourceChip prov={a.exposureAnchor.prov} />
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <aside className="hidden rounded-md border border-border bg-card p-4 md:block">
          <h3 className="font-serif text-lg">{selected.company}</h3>
          <AccountActions account={selected} dispatch={dispatch} />
        </aside>
      )}
    </div>
  );
}
