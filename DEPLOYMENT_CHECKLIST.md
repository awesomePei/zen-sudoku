# Cloudflare Workers Deployment Checklist

## Pre-Deployment (Local Testing)

- [ ] Run `npm install` to install all dependencies
- [ ] Copy `.env.example` to `.env.local`
- [ ] Update `.env.local` with your API URL for local testing:
  ```
  VITE_API_URL=http://localhost:8787
  ```
- [ ] Run `npm run dev` to start local development
- [ ] Test locally at http://localhost:5173:
  - [ ] Generate an Easy puzzle
  - [ ] Make a few moves
  - [ ] Submit and verify scoring works
  - [ ] Check browser console for errors

## Cloudflare Setup

- [ ] Create Cloudflare account at https://dash.cloudflare.com
- [ ] Create KV namespace:
  - [ ] Go to Workers & Pages → KV
  - [ ] Click "Create Namespace"
  - [ ] Name it `zen-sudoku-games`
  - [ ] Note the namespace ID
- [ ] Create production KV namespace (for wrangler.toml):
  - [ ] Create another namespace for preview: `zen-sudoku-games-preview`
  - [ ] Note this ID
- [ ] Get Cloudflare credentials:
  - [ ] Account ID: Dashboard → Overview → Copy Account ID
  - [ ] API Token: My Profile → API Tokens → Create Token
    - Use "Edit Cloudflare Workers" template
    - Copy token and save securely

## Wrangler Configuration

- [ ] Update `wrangler.toml`:
  ```toml
  [[kv_namespaces]]
  binding = "GAMES"
  id = "YOUR_KV_NAMESPACE_ID"           ← Replace
  preview_id = "YOUR_KV_PREVIEW_ID"     ← Replace
  ```
- [ ] Login to Cloudflare: `wrangler login`
- [ ] Test local wrangler: `wrangler dev --local`
  - [ ] API responds at http://localhost:8787/api/puzzle?difficulty=Easy

## Deploy Worker

- [ ] Run: `npm run build:worker`
- [ ] Run: `npm run deploy`
- [ ] Note your worker URL: `https://zen-sudoku-api.<account>.workers.dev`
- [ ] Verify deployment:
  ```bash
  curl https://zen-sudoku-api.<account>.workers.dev/api/puzzle?difficulty=Easy
  ```
- [ ] Check Cloudflare dashboard → Workers & Pages → zen-sudoku-api → Deployments

## Deploy Frontend

Choose one option:

### Option A: Cloudflare Pages

- [ ] Run: `npm run build`
- [ ] Deploy: `wrangler pages deploy dist --project-name zen-sudoku`
- [ ] Get Pages URL from output
- [ ] Set environment variable in Pages settings:
  ```
  VITE_API_URL=https://zen-sudoku-api.<account>.workers.dev
  ```
- [ ] Redeploy: `wrangler pages deploy dist --project-name zen-sudoku`

### Option B: Vercel

- [ ] Push code to GitHub
- [ ] Import repo at https://vercel.com
- [ ] Add environment variable:
  ```
  VITE_API_URL=https://zen-sudoku-api.<account>.workers.dev
  ```
- [ ] Deploy

### Option C: Netlify

- [ ] Push code to GitHub
- [ ] Import repo at https://app.netlify.com
- [ ] Add build environment variable:
  ```
  VITE_API_URL=https://zen-sudoku-api.<account>.workers.dev
  ```
- [ ] Deploy

## Post-Deployment Testing

- [ ] Open your deployed frontend URL
- [ ] Test game flow:
  - [ ] Generate puzzle (Easy)
  - [ ] Make 3-4 moves
  - [ ] Check for errors in browser console
  - [ ] Complete and submit puzzle
  - [ ] Verify score is calculated
- [ ] Check different difficulties:
  - [ ] Easy ✓
  - [ ] Medium ✓
  - [ ] Hard ✓
  - [ ] Expert ✓
- [ ] Test stats tracking:
  - [ ] Play 2-3 games
  - [ ] Refresh page
  - [ ] Verify stats persist
- [ ] Monitor worker:
  - [ ] Run: `wrangler tail`
  - [ ] Check logs for errors

## Optimization (Optional)

- [ ] Add custom domain to worker (Cloudflare settings)
- [ ] Enable caching headers on worker responses
- [ ] Set up analytics in Cloudflare dashboard
- [ ] Monitor KV usage and costs
- [ ] Consider upgrading to D1 for game history

## Monitoring & Maintenance

- [ ] Check Cloudflare dashboard daily for first week
- [ ] Monitor error rates in worker logs
- [ ] Track KV storage usage
- [ ] Review game data in KV (for debugging)

## Troubleshooting

- [ ] **"Failed to reach server"** → Check `VITE_API_URL` environment variable
- [ ] **CORS errors** → Update origins in `server/worker.ts` and redeploy
- [ ] **404 errors** → Verify wrangler.toml routing is correct
- [ ] **KV not found** → Verify namespace ID and check credentials
- [ ] **Workers not deploying** → Run `wrangler whoami` to verify auth

## Rollback Plan

If something goes wrong:

1. Keep the old Express server running locally as backup
2. Deploy previous version: Keep git history
3. Revert KV namespace to working state (manual snapshot if needed)
4. Roll forward by fixing the issue and redeploying

---

**Total time estimate: 30-45 minutes**

For detailed help, see `CLOUDFLARE_SETUP.md` and `CLOUDFLARE_MIGRATION.md`
