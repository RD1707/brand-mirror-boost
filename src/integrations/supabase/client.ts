import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Mensagem útil no console se as variáveis não estiverem configuradas.
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não configuradas. Crie um projeto no Supabase e adicione essas variáveis."
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL ?? "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY ?? "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  }
);
