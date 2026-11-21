import { kalshiBlockMin, VENUES } from "@/data/venues";
import { analyzeAskBook } from "@/lib/math";
import type { MarketSnapshot, RouteDecision, Scenario } from "@/lib/types";

export type RoutingInputs = {
  contractsN: number;
  market: MarketSnapshot;
  scenario: Scenario;
  ecpPass: boolean;
};

const PM_SPORTS_ELIGIBLE = ["Politics", "Macroeconomics", "Sports"];

function pmCategoryEligible(category: "sports" | "non-sports"): boolean {
  if (category === "sports") {
    return PM_SPORTS_ELIGIBLE.includes("Sports");
  }
  return false;
}

export function computeRoute(inputs: RoutingInputs): RouteDecision {
  const { contractsN: N, market, ecpPass: ecpOk } = inputs;
  const checks: RouteDecision["checks"] = [];
  const reasons: string[] = [];

  checks.push({
    label: "Eligible Contract Participant (CEA §1a(18))",
    pass: ecpOk,
    detail: ecpOk
      ? "Client meets ECP threshold for block trading"
      : "Both block counterparties must be ECPs (CEA §1a(18))",
  });

  if (!ecpOk) {
    return {
      route: null,
      reasons: ["ECP check failed — block routing disabled"],
      checks,
      polymarketAlternative: false,
    };
  }

  const blockMin = kalshiBlockMin(market.category);
  const oi = market.openInterest?.value ?? null;

  if (oi !== null && oi > 0) {
    const multiple = N / oi;
    reasons.push(
      `${formatMultiple(multiple)}× open interest (${oi.toLocaleString("en-US")} contracts)`,
    );
    checks.push({
      label: "Size vs open interest",
      pass: true,
      detail: `Hedge is ${formatMultiple(multiple)}× reported OI`,
    });
  }

  const blockRatio = N / blockMin;
  reasons.push(
    `${blockRatio.toFixed(2)}× Kalshi block minimum (${blockMin.toLocaleString("en-US")})`,
  );
  checks.push({
    label: "Meets Kalshi block minimum",
    pass: N >= blockMin,
    detail: `N=${N.toLocaleString("en-US")}, minimum=${blockMin.toLocaleString("en-US")}`,
  });

  checks.push({
    label: "Reporting window",
    pass: true,
    detail: `Report to exchange within ${VENUES.kalshi.reportingWindowMin}:00 of agreement`,
  });

  checks.push({
    label: "Price rule",
    pass: true,
    detail: VENUES.kalshi.priceRule,
  });

  checks.push({
    label: "Position limit / accountability: confirm with exchange",
    pass: null,
    detail:
      "Polymarket US counts block positions toward Position Accountability Levels; Kalshi has member position limits (unverified)",
  });

  let polymarketAlternative = false;

  if (market.listed) {
    if (N < blockMin) {
      if (market.askBook) {
        const book = analyzeAskBook(market.askBook.levels, N);
        reasons.push(
          `Visible ask book: ${Math.round(book.totalContracts).toLocaleString("en-US")} contracts = ${book.pctOfHedge.toFixed(2)}% of hedge`,
        );
        if (book.vwapSlippage > 0) {
          reasons.push(
            `Estimated CLOB VWAP ${(book.vwapSlippage * 100).toFixed(1)}¢ to fill visible depth`,
          );
        }
      }
      reasons.push(
        "Not aggregable into a block by ordinary participants; check the adviser exemption (Rule 5.3(e)/5.3(m)(i))",
      );
      return {
        route: "CLOB",
        reasons,
        checks,
        polymarketAlternative: false,
      };
    }

    polymarketAlternative =
      pmCategoryEligible(market.category) && N >= 100_000;

    reasons.push("Listed market — primary route is a Kalshi block trade");
    if (polymarketAlternative) {
      reasons.push(
        "Polymarket US block eligible if listing confirmed (Sports category); no exchange fee if IB-arranged",
      );
    }

    return {
      route: "Kalshi block",
      reasons,
      checks,
      polymarketAlternative,
    };
  }

  reasons.push(VENUES.kalshi.customListing ?? "Custom listing path on Kalshi");
  reasons.push(
    "Secondary: OTC swap with market maker (bilateral credit risk)",
  );

  return {
    route: "Custom listing → block",
    reasons,
    checks,
    polymarketAlternative: false,
  };
}

function formatMultiple(x: number): string {
  if (x >= 100) {
    return Math.round(x).toLocaleString("en-US");
  }
  return x.toFixed(1);
}

export function routeBadgeLabel(decision: RouteDecision): string {
  if (decision.route === null) {
    return "Route blocked";
  }
  return decision.route;
}