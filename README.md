# treasury-template

Dashboard on-chain con React + Vite + Supabase.

```
config.json  (repo)     →  branding, accent color, API keys ref
Supabase     (DB)       →  groups, entities, assets, thresholds
.env.local              →  VITE keys (nunca commitear)
```

---

## Setup: nuevo proyecto desde el template

### 1. Crear repo desde el template
GitHub → treasury-template → Use this template → nombre del nuevo repo

### 2. Crear proyecto en Supabase
1. https://supabase.com → New project
2. SQL Editor → New query → pegar contenido de supabase/schema.sql → Run
3. Authentication → Users → Invite user (tu email)

### 3. Obtener credenciales de Supabase
Settings → API:
- Project URL         → VITE_SUPABASE_URL
- anon / public key   → VITE_SUPABASE_ANON_KEY

### 4. Configurar entorno local
```bash
git clone https://github.com/tuorg/mi-treasury
cd mi-treasury
npm install
cp .env.example .env.local
# Editar .env.local con las 4 keys
npm run dev
```

### 5. config.json
Solo cambiar name, tagline y accent por proyecto.
Grupos, entidades y thresholds van en Supabase.

---

## Gestionar thresholds

Supabase Table Editor → tabla thresholds → editar warn / critical → Save.
El dashboard lo refleja en el próximo refresh (máx 60s) o al presionar Refresh.

## Agregar entidad nueva

1. entities  → Insert row (name, address, network, group_id, enabled: true)
2. assets    → Insert row(s) (entity_id, type, symbol, decimals, address)
3. thresholds → Insert row (asset_id, warn, critical)

---

## Variables de entorno

VITE_ETHERSCAN_KEY       etherscan.io/apis
VITE_POLYGONSCAN_KEY     polygonscan.com/apis
VITE_SUPABASE_URL        Supabase → Settings → API → Project URL
VITE_SUPABASE_ANON_KEY   Supabase → Settings → API → anon/public

---

## Deploy

Build command:   npm run build
Publish dir:     dist
Agregar las 4 env vars en Netlify/Vercel dashboard.

Para propagar mejoras del template:
git remote add upstream https://github.com/tuorg/treasury-template
git fetch upstream && git merge upstream/main
