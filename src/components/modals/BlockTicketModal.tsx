"use client";

import { Modal } from "@/components/ui/Modal";
import { Segmented } from "@/components/ui/Segmented";
import { deriveDesk } from "@/lib/deskDerived";
import { fmtCents, fmtContracts, fmtMoneyMillions } from "@/lib/format";
import { allocationVwap } from "@/lib/quotes";
import { VENUES } from "@/data/venues";
import type { Action, DeskState } from "@/lib/types";
import { useEffect, useRef, type Dispatch } from "react";

type BlockTicketModalProps = {
  state: DeskState;
  dispatch: Dispatch<Action>;
};

const WINDOW_MS = 15 * 60 * 1000;

function formatCountdown(remainingMs: number): string {
  const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function BlockTicketModal({ state, dispatch }: BlockTicketModalProps) {
  const ticket = state.blockTicket;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const d = deriveDesk(state);
  const hedge = d.hedge;
  const quotes = state.quotes ?? [];

  useEffect(() => {
    if (!state.ticketModalOpen || !ticket || ticket.agreedAtMs <= 0) {
      return;
    }
    intervalRef.current = setInterval(() => {
      dispatch({ type: "tick", nowMs: Date.now() });
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.ticketModalOpen, ticket?.agreedAtMs, dispatch, ticket]);

  if (!ticket) {
    return null;
  }

  const nowMs = state.nowMs ?? ticket.agreedAtMs;
  const elapsed = nowMs - ticket.agreedAtMs;
  const remaining = WINDOW_MS - elapsed;
  const expired = remaining <= 0;

  const vwap = allocationVwap(
    ticket.allocations.map((a) => ({ maker: a.maker, size: a.size })),
    quotes.length > 0
      ? quotes
      : ticket.allocations.map((a) => ({
          maker: a.maker,
          offer: a.price,
          capacity: a.size,
          edgeMultiplier: 1,
        })),
  );

  const totalN = ticket.allocations.reduce((s, a) => s + a.size, 0);
  const premiumUsd = totalN * vwap + totalN * state.feePerContract;

  const steps = VENUES.kalshi.steps ?? [
    "Negotiate",
    "Pre-fund",
    "Submit",
    "Execute",
    "Settle",
  ];
  const stepIds = ["negotiate", "prefund", "submit", "execute", "settle"] as const;
  const stepIndex = stepIds.indexOf(ticket.step);

  const close = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    dispatch({ type: "setTicketModalOpen", open: false });
  };

  const settlePayoutUsd =
    ticket.settleOutcome === "event"
      ? totalN
      : ticket.settleOutcome === "no-event"
        ? 0
        : null;

  const outcomePnL =
    settlePayoutUsd !== null && hedge
      ? (settlePayoutUsd - premiumUsd) / state.fxUsdPerLocal / 1e6
      : null;

  return (
    <Modal
      open={state.ticketModalOpen}
      onClose={close}
      title="Block ticket"
    >
      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          {state.scenario.market.ticker ?? state.scenario.market.title}
        </p>
        <p>Buy YES · {fmtContracts(totalN)} contracts · VWAP {fmtCents(vwap)}</p>
        <p>
          Premium (buyer pre-funds): ${(premiumUsd / 1e6).toFixed(2)}m ·
          Collateral (seller):{" "}
          {(totalN * (1 - vwap) / 1e6).toFixed(2)}m contracts notional
        </p>

        <div>
          <p className="text-xs text-muted-foreground">
            Report to exchange within 15 minutes of agreement
          </p>
          <p
            className={`font-mono text-2xl tabular-nums ${
              remaining < 120_000 && !expired
                ? "text-destructive"
                : "text-foreground"
            }`}
          >
            {formatCountdown(remaining)}
          </p>
        </div>

        <ol className="space-y-2">
          {steps.map((label, i) => {
            const done = i < stepIndex || (i === stepIndex && ticket.step === "settle");
            const current = i === stepIndex;
            return (
              <li
                key={label}
                className={`flex items-center gap-2 ${
                  current ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="font-mono w-4">{done ? "✓" : i + 1}</span>
                {label}
                {current && ticket.step !== "settle" ? (
                  <button
                    type="button"
                    disabled={
                      ticket.step === "submit" && expired
                    }
                    onClick={() => dispatch({ type: "advanceTicketStep" })}
                    className="ml-auto h-8 rounded border border-border px-2 text-xs hover:bg-accent disabled:opacity-50"
                  >
                    Advance
                  </button>
                ) : null}
              </li>
            );
          })}
        </ol>

        {ticket.step === "submit" && expired ? (
          <p className="text-destructive">
            Reporting window missed; renegotiate
          </p>
        ) : null}

        {ticket.step === "settle" || stepIndex >= 4 ? (
          <Segmented
            label="Settlement outcome"
            value={ticket.settleOutcome ?? "event"}
            options={[
              { value: "event", label: "Event happens" },
              { value: "no-event", label: "Doesn't happen" },
            ]}
            onChange={(v) =>
              dispatch({
                type: "setSettleOutcome",
                outcome: v as "event" | "no-event",
              })
            }
          />
        ) : null}

        {settlePayoutUsd !== null ? (
          <p className="font-mono">
            Clearinghouse payout ${(settlePayoutUsd / 1e6).toFixed(2)}m · Net P&L{" "}
            {outcomePnL !== null
              ? fmtMoneyMillions(outcomePnL, state.scenario.ccy)
              : "—"}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}