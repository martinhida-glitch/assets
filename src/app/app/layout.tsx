import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { count: unreadCount }] = await Promise.all([
    supabase.from("profiles").select("locality").eq("id", user.id).maybeSingle(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
  ]);

  return <AppShell locality={profile?.locality} unreadCount={unreadCount || 0}>{children}</AppShell>;
}
