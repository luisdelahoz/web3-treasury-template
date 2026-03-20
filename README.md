# treasury-template

On-chain treasury dashboard built with React + Vite + Supabase.

## Architecture overview

| Layer | Purpose |
|---|---|
| `config.json` | Branding, accent color, API key references |
| Supabase (DB) | Groups, entities, assets, thresholds |
| `.env.local` | Secret keys — never commit |

---

## Getting started

### 1. Create a repo from the template

GitHub → `treasury-template` → **Use this template** → enter your new repo name.

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. **SQL Editor** → New query → paste the contents of `supabase/schema.sql` → **Run**
3. **Authentication** → Users → **Invite user** (your email)

### 3. Get your Supabase credentials

**Settings** → **API**:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon / public key |

### 4. Set up the local environment

```bash
git clone https://github.com/your-org/your-treasury
cd your-treasury
npm install
cp .env.example .env.local
# Fill in the 4 keys in .env.local
npm run dev
```

### 5. Configure `config.json`

Only update `name`, `tagline`, and `accent` per project. Manage groups, entities, and thresholds directly in Supabase.

---

## Managing thresholds

**Supabase Table Editor** → `thresholds` table → edit `warn` / `critical` values → **Save**.

Changes are reflected on the next refresh (max 60 s) or immediately when pressing **Refresh**.

---

## Adding a new entity

1. `entities` → Insert row (`name`, `address`, `network`, `group_id`, `enabled: true`)
2. `assets` → Insert row(s) (`entity_id`, `type`, `symbol`, `decimals`, `address`)
3. `thresholds` → Insert row (`asset_id`, `warn`, `critical`)

---

## Environment variables

| Variable | Where to find it |
|---|---|
| `VITE_ETHERSCAN_KEY` | [etherscan.io/apis](https://etherscan.io/apis) |
| `VITE_POLYGONSCAN_KEY` | [polygonscan.com/apis](https://polygonscan.com/apis) |
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon / public |

---

## Deployment

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |

Add all 4 environment variables in your Netlify / Vercel dashboard.

### Pulling upstream improvements

```bash
git remote add upstream https://github.com/your-org/treasury-template
git fetch upstream && git merge upstream/main
```
