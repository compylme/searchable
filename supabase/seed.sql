-- Demo seed data for local development.
-- Applied automatically after migrations on `supabase db reset`.
--
-- Login credentials:
--   Email:    demo@searchable.dev
--   Password: demo-password-123

-- ---------------------------------------------------------------------------
-- Demo user (auth.users + auth.identities)
-- ---------------------------------------------------------------------------
-- Deterministic UUID so sites/events can reference a stable user_id.
-- LOCAL DEVELOPMENT ONLY — do not run against a deployed project.

do $$
declare
  demo_user_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    demo_user_id,
    'authenticated',
    'authenticated',
    'demo@searchable.dev',
    crypt('demo-password-123', gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Demo User"}'::jsonb,
    now(),
    now()
  )
  on conflict (id) do nothing;

  insert into auth.identities (
    id,
    user_id,
    provider,
    provider_id,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    demo_user_id,
    demo_user_id,
    'email',
    demo_user_id::text,
    jsonb_build_object(
      'sub', demo_user_id::text,
      'email', 'demo@searchable.dev',
      'email_verified', true,
      'phone_verified', false
    ),
    now(),
    now(),
    now()
  )
  on conflict do nothing;
end $$;

-- ---------------------------------------------------------------------------
-- Sites
-- ---------------------------------------------------------------------------

insert into public.sites (id, user_id, domain, created_at) values
  (
    'b1000000-0000-4000-8000-000000000001',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'acme-blog.com',
    now() - interval '45 days'
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'shopfront.io',
    now() - interval '30 days'
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'docs.opentools.dev',
    now() - interval '20 days'
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'portfolio.design',
    now() - interval '10 days'
  )
on conflict (user_id, domain) do nothing;

-- ---------------------------------------------------------------------------
-- Crawler events
-- ---------------------------------------------------------------------------
-- Pre-classified rows matching supabase/functions/track/definitions/bots.ts.
-- Spread across the four sites with varied pages and timestamps (last ~30 days).

insert into public.crawler_events (
  site_id,
  "timestamp",
  user_agent,
  bot_name,
  platform,
  bot_type,
  page_url,
  page_path,
  ip_hash
) values
  -- =========================================================================
  -- acme-blog.com (content-heavy blog) — ~28 events
  -- =========================================================================
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '1 day 3 hours',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://acme-blog.com/blog/ai-search-trends-2026',
    '/blog/ai-search-trends-2026',
    encode(sha256('203.0.113.10'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '2 days 8 hours',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://acme-blog.com/blog/building-with-llms',
    '/blog/building-with-llms',
    encode(sha256('203.0.113.11'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '5 days 1 hour',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://acme-blog.com/',
    '/',
    encode(sha256('203.0.113.12'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '8 days 14 hours',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://acme-blog.com/blog/seo-for-ai-crawlers',
    '/blog/seo-for-ai-crawlers',
    encode(sha256('203.0.113.13'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '12 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    'ChatGPT-User', 'OpenAI', 'assistant',
    'https://acme-blog.com/blog/ai-search-trends-2026',
    '/blog/ai-search-trends-2026',
    encode(sha256('198.51.100.20'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '3 days 6 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    'ChatGPT-User', 'OpenAI', 'assistant',
    'https://acme-blog.com/about',
    '/about',
    encode(sha256('198.51.100.21'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '4 hours',
    'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)',
    'OAI-SearchBot', 'OpenAI', 'search',
    'https://acme-blog.com/blog/building-with-llms',
    '/blog/building-with-llms',
    encode(sha256('198.51.100.30'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '6 days 2 hours',
    'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)',
    'OAI-SearchBot', 'OpenAI', 'search',
    'https://acme-blog.com/blog/seo-for-ai-crawlers',
    '/blog/seo-for-ai-crawlers',
    encode(sha256('198.51.100.31'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '1 day 18 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'ClaudeBot', 'Anthropic', 'training',
    'https://acme-blog.com/blog/ai-search-trends-2026',
    '/blog/ai-search-trends-2026',
    encode(sha256('203.0.113.40'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '7 days 9 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'ClaudeBot', 'Anthropic', 'training',
    'https://acme-blog.com/blog/building-with-llms',
    '/blog/building-with-llms',
    encode(sha256('203.0.113.41'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '14 days 3 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'ClaudeBot', 'Anthropic', 'training',
    'https://acme-blog.com/archive',
    '/archive',
    encode(sha256('203.0.113.42'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '2 days 1 hour',
    'Mozilla/5.0 (compatible; Google-Extended)',
    'Google-Extended', 'Google', 'training',
    'https://acme-blog.com/blog/ai-search-trends-2026',
    '/blog/ai-search-trends-2026',
    encode(sha256('192.0.2.50'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '9 days 11 hours',
    'Mozilla/5.0 (compatible; Google-Extended)',
    'Google-Extended', 'Google', 'training',
    'https://acme-blog.com/',
    '/',
    encode(sha256('192.0.2.51'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '20 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
    'PerplexityBot', 'Perplexity', 'search',
    'https://acme-blog.com/blog/seo-for-ai-crawlers',
    '/blog/seo-for-ai-crawlers',
    encode(sha256('198.51.100.60'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '4 days 15 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
    'PerplexityBot', 'Perplexity', 'search',
    'https://acme-blog.com/blog/building-with-llms',
    '/blog/building-with-llms',
    encode(sha256('198.51.100.61'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '11 days 4 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
    'PerplexityBot', 'Perplexity', 'search',
    'https://acme-blog.com/topics/ai',
    '/topics/ai',
    encode(sha256('198.51.100.62'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '3 days 20 hours',
    'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    'Meta-ExternalAgent', 'Meta', 'training',
    'https://acme-blog.com/blog/ai-search-trends-2026',
    '/blog/ai-search-trends-2026',
    encode(sha256('203.0.113.70'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '16 days 7 hours',
    'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    'Meta-ExternalAgent', 'Meta', 'training',
    'https://acme-blog.com/about',
    '/about',
    encode(sha256('203.0.113.71'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '5 days 12 hours',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Applebot-Extended/0.1',
    'Applebot-Extended', 'Apple', 'assistant',
    'https://acme-blog.com/blog/building-with-llms',
    '/blog/building-with-llms',
    encode(sha256('192.0.2.80'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '13 days 2 hours',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Applebot-Extended/0.1',
    'Applebot-Extended', 'Apple', 'assistant',
    'https://acme-blog.com/',
    '/',
    encode(sha256('192.0.2.81'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '6 days 18 hours',
    'CCBot/2.0 (+https://commoncrawl.org/faq/)',
    'CCBot', 'Common Crawl', 'dataset',
    'https://acme-blog.com/blog/ai-search-trends-2026',
    '/blog/ai-search-trends-2026',
    encode(sha256('203.0.113.90'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '18 days 5 hours',
    'CCBot/2.0 (+https://commoncrawl.org/faq/)',
    'CCBot', 'Common Crawl', 'dataset',
    'https://acme-blog.com/archive',
    '/archive',
    encode(sha256('203.0.113.91'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '22 days 10 hours',
    'CCBot/2.0 (+https://commoncrawl.org/faq/)',
    'CCBot', 'Common Crawl', 'dataset',
    'https://acme-blog.com/blog/seo-for-ai-crawlers',
    '/blog/seo-for-ai-crawlers',
    encode(sha256('203.0.113.92'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '8 days 3 hours',
    'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; https://zhanzhang.toutiao.com/)',
    'Bytespider', 'ByteDance', 'training',
    'https://acme-blog.com/blog/building-with-llms',
    '/blog/building-with-llms',
    encode(sha256('198.51.100.100'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '19 days 14 hours',
    'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; https://zhanzhang.toutiao.com/)',
    'Bytespider', 'ByteDance', 'training',
    'https://acme-blog.com/',
    '/',
    encode(sha256('198.51.100.101'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '25 days 6 hours',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    null, null, 'unknown',
    'https://acme-blog.com/blog/ai-search-trends-2026',
    '/blog/ai-search-trends-2026',
    encode(sha256('203.0.113.200'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '10 days 8 hours',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://acme-blog.com/topics/ai',
    '/topics/ai',
    encode(sha256('203.0.113.14'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    now() - interval '27 days 2 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'ClaudeBot', 'Anthropic', 'training',
    'https://acme-blog.com/blog/welcome',
    '/blog/welcome',
    encode(sha256('203.0.113.43'::bytea), 'hex')
  ),

  -- =========================================================================
  -- shopfront.io (e-commerce) — ~22 events
  -- =========================================================================
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '6 hours',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://shopfront.io/products/running-shoes',
    '/products/running-shoes',
    encode(sha256('203.0.113.110'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '2 days 4 hours',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://shopfront.io/products/winter-jacket',
    '/products/winter-jacket',
    encode(sha256('203.0.113.111'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '9 days 1 hour',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://shopfront.io/collections/outdoor',
    '/collections/outdoor',
    encode(sha256('203.0.113.112'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '1 day 2 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    'ChatGPT-User', 'OpenAI', 'assistant',
    'https://shopfront.io/products/running-shoes',
    '/products/running-shoes',
    encode(sha256('198.51.100.120'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '5 days 9 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    'ChatGPT-User', 'OpenAI', 'assistant',
    'https://shopfront.io/faq',
    '/faq',
    encode(sha256('198.51.100.121'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '3 hours',
    'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)',
    'OAI-SearchBot', 'OpenAI', 'search',
    'https://shopfront.io/products/winter-jacket',
    '/products/winter-jacket',
    encode(sha256('198.51.100.130'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '7 days 16 hours',
    'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)',
    'OAI-SearchBot', 'OpenAI', 'search',
    'https://shopfront.io/',
    '/',
    encode(sha256('198.51.100.131'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '1 day 10 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'ClaudeBot', 'Anthropic', 'training',
    'https://shopfront.io/products/running-shoes',
    '/products/running-shoes',
    encode(sha256('203.0.113.140'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '11 days 5 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'ClaudeBot', 'Anthropic', 'training',
    'https://shopfront.io/collections/outdoor',
    '/collections/outdoor',
    encode(sha256('203.0.113.141'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '4 days 2 hours',
    'Mozilla/5.0 (compatible; Google-Extended)',
    'Google-Extended', 'Google', 'training',
    'https://shopfront.io/products/winter-jacket',
    '/products/winter-jacket',
    encode(sha256('192.0.2.150'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '15 days 8 hours',
    'Mozilla/5.0 (compatible; Google-Extended)',
    'Google-Extended', 'Google', 'training',
    'https://shopfront.io/collections/sale',
    '/collections/sale',
    encode(sha256('192.0.2.151'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '8 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
    'PerplexityBot', 'Perplexity', 'search',
    'https://shopfront.io/products/running-shoes',
    '/products/running-shoes',
    encode(sha256('198.51.100.160'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '6 days 11 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
    'PerplexityBot', 'Perplexity', 'search',
    'https://shopfront.io/faq',
    '/faq',
    encode(sha256('198.51.100.161'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '3 days 7 hours',
    'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    'Meta-ExternalAgent', 'Meta', 'training',
    'https://shopfront.io/products/winter-jacket',
    '/products/winter-jacket',
    encode(sha256('203.0.113.170'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '12 days 13 hours',
    'meta-externalfetcher/1.0 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    'Meta-ExternalAgent', 'Meta', 'training',
    'https://shopfront.io/',
    '/',
    encode(sha256('203.0.113.171'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '2 days 19 hours',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Applebot-Extended/0.1',
    'Applebot-Extended', 'Apple', 'assistant',
    'https://shopfront.io/collections/outdoor',
    '/collections/outdoor',
    encode(sha256('192.0.2.180'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '10 days 6 hours',
    'CCBot/2.0 (+https://commoncrawl.org/faq/)',
    'CCBot', 'Common Crawl', 'dataset',
    'https://shopfront.io/products/running-shoes',
    '/products/running-shoes',
    encode(sha256('203.0.113.190'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '21 days 3 hours',
    'CCBot/2.0 (+https://commoncrawl.org/faq/)',
    'CCBot', 'Common Crawl', 'dataset',
    'https://shopfront.io/collections/sale',
    '/collections/sale',
    encode(sha256('203.0.113.191'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '8 days 20 hours',
    'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; https://zhanzhang.toutiao.com/)',
    'Bytespider', 'ByteDance', 'training',
    'https://shopfront.io/products/winter-jacket',
    '/products/winter-jacket',
    encode(sha256('198.51.100.200'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '17 days 9 hours',
    'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; https://zhanzhang.toutiao.com/)',
    'Bytespider', 'ByteDance', 'training',
    'https://shopfront.io/',
    '/',
    encode(sha256('198.51.100.201'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    now() - interval '14 days 1 hour',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    null, null, 'unknown',
    'https://shopfront.io/products/running-shoes',
    '/products/running-shoes',
    encode(sha256('203.0.113.210'::bytea), 'hex')
  ),

  -- =========================================================================
  -- docs.opentools.dev (documentation) — ~20 events
  -- =========================================================================
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '2 hours',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://docs.opentools.dev/api/reference',
    '/api/reference',
    encode(sha256('203.0.113.220'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '3 days 3 hours',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://docs.opentools.dev/guides/getting-started',
    '/guides/getting-started',
    encode(sha256('203.0.113.221'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '10 days 7 hours',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://docs.opentools.dev/api/auth',
    '/api/auth',
    encode(sha256('203.0.113.222'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '1 day 5 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    'ChatGPT-User', 'OpenAI', 'assistant',
    'https://docs.opentools.dev/guides/getting-started',
    '/guides/getting-started',
    encode(sha256('198.51.100.230'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '6 days 14 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    'ChatGPT-User', 'OpenAI', 'assistant',
    'https://docs.opentools.dev/api/reference',
    '/api/reference',
    encode(sha256('198.51.100.231'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '9 hours',
    'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)',
    'OAI-SearchBot', 'OpenAI', 'search',
    'https://docs.opentools.dev/api/auth',
    '/api/auth',
    encode(sha256('198.51.100.240'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '4 days 18 hours',
    'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)',
    'OAI-SearchBot', 'OpenAI', 'search',
    'https://docs.opentools.dev/guides/webhooks',
    '/guides/webhooks',
    encode(sha256('198.51.100.241'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '2 days 12 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'ClaudeBot', 'Anthropic', 'training',
    'https://docs.opentools.dev/api/reference',
    '/api/reference',
    encode(sha256('203.0.113.250'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '8 days 4 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'ClaudeBot', 'Anthropic', 'training',
    'https://docs.opentools.dev/guides/getting-started',
    '/guides/getting-started',
    encode(sha256('203.0.113.251'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '16 days 11 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'ClaudeBot', 'Anthropic', 'training',
    'https://docs.opentools.dev/',
    '/',
    encode(sha256('203.0.113.252'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '5 days 3 hours',
    'Mozilla/5.0 (compatible; Google-Extended)',
    'Google-Extended', 'Google', 'training',
    'https://docs.opentools.dev/api/reference',
    '/api/reference',
    encode(sha256('192.0.2.10'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '13 days 16 hours',
    'Mozilla/5.0 (compatible; GoogleOther)',
    'Google-Extended', 'Google', 'training',
    'https://docs.opentools.dev/guides/webhooks',
    '/guides/webhooks',
    encode(sha256('192.0.2.11'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '14 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
    'PerplexityBot', 'Perplexity', 'search',
    'https://docs.opentools.dev/guides/getting-started',
    '/guides/getting-started',
    encode(sha256('198.51.100.12'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '7 days 8 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
    'PerplexityBot', 'Perplexity', 'search',
    'https://docs.opentools.dev/api/auth',
    '/api/auth',
    encode(sha256('198.51.100.13'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '4 days 21 hours',
    'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    'Meta-ExternalAgent', 'Meta', 'training',
    'https://docs.opentools.dev/api/reference',
    '/api/reference',
    encode(sha256('203.0.113.14'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '3 days 15 hours',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Applebot-Extended/0.1',
    'Applebot-Extended', 'Apple', 'assistant',
    'https://docs.opentools.dev/guides/getting-started',
    '/guides/getting-started',
    encode(sha256('192.0.2.20'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '11 days 2 hours',
    'CCBot/2.0 (+https://commoncrawl.org/faq/)',
    'CCBot', 'Common Crawl', 'dataset',
    'https://docs.opentools.dev/api/reference',
    '/api/reference',
    encode(sha256('203.0.113.30'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '18 days 19 hours',
    'CCBot/2.0 (+https://commoncrawl.org/faq/)',
    'CCBot', 'Common Crawl', 'dataset',
    'https://docs.opentools.dev/',
    '/',
    encode(sha256('203.0.113.31'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '9 days 22 hours',
    'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; https://zhanzhang.toutiao.com/)',
    'Bytespider', 'ByteDance', 'training',
    'https://docs.opentools.dev/guides/webhooks',
    '/guides/webhooks',
    encode(sha256('198.51.100.40'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    now() - interval '19 days 4 hours',
    'curl/8.4.0',
    null, null, 'unknown',
    'https://docs.opentools.dev/api/reference',
    '/api/reference',
    encode(sha256('203.0.113.220'::bytea), 'hex')
  ),

  -- =========================================================================
  -- portfolio.design (smaller personal site) — ~12 events
  -- =========================================================================
  (
    'b1000000-0000-4000-8000-000000000004',
    now() - interval '1 day 1 hour',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://portfolio.design/work/brand-redesign',
    '/work/brand-redesign',
    encode(sha256('203.0.113.50'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    now() - interval '5 days 6 hours',
    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
    'GPTBot', 'OpenAI', 'training',
    'https://portfolio.design/',
    '/',
    encode(sha256('203.0.113.51'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    now() - interval '2 days 9 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    'ChatGPT-User', 'OpenAI', 'assistant',
    'https://portfolio.design/about',
    '/about',
    encode(sha256('198.51.100.52'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    now() - interval '7 hours',
    'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)',
    'OAI-SearchBot', 'OpenAI', 'search',
    'https://portfolio.design/work/brand-redesign',
    '/work/brand-redesign',
    encode(sha256('198.51.100.53'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    now() - interval '4 days 11 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    'ClaudeBot', 'Anthropic', 'training',
    'https://portfolio.design/work/mobile-app',
    '/work/mobile-app',
    encode(sha256('203.0.113.54'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    now() - interval '3 days 2 hours',
    'Mozilla/5.0 (compatible; Google-Extended)',
    'Google-Extended', 'Google', 'training',
    'https://portfolio.design/',
    '/',
    encode(sha256('192.0.2.55'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    now() - interval '1 day 14 hours',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
    'PerplexityBot', 'Perplexity', 'search',
    'https://portfolio.design/work/brand-redesign',
    '/work/brand-redesign',
    encode(sha256('198.51.100.56'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    now() - interval '6 days 20 hours',
    'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    'Meta-ExternalAgent', 'Meta', 'training',
    'https://portfolio.design/about',
    '/about',
    encode(sha256('203.0.113.57'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    now() - interval '2 days 16 hours',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Applebot-Extended/0.1',
    'Applebot-Extended', 'Apple', 'assistant',
    'https://portfolio.design/work/mobile-app',
    '/work/mobile-app',
    encode(sha256('192.0.2.58'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    now() - interval '8 days 7 hours',
    'CCBot/2.0 (+https://commoncrawl.org/faq/)',
    'CCBot', 'Common Crawl', 'dataset',
    'https://portfolio.design/',
    '/',
    encode(sha256('203.0.113.59'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    now() - interval '9 days 12 hours',
    'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; https://zhanzhang.toutiao.com/)',
    'Bytespider', 'ByteDance', 'training',
    'https://portfolio.design/work/brand-redesign',
    '/work/brand-redesign',
    encode(sha256('198.51.100.60'::bytea), 'hex')
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    now() - interval '3 days 22 hours',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    null, null, 'unknown',
    'https://portfolio.design/contact',
    '/contact',
    encode(sha256('203.0.113.61'::bytea), 'hex')
  );
