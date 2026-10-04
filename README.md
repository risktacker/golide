# GOLIDE

GOLIDE is Esiah Kapinga's founder-led business hub for software, market systems, scientific research, and media.

## Stack

- Next.js / React / TypeScript
- Tailwind CSS 4
- Vinext on Cloudflare Workers (D1 `golide-db`, Images, static assets)
- Lucide icon system

## Local development

```bash
npm install
npm run dev
```

## Deploy

Every push to `main` deploys to Cloudflare via `.github/workflows/deploy-cloudflare.yml`
and smoke-tests golidee.com, www, marketplace and studio afterwards. Bindings and custom
domains are in `wrangler.jsonc`. Secrets live in GitHub (repo → Settings → Secrets → Actions)
and are copied into the Worker on each deploy: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `OPENAI_API_KEY`.

## Main routes

- `/` — ecosystem homepage
- `/founder` — complete founder portfolio and experience archive
- `/research` — research portfolio
- `/projects/syla`
- `/projects/malaria`
- `/projects/tinospora`
- `/projects/child-mortality`

Project video footage is streamed from the original portfolio archive so the repository stays lightweight. Replace the video URLs in `app/page.tsx` and the relevant project pages when moving the media to permanent object storage.

## Production

- https://golidee.com (hub)
- https://marketplace.golidee.com (marketplace)
- https://studio.golidee.com (Content Engine Studio — separate repo `golide-content-engine`)
