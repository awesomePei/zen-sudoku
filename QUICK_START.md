# Zen Sudoku on Cloudflare Workers - Quick Reference

## What You Have Now

✅ **Original Express server** (`server/index.ts`) - Still works locally
✅ **New Hono worker** (`server/worker.ts`) - Cloudflare Workers ready
✅ **Updated build scripts** - `npm run dev:worker` and `npm run deploy`
✅ **Complete docs** - CLOUDFLARE_SETUP.md, CLOUDFLARE_MIGRATION.md, DEPLOYMENT_CHECKLIST.md

## Start Here

### 1️⃣ **Test Locally First** (5 minutes)

```bash
npm install
npm run dev
# Frontend: http://localhost:5173
# Worker API: http://localhost:8787
```

Go to http://localhost:5173 and play a game.

### 2️⃣ **Set Up Cloudflare** (10 minutes)

1. Create account: https://dash.cloudflare.com
2. Create KV namespace called `zen-sudoku-games`
3. Get your Account ID and API Token
4. `wrangler login`

### 3️⃣ **Configure & Deploy** (5 minutes)

1. Edit `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "GAMES"
   id = "YOUR_NAMESPACE_ID"
   preview_id = "YOUR_PREVIEW_ID"
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

3. Your worker is now live at:
   ```
   https://zen-sudoku-api.<account>.workers.dev
   ```

### 4️⃣ **Deploy Frontend** (5 minutes)

Choose one:

**Cloudflare Pages (easiest):**
```bash
npm run build
wrangler pages deploy dist --project-name zen-sudoku
```

**Vercel or Netlify:**
- Push to GitHub
- Connect repo
- Add env var: `VITE_API_URL=https://zen-sudoku-api.<account>.workers.dev`

## Key Differences

| Aspect | Before | Now |
|--------|--------|-----|
| Server | Express.js (Node.js) | Hono (Cloudflare Workers) |
| Database | SQLite file | Cloudflare KV |
| Deployment | Render/Railway/Fly | Cloudflare Workers |
| Port (dev) | 3001 | 8787 |
| Scaling | Manual | Automatic global |
| Cost | ~$5-20/month | Free tier + usage |

## Files to Know

```
server/
  ├── worker.ts          ← New! Hono server for Workers
  ├── puzzle-service.ts  ← Unchanged (same logic)
  └── index.ts           ← Old Express server (backup)

wrangler.toml           ← New! Cloudflare config
vite.config.ts          ← Updated proxy
package.json            ← Updated scripts
.env.example            ← Updated for wrangler

CLOUDFLARE_MIGRATION.md ← What changed
CLOUDFLARE_SETUP.md     ← Full setup guide
DEPLOYMENT_CHECKLIST.md ← Step-by-step checklist
```

## Environment Variables

```env
# Development with Wrangler
VITE_API_URL=http://localhost:8787

# Production
VITE_API_URL=https://zen-sudoku-api.YOUR_ACCOUNT.workers.dev
```

## Common Commands

```bash
# Local development
npm run dev              # Frontend + Worker
npm run dev:worker      # Just the worker
npm run dev:frontend    # Just frontend

# Deployment
npm run build:worker    # TypeScript check
npm run deploy          # Deploy worker + KV
npm run build           # Build frontend

# Debugging
wrangler tail           # Live worker logs
wrangler kv:key list    # See KV data
```

## Troubleshooting 101

**Issue: "Cannot reach server"**
- Check `VITE_API_URL` environment variable
- Make sure worker is deployed: `npm run deploy`

**Issue: "CORS error"**
- Update origins in `server/worker.ts`
- Redeploy: `npm run deploy`

**Issue: "KV namespace not found"**
- Verify ID in `wrangler.toml`
- Run `wrangler login` again
- Check namespace exists in Cloudflare dashboard

**Issue: Workers page shows 404**
- Check routing in `wrangler.toml`
- Verify custom domain is set up (if using custom domain)

## Cost Analysis

### Free Tier Includes

- 100,000 requests/day
- 1 GB KV storage
- Unlimited deployments
- Global CDN

### Typical Usage (indie game)

- 10,000 daily users
- ~50,000 game submissions/day
- Cost: **$0** (within free tier)

### When to Upgrade

- >100K requests/day → $0.50 per 10M requests
- >1GB KV storage → $0.50 per GB/month
- Need database → Upgrade to D1 (SQL)

## Next Steps After Deployment

1. **Monitor**: Use `wrangler tail` to watch logs
2. **Optimize**: Add caching headers for better performance
3. **Scale**: If needed, upgrade to D1 for full SQL support
4. **Brand**: Add custom domain
5. **Analyze**: Check Cloudflare analytics dashboard

## Support Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/workers/
- **Hono Docs**: https://hono.dev/
- **This Repo**: Read the markdown files in project root

## Emergency Contacts

If deployment fails:
1. Check `wrangler.toml` format (must be valid TOML)
2. Run `wrangler publish` (alternative deploy command)
3. Check Cloudflare dashboard for errors
4. Rollback to Express server on another platform

---

**You're now ready to deploy a global Sudoku game! 🚀**

Questions? See the full setup guide in CLOUDFLARE_SETUP.md
