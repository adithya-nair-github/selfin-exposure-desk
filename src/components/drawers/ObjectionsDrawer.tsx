"use client";

import { Drawer } from "@/components/ui/Drawer";
import { SourceChip } from "@/components/ui/SourceChip";
import { OBJECTIONS } from "@/data/objections";
import type { Action, DeskState } from "@/lib/types";
import { useState, type Dispatch } from "react";

type ObjectionsDrawerProps = {
  state: DeskState;
  dispatch: Dispatch<Action>;
};

export function ObjectionsDrawer({ state, dispatch }: ObjectionsDrawerProps) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = OBJECTIONS.filter(
    (o) =>
      query.trim() === "" ||
      o.question.toLowerCase().includes(query.toLowerCase()) ||
      o.answer.toLowerCase().includes(query.toLowerCase()),
  );

  const close = () => dispatch({ type: "setObjectionsOpen", open: false });

  return (
    <Drawer open={state.objectionsOpen} onClose={close} title="Objections">
      <input
        type="search"
        placeholder="Search objections…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 h-9 w-full rounded-md border border-border bg-muted px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        aria-label="Search objections"
      />
      <ul className="space-y-2">
        {filtered.map((o) => {
          const expanded = openId === o.id;
          return (
            <li key={o.id} className="rounded-md border border-border">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium hover:bg-accent"
                onClick={() => setOpenId(expanded ? null : o.id)}
                aria-expanded={expanded}
              >
                {o.question}
                <span className="text-muted-foreground">{expanded ? "−" : "+"}</span>
              </button>
              {expanded ? (
                <div className="border-t border-border px-3 py-2 text-sm text-muted-foreground">
                  <p>{o.answer}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {o.sourceIds.map((id) => (
                      <SourceChip
                        key={id}
                        prov={
                          id === "paula-x-otc"
                            ? {
                                kind: "unverified",
                                sourceId: id,
                                note: "X was walled during review",
                              }
                            : { kind: "sourced", sourceId: id }
                        }
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-xs text-primary hover:underline"
                    onClick={() => {
                      void navigator.clipboard.writeText(o.answer).then(() => {
                        dispatch({
                          type: "setStatusMessage",
                          message: "Answer copied",
                        });
                      });
                    }}
                  >
                    Copy answer
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Drawer>
  );
}