# Cloudflare Workers Deployment Guide

This guide walks you through deploying Zen Sudoku to Cloudflare Workers.

## Prerequisites

- Cloudflare account (free tier works)
- Node.js 18+ installed
- Git installed

## Step 1: Set Up Cloudflare

1. **Create a Cloudflare account** at https://dash.cloudflare.com/

2. **Create a KV namespace** for storing game data:
   - Go to **Workers & Pages** → **KV**
   - Click **Create Namespace**
   - Name it `zen-sudoku-games`
   - Note the namespace ID (you'll need this)

3. **Get your Cloudflare credentials:**
   - Account ID: Dashboard → Overview → Copy Account ID
   - API Token: My Profile → API Tokens → Create Token
     - Use "Edit Cloudflare Workers" template
     - Copy the token

## Step 2: Configure Wrangler

1. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```
   This will open your browser to authenticate.

2. **Update `wrangler.toml`** with your credentials:
   ```toml
   [env.production]
   routes = [
     { pattern = "api.zen-sudoku.com/*", zone_id = "YOUR_ZONE_ID" }
   ]

   [[kv_namespaces]]
   binding = "GAMES"
   id = "YOUR_KV_NAMESPACE_ID"
   preview_id = "YOUR_KV_PREVIEW_ID"
   ```

   Replace:
   - `YOUR_KV_NAMESPACE_ID` with the namespace ID from Step 1
   - `YOUR_KV_PREVIEW_ID` with a preview namespace ID (create another KV namespace for testing)

## Step 3: Test Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start local development:**
   ```bash
   npm run dev
   ```
   This runs:
   - Frontend on http://localhost:5173
   - Worker API on http://localhost:8787

3. **Test the game:**
   - Open http://localhost:5173
   - Select a difficulty
   - Play a game to verify everything works

## Step 4: Deploy to Production

1. **Build the project:**
   ```bash
   npm run build
   npm run build:worker
   ```

2. **Deploy to Cloudflare:**
   ```bash
   npm run deploy
   ```
   Wrangler will upload your worker to Cloudflare Workers.

3. **Get your deployment URL:**
   After deployment, Cloudflare will show your worker URL:
   ```
   ✓ Uploaded zen-sudoku-api
   ✓ Published zen-sudoku-api
     https://zen-sudoku-api.<your-account>.workers.dev
   ```

## Step 5: Deploy Frontend

The frontend can be deployed to any static hosting:

### Option A: Cloudflare Pages (Recommended)

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy to Pages:**
   ```bash
   wrangler pages deploy dist --project-name zen-sudoku
   ```

3. **Update API URL:**
   - Go to Pages → zen-sudoku → Settings → Environment Variables
   - Add: `VITE_API_URL=https://zen-sudoku-api.<your-account>.workers.dev`

### Option B: Vercel or Netlify

1. Push to GitHub
2. Connect repo to Vercel/Netlify
3. Set environment variable:
   ```
   VITE_API_URL=https://zen-sudoku-api.<your-account>.workers.dev
   ```

## Step 6: Update CORS

Update `server/worker.ts` CORS origins to match your deployed domains:

```typescript
cors({
  origin: [
    'https://zen-sudoku.pages.dev',  // Your Pages domain
    'https://yourdomain.com',         // Your custom domain
    'http://localhost:5173',          // Local dev
  ],
  credentials: true,
})
```

Redeploy after making changes:
```bash
npm run deploy
```

## API Endpoints

Once deployed, your API is available at:
```
https://zen-sudoku-api.<your-account>.workers.dev/api/puzzle
https://zen-sudoku-api.<your-account>.workers.dev/api/validate
https://zen-sudoku-api.<your-account>.workers.dev/api/submit
https://zen-sudoku-api.<your-account>.workers.dev/api/stats
https://zen-sudoku-api.<your-account>.workers.dev/api/history
```

## Monitoring & Debugging

1. **View worker logs:**
   ```bash
   wrangler tail
   ```

2. **View KV data:**
   - Dashboard → Workers → KV
   - View stored game data

3. **Check deployment status:**
   - Dashboard → Workers & Pages → zen-sudoku-api

## Data Storage

Game data is stored in Cloudflare KV:
- Each puzzle is cached for 7 days
- Session stats are stored indefinitely
- Perfect for the MVP (stateless, scalable)

## Limitations & Next Steps

**Current (MVP on KV):**
- ✓ Puzzle generation works
- ✓ Move validation works
- ✓ Game submission with scoring works
- ✓ Session stats tracking works
- ✗ Game history limited (KV doesn't support efficient queries)

**For Production Scale, consider upgrading to:**
- **Cloudflare D1** (SQLite for Workers)
- **Neon** (PostgreSQL with serverless driver)
- **Supabase** (Open source Firebase alternative)

To upgrade, update the KV storage code to D1 queries.

## Troubleshooting

**"Failed to reach server" error:**
- Ensure `VITE_API_URL` environment variable is set
- Check CORS origins in `worker.ts`
- Verify KV namespace is bound correctly

**"Worker not deployed":**
- Run `wrangler publish` (older command)
- Check authentication: `wrangler whoami`
- Verify wrangler.toml is correct

**KV namespace not found:**
- Verify namespace ID in wrangler.toml
- Make sure it's in the same account
- Check it's not in a different region

## Support

For issues:
1. Check Cloudflare dashboard logs
2. Run `wrangler tail --format pretty` for detailed logs
3. Verify environment variables are set correctly
