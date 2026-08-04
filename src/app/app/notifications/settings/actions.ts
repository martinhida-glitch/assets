"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assertUuid, FormValidationError, formInteger, formText } from "@/lib/form-validation";
import { createClient } from "@/lib/supabase/server";

function settingsError(message: string): never {
  redirect(`/app/notifications/settings?error=${encodeURIComponent(message)}`);
}

export async function updatePushPreferences(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: user.id,
    push_enabled: formData.get("pushEnabled") === "on",
    proposal_received: formData.get("proposalReceived") === "on",
    proposal_status: formData.get("proposalStatus") === "on",
    job_status: formData.get("jobStatus") === "on",
    review_received: formData.get("reviewReceived") === "on",
    new_matching_jobs: formData.get("newMatchingJobs") === "on",
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });

  if (error) settingsError("No pudimos guardar las preferencias.");
  revalidatePath("/app/notifications/settings");
  redirect(`/app/notifications/settings?message=${encodeURIComponent("Preferencias guardadas.")}`);
}

export async function createJobAlert(formData: FormData) {
  let categoryId: number | null = null;
  let queryText = "";
  let province = "";
  let locality = "";
  try {
    const rawCategory = String(formData.get("categoryId") || "").trim();
    categoryId = rawCategory ? formInteger(formData, "categoryId", { min: 1, label: "la categoría" }) : null;
    queryText = formText(formData, "queryText", { min: 2, max: 100, optional: true, label: "las palabras" });
    province = formText(formData, "province", { min: 2, max: 80, optional: true, label: "la provincia" });
    locality = formText(formData, "locality", { min: 2, max: 100, optional: true, label: "la localidad" });
    if (!categoryId && !queryText) throw new FormValidationError("Elegí una categoría o escribí una palabra para la alerta.");
  } catch (error) {
    settingsError(error instanceof FormValidationError ? error.message : "Revisá la alerta.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("job_alerts").insert({
    user_id: user.id,
    category_id: categoryId,
    query_text: queryText || null,
    province: province || null,
    locality: locality || null,
    is_active: true,
  });
  if (error) settingsError("No pudimos crear la alerta.");

  revalidatePath("/app/notifications/settings");
  redirect(`/app/notifications/settings?message=${encodeURIComponent("Alerta creada. Te avisaremos cuando haya una coincidencia.")}`);
}

export async function toggleJobAlert(formData: FormData) {
  const id = assertUuid(String(formData.get("id") || ""), "La alerta");
  const active = String(formData.get("active") || "") === "true";
  const supabase = await createClient();
  const { error } = await supabase.from("job_alerts").update({ is_active: active }).eq("id", id);
  if (error) settingsError("No pudimos actualizar la alerta.");
  revalidatePath("/app/notifications/settings");
}

export async function deleteJobAlert(formData: FormData) {
  const id = assertUuid(String(formData.get("id") || ""), "La alerta");
  const supabase = await createClient();
  const { error } = await supabase.from("job_alerts").delete().eq("id", id);
  if (error) settingsError("No pudimos eliminar la alerta.");
  revalidatePath("/app/notifications/settings");
}

export async function sendTestPush(_formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.from("notifications").insert({
    user_id: user.id,
    type: "push_test",
    title: "ALTOQUE está conectado",
    body: "La notificación push de prueba llegó correctamente a este dispositivo.",
    href: "/app/notifications/settings",
  });
  if (error) settingsError("No pudimos enviar la prueba. Primero activá las notificaciones en este dispositivo.");
  revalidatePath("/app", "layout");
  redirect(`/app/notifications/settings?message=${encodeURIComponent("Prueba enviada. Puede demorar unos segundos.")}`);
}
