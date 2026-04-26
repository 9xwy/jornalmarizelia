/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_SUPABASE_URL?: string;
  readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_ENABLE_TEMP_ADMIN_LOGIN?: string;
  readonly VITE_TEMP_ADMIN_USERNAME?: string;
  readonly VITE_TEMP_ADMIN_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
