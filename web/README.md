# AI Crawler Tracker

Track which AI bots (GPTBot, ClaudeBot, PerplexityBot, etc.) are crawling your website, what pages they visit, and how often. Add a single script tag to your site and monitor activity from a dashboard.

**Live app:** [ai-crawler-tracker.vercel.app](https://ai-crawler-tracker.vercel.app)

## Architecture

```
Your website                         Supabase
─────────────                        ────────
<script src="…/tracker.js">  →       Edge Function (classify + store)
                                     Postgres (sites, crawler_events)
                                           ↑
Vercel (Next.js dashboard)  ←──────────────┘
```

- **tracker.js** -- lightweight script embedded on your site; fires a POST on page load directly to the Supabase edge function
- **Edge Function (`track`)** -- validates the payload, classifies the bot by User-Agent, and inserts the event
- **Dashboard** -- authenticated views showing activity per site, bot breakdowns, top pages, and weekly trends

## Local Development

### Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Setup

```bash
# Start local Supabase (Postgres, Auth, Edge Functions)
supabase start

# Seed the database with demo data
supabase db reset

# Install dependencies and start the dev server
cd web
npm install
cp .env.local.example .env.local   # uses local Supabase by default
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo user

Sign in at [/login](http://localhost:3000/login) with:

- **Email:** `demo@searchable.dev`
- **Password:** `demo-password-123`

This account includes sample sites and crawler events for local demos.

### Simulating bot crawls

```bash
# Against local Supabase (requires supabase start)
npm run crawl:bots

# Against production
npm run crawl:bots -- --prod --site-id=<your-site-uuid>

# Specific bots only
npm run crawl:bots -- --prod --site-id=<uuid> --bots=GPTBot,ClaudeBot
```

This sends POSTs with spoofed User-Agent headers — no browser required.

## Production Deployment

### 1. Supabase

Create a project at [supabase.com](https://supabase.com), then:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
supabase functions deploy track
```

Set the **Site URL** in Authentication > URL Configuration to your Vercel app URL.

### 2. Vercel

```bash
cd web
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL        # https://<ref>.supabase.co
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY   # from Supabase dashboard > Settings > API

# Deploy to production
vercel --prod
```

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (include `https://`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |

## Embedding the Tracker

Add this to any website you want to monitor:

```html
<script
  defer
  src="https://ai-crawler-tracker.vercel.app/tracker.js"
  data-site-id="YOUR_SITE_ID"
  data-endpoint="https://trkaijnxdulrvtgcvddn.supabase.co/functions/v1/track"
></script>
```

The site ID is shown in the dashboard after you register a site.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run crawl:bots` | Simulate AI bot crawls via HTTP |
| `npm run lint` | Run ESLint |
