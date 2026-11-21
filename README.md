# Exposure Desk (Selfin concept prototype)

Exposure Desk is a fully client-side internal workbench for mapping corporate event P&L, checking market-implied probabilities and block liquidity, sizing hedges, running simulated market-maker RFQs, and producing a one-page exposure memo. It is a concept prototype by Adithya Nair and is not affiliated with Selfin.

## Run locally

```bash
npm install
npm run dev
```

## Data provenance

- Market snapshots and the **Coventry City** EPL relegation order book are from [Kalshi's public API](https://api.elections.kalshi.com/) captured on **21 Nov 2026 (IST)** (`kalshi-api-epl`, `kalshi-book-cov` in `src/data/sources.ts`).
- Market-maker quotes in the Quote tab are **simulated**; edge is a user assumption, not Selfin pricing.
- Illustrative and unverified figures are flagged in-app with dotted underlines, “Unverified” chips, or tooltips.
- Full source registry: `src/data/sources.ts`.

## Deploy

Zero-config on [Vercel](https://vercel.com): `vercel` from this directory.