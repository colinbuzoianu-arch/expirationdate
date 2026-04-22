# Expiration Date 💀

> "Our app says we have 14 months left." — Find out yours.

A viral relationship prediction app that uses conflict frequency, intimacy trends, and goal alignment data to predict a literal breakup date.

## Setup

### 1. Clone and install
```bash
npm install
```

### 2. Environment variables
Create `.env.local`:
```
ANTHROPIC_API_KEY=your_anthropic_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRICE_ID=your_stripe_price_id          # one-time $4.99 price
NEXT_PUBLIC_APP_URL=https://expirationdate.app
```

### 3. Stripe Setup
1. Create a **one-time** product in Stripe Dashboard: "$4.99 – Full Expiration Date Report"
2. Copy the Price ID into `STRIPE_PRICE_ID`

### 4. Deploy to Vercel
```bash
npx vercel
```
Add environment variables in Vercel dashboard.

## How it works

1. User answers 10 targeted questions (conflict frequency, intimacy trend, goal alignment, contempt, gut feeling)
2. Answers sent to Claude claude-haiku-4-5-20251001 via `/api/analyze`
3. AI returns a `ExpirationResult` with predicted months remaining, expiration label, survival odds, and pattern analysis
4. Free result shows: expiration date, risk level, pattern name, biggest threat + strength
5. $4.99 unlocks: full factor breakdown, 3 action steps, urgency verdict, shareable card

## Customization

- **Questions**: `lib/questions.ts`
- **AI prompt**: `lib/prompt.ts`
- **Types/schema**: `lib/types.ts`
- **Price**: Update Stripe price and paywall copy in `app/page.tsx`
- **Domain**: Update `NEXT_PUBLIC_APP_URL` and footer links

## Tech stack
- Next.js 14 (App Router)
- TypeScript
- Anthropic API (Claude Haiku)
- Stripe Checkout
- Zero dependencies beyond those
