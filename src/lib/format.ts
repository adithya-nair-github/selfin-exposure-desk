import type { Ccy } from "@/lib/types";

function ccySymbol(ccy: Ccy): string {
  if (ccy === "GBP") return "£";
  if (ccy === "CAD") return "C$";
  return "$";
}

/** `value` is in millions of local currency unless compact handles larger magnitudes. */
export function fmtMoney(
  value: number,
  ccy: Ccy,
  options?: { compact?: boolean },
): string {
  const sym = ccySymbol(ccy);
  const sign = value < 0 ? "−" : "";
  const abs = Math.abs(value);
  if (options?.compact === true && abs >= 1_000) {
    return `${sign}${sym}${(abs / 1_000).toFixed(2)}b`;
  }
  return `${sign}${sym}${abs.toFixed(1)}m`;
}

/** Millions with one decimal, e.g. £49.0m */
export function fmtMoneyMillions(value: number, ccy: Ccy): string {
  const sym = ccySymbol(ccy);
  const sign = value < 0 ? "−" : "";
  return `${sign}${sym}${Math.abs(value).toFixed(1)}m`;
}

export function fmtCents(q: number): string {
  const cents = q * 100;
  return `${cents.toFixed(1)}¢`;
}

export function fmtPct(p: number, digits = 1): string {
  return `${(p * 100).toFixed(digits)}%`;
}

export function fmtInt(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

export function fmtContracts(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${(n / 1_000).toFixed(2)}K`;
  }
  return fmtInt(n);
}