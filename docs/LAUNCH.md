# gave. launch checklist (Oct 30)

## Done in this branch
- Tap route: input validation, scan logging via after() (non-blocking), lighter query
- Public profile pages cached 30 s (revalidate) so tap storms hit the cache, not Supabase
- Security headers, real page title/description, /privacy and /terms drafts
- k6 load test: loadtest/tap.k6.js

## You must do (dashboard, not code)
1. Supabase Auth -> URL Configuration: Site URL https://gave.ph; add redirects https://gave.ph/**, https://www.gave.ph/**, preview URLs.
2. Supabase Auth -> SMTP: use custom SMTP (Resend free tier is ~100 emails/day; upgrade or you will lock people out at launch). Turn on Google sign-in as the main route.
3. Supabase Auth -> Rate Limits: keep email sends/hour low per IP; enable CAPTCHA (Turnstile/hCaptcha) on sign-in.
4. Vercel -> Firewall: enable Bot Protection + Attack Challenge Mode ready; rate-limit rule on /c/* (e.g. 60 req/min/IP) and on /auth.
5. Verify RLS: run `select * from pg_policies` and confirm profiles UPDATE only allowed for owner_id = auth.uid(); confirm claim_card RPC checks status = 'unclaimed' and is SECURITY DEFINER with fixed search_path.
6. Confirm every NFC tag is written with https://gave.ph/c/CODE (not localhost, not a preview URL). Tap-test 3 cards of each design on iPhone and Android.
7. Add monitoring: UptimeRobot on gave.ph and a /c/ URL; Sentry (free) or Vercel Observability.
8. Fill the [support email] and refund policy placeholders in /privacy and /terms.
9. Homepage: working "Get your card" order path (Shopee/Lazada/GCash form), real card images, working About/Contact links.
10. Run k6 against a Vercel preview with ~10 real card codes before launch day; watch Supabase connection count.

## Launch day
- Pre-warm: tap a few cards, open key profiles to prime the cache.
- Watch Vercel Analytics, Supabase Reports, and Resend dashboard.
- If attacked: Vercel Firewall -> Attack Challenge Mode.
