/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ETHERSCAN_KEY: string
  readonly VITE_POLYGONSCAN_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
