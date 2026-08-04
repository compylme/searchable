# AI Crawler Tracker

Track which AI bots (GPTBot, ClaudeBot, PerplexityBot, etc.) are crawling your website, what pages they visit, and how often. Add a single script tag to your site and monitor activity from a dashboard.

**Live app:** [ai-crawler-tracker.vercel.app](https://ai-crawler-tracker.vercel.app)

## Architecture

```
Your website                         Supabase
─────────────                        ────────
<script> beacon IIFE </script>  →    Edge Function GET /track?sid=…
                                     Postgres (sites, crawler_events)
                                           ↑
Vercel (Next.js dashboard)  ←──────────────┘
```

- **Beacon snippet** -- tiny inline script that loads the track endpoint as a `GET` with `?sid=`; the browser sends User-Agent and Referer
- **Edge Function (`track`)** -- validates `sid` + Referer, classifies the bot by User-Agent, and inserts the event
- **Dashboard** -- authenticated views showing activity per site, bot breakdowns, top pages, and weekly trends

**Note:** Page URL comes from the `Referer` header. Privacy modes or some bots may omit it; those hits return `400` and are not stored.

## Local Development

### Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno](https://deno.land/) (for edge function tests)

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
cd web
npm run crawl:bots

# Against production
npm run crawl:bots -- --prod --site-id=<your-site-uuid>

# Specific bots only
npm run crawl:bots -- --prod --site-id=<uuid> --bots=GPTBot,ClaudeBot
```

This sends GETs with spoofed User-Agent and Referer headers — no browser required.

### Edge function tests

```bash
cd supabase
deno task test:unit
deno task test          # unit + integration + e2e (needs supabase start)
```

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
<script>
(function(s){
  var d=document,g=d.createElement('script');
  g.async=1;g.src='https://trkaijnxdulrvtgcvddn.supabase.co/functions/v1/track?sid='+s;
  d.head.appendChild(g);
})('YOUR_TRACKING_ID');
</script>
```

The tracking ID is shown in the dashboard after you register a site.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run crawl:bots` | Simulate AI bot crawls via HTTP |
| `npm run lint` | Run ESLint |
