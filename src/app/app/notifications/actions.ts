"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertUuid } from "@/lib/form-validation";

export async function openNotification(formData: FormData) {
  const id = assertUuid(String(formData.get("id") || ""), "La notificación");
  const rawHref = String(formData.get("href") || "/app");
  const href = rawHref.startsWith("/app") ? rawHref : "/app";
  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  revalidatePath("/app", "layout");
  redirect(href);
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
  revalidatePath("/app", "layout");
  redirect("/app/notifications");
}
