export type Objection = {
  id: string;
  question: string;
  answer: string;
  sourceIds: string[];
  note?: string;
};

export const OBJECTIONS: Objection[] = [
  {
    id: "legal",
    question: "Is this legal?",
    answer:
      "Trades execute on CFTC-regulated exchanges (Kalshi is a DCM; Polymarket US is a DCM). Blocks are allowed for Eligible Contract Participants. Selfin says it is registering as an introducing broker with the NFA. Be candid that the CFTC is consulting on prediction-market rules (ANPRM, Mar 2026). On sports: the Sixth Circuit (25 Sep 2026, Tennessee and Ohio) reasoned that sports event contracts are \"not swaps\" because sporting events lack an inherent financial, economic or commercial consequence. A club's relegation revenue loss IS that economic consequence, which is the argument a corporate hedge makes. Keep an OTC route as a fallback.",
    sourceIds: ["selfin-site", "kalshi-inst", "cftc-anprm", "ca6-schuler"],
  },
  {
    id: "counterparty",
    question: "Who's the counterparty?",
    answer:
      "Institutional market makers; Selfin asks several for quotes and the client gets the best price.",
    sourceIds: ["selfin-site", "paula-x-otc"],
    note: "paula-x-otc renders with Unverified chip",
  },
  {
    id: "settlement",
    question: "How does it settle?",
    answer:
      "$1 if the event happens, $0 if not; the exchange's clearinghouse settles it, so the payout doesn't depend on the market maker.",
    sourceIds: ["selfin-site", "kalshi-inst"],
  },
  {
    id: "app",
    question: "Why can't I just buy it on the app?",
    answer:
      "The whole visible Coventry ask book (17,741 contracts, including a 10,000-lot at 95¢) is about 0.05% of the hedge, so the price has to come from market makers on a block, not the screen. Blocks have minimums (Kalshi 25k/50k, Polymarket US 100k) and must be reported within 15 minutes.",
    sourceIds: ["kalshi-book-cov", "kalshi-block-sp", "pm-blocks"],
  },
  {
    id: "gambling",
    question: "Isn't this just gambling?",
    answer:
      "Hedging a P&L exposure you already have is the opposite of speculation: cover is sized to the exposure, and over-hedging is flagged. ECP status includes a hedging prong for firms with >$1m net worth.",
    sourceIds: ["ecp"],
  },
  {
    id: "insurance",
    question: "Why not insurance?",
    answer:
      "Selfin's thesis: insurers won't cover most quarter-wiping events and no futures market exists for them; event contracts price them daily.",
    sourceIds: ["selfin-site"],
  },
  {
    id: "accounting",
    question: "How is it accounted for?",
    answer:
      "Flag it, don't answer it: derivatives are marked to market; hedge-accounting designation needs auditor sign-off. The tool shows mark-to-market swing as a risk.",
    sourceIds: [],
    note: "Not accounting advice",
  },
  {
    id: "insiders",
    question: "Can insiders manipulate it?",
    answer:
      "Contracts bar insiders; Kalshi's proposed flight contracts banned TSA, airport and union officials and still drew manipulation concerns. Build the insider policy into onboarding.",
    sourceIds: ["fortune-flights"],
  },
];