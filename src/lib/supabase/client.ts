import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";

export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  // El esquema evoluciona mediante migraciones; los datos de UI se tipan en cada módulo.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createBrowserClient<any>(url, publishableKey);
}
