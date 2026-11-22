"use client";

import { SelfinMark } from "@/components/brand/SelfinMark";
import { SourceChip } from "@/components/ui/SourceChip";
import { StatusText } from "@/components/ui/StatusText";
import { SOURCES } from "@/data/sources";
import { buildMemoFromState } from "@/lib/memo";
import type { Action, DeskState } from "@/lib/types";
import type { Dispatch } from "react";

type MemoTabProps = {
  state: DeskState;
  dispatch: Dispatch<Action>;
};

export function MemoTab({ state, dispatch }: MemoTabProps) {
  const { viewModel, markdown } = buildMemoFromState(state);

  function copyMarkdown() {
    void navigator.clipboard.writeText(markdown).then(() => {
      dispatch({ type: "setStatusMessage", message: "Memo copied" });
    });
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exposure-memo-${state.scenarioId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="h-9 rounded-md bg-primary px-3 text-sm text-white hover:bg-primary-dark"
        >
          Print / Save PDF
        </button>
        <button
          type="button"
          onClick={copyMarkdown}
          className="h-9 rounded-md border border-border px-3 text-sm hover:bg-accent"
        >
          Copy Markdown
        </button>
        <button
          type="button"
          onClick={downloadMarkdown}
          className="h-9 rounded-md border border-border px-3 text-sm hover:bg-accent"
        >
          Download .md
        </button>
      </div>
      <StatusText message={state.statusMessage} />

      <article
        id="exposure-memo"
        className="theme-light mx-auto max-w-[816px] rounded-md border border-border bg-background p-4 text-foreground shadow-none sm:p-8"
      >
        <header className="mb-6 border-b border-border pb-4">
          <SelfinMark showWordmark />
          <h1 className="mt-4 font-serif text-2xl">Exposure memo</h1>
          <p className="text-sm">{viewModel.companyName}</p>
          <p className="text-xs text-muted-foreground">
            Prepared {viewModel.preparedDate}
          </p>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {viewModel.stamp}
          </p>
        </header>

        <section className="mb-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            1. What the market implies
          </h2>
          <ul className="mt-2 list-inside list-disc text-sm">
            <li>Implied probability: {viewModel.marketImplied}</li>
            <li>{viewModel.venueTicker}</li>
            <li>{viewModel.snapshotLabel}</li>
            <li>{viewModel.liquidityNote}</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            2. What a hedge would cost
          </h2>
          <ul className="mt-2 text-sm">
            <li>Contracts: {viewModel.contractsFormatted}</li>
            <li>Price: {viewModel.priceFormatted}</li>
            <li>
              Premium: {viewModel.premiumLocal} ({viewModel.premiumUsd} USD) ·{" "}
              {viewModel.premiumPctPayout} of payout
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            3. What happens if you don&apos;t hedge
          </h2>
          <p className="mt-2 text-sm">{viewModel.unhedgedNote}</p>
          <table className="mt-2 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-1 text-left">Outcome</th>
                <th className="py-1 text-right">Unhedged</th>
                <th className="py-1 text-right">Hedged</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {viewModel.payoffRows.map((r) => (
                <tr key={r.label} className="border-b border-border">
                  <td className="py-2">{r.label}</td>
                  <td className="py-2 text-right">{r.unhedged}</td>
                  <td className="py-2 text-right">{r.hedged}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-4 text-sm">
          <h3 className="font-serif text-base">Route</h3>
          <p className="font-medium">{viewModel.route}</p>
          <ul className="list-inside list-disc text-muted-foreground">
            {viewModel.routeReasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <section className="mb-4 text-sm">
          <h3 className="font-serif text-base">Basis risks</h3>
          <ul className="list-inside list-disc">
            {viewModel.basisRisks.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <section className="mb-4 text-sm">
          <h3 className="font-serif text-base">Why now</h3>
          <p>{viewModel.whyNow}</p>
        </section>

        <section className="mb-4 text-sm">
          <h3 className="font-serif text-base">Next steps</h3>
          <ol className="list-decimal pl-5">
            {viewModel.nextSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>

        <footer className="border-t border-border pt-4 text-xs text-muted-foreground">
          <p className="mb-2">Sources</p>
          <ol className="space-y-1">
            {viewModel.sourceIds.map((id, i) => {
              const src = SOURCES[id];
              return (
                <li key={id}>
                  [{i + 1}] {src?.label ?? id}{" "}
                  {src ? (
                    <SourceChip
                      prov={
                        src.status === "unverified"
                          ? {
                              kind: "unverified",
                              sourceId: id,
                              note: "Not re-checked in review",
                            }
                          : { kind: "sourced", sourceId: id }
                      }
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
          <p className="mt-4">{viewModel.disclaimer}</p>
        </footer>
      </article>
    </div>
  );
}