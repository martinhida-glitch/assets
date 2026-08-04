"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  assertUuid,
  FormValidationError,
  formChoice,
  formText,
  optionalMoney,
} from "@/lib/form-validation";

const AMOUNT_UNITS = ["total", "hour", "day", "month", "open"] as const;

function jobError(postId: string, message: string): never {
  redirect(`/app/jobs/${postId}?error=${encodeURIComponent(message)}`);
}

export async function submitProposal(formData: FormData) {
  const rawPostId = String(formData.get("postId") || "");
  let values: {
    postId: string;
    amount: number | null;
    amountUnit: (typeof AMOUNT_UNITS)[number];
    message: string;
    availability: string;
    estimated: string;
    includes: string;
    warranty: string;
  };

  try {
    values = {
      postId: assertUuid(rawPostId, "La publicación"),
      amount: optionalMoney(formData, "amount", "El monto"),
      amountUnit: formChoice(formData, "amountUnit", AMOUNT_UNITS, "la modalidad"),
      message: formText(formData, "message", { min: 3, max: 2000, label: "el mensaje" }),
      availability: formText(formData, "availability", { max: 300, optional: true }),
      estimated: formText(formData, "estimated", { max: 200, optional: true }),
      includes: formText(formData, "includes", { max: 1000, optional: true }),
      warranty: formText(formData, "warranty", { max: 500, optional: true }),
    };
  } catch (error) {
    jobError(rawPostId, error instanceof FormValidationError ? error.message : "Revisá la propuesta.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("proposals").insert({
    post_id: values.postId,
    proposer_id: user.id,
    amount: values.amount,
    amount_unit: values.amountUnit,
    message: values.message,
    availability_text: values.availability || null,
    estimated_time_text: values.estimated || null,
    includes_text: values.includes || null,
    warranty_text: values.warranty || null,
  });

  if (error) jobError(values.postId, error.message);
  revalidatePath(`/app/jobs/${values.postId}`);
  redirect(`/app/jobs/${values.postId}?message=${encodeURIComponent("Propuesta enviada.")}`);
}

export async function acceptProposal(formData: FormData) {
  const postId = String(formData.get("postId") || "");
  let proposalId: string;
  try {
    proposalId = assertUuid(String(formData.get("proposalId") || ""), "La propuesta");
    assertUuid(postId, "La publicación");
  } catch (error) {
    jobError(postId, error instanceof FormValidationError ? error.message : "Datos inválidos.");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_proposal", { p_proposal_id: proposalId });
  if (error) jobError(postId, error.message);
  revalidatePath("/app", "layout");
  redirect(`/app/jobs/${postId}?message=${encodeURIComponent("Propuesta aceptada.")}`);
}

export async function changePostStatus(formData: FormData) {
  const postId = String(formData.get("postId") || "");
  const status = String(formData.get("status") || "");
  try {
    assertUuid(postId, "La publicación");
  } catch (error) {
    jobError(postId, error instanceof FormValidationError ? error.message : "Datos inválidos.");
  }
  if (status !== "completed" && status !== "cancelled") jobError(postId, "Estado inválido.");

  const supabase = await createClient();
  const { error } = await supabase.from("job_posts").update({ status }).eq("id", postId);
  if (error) jobError(postId, error.message);
  revalidatePath("/app", "layout");
  redirect(`/app/jobs/${postId}?message=${encodeURIComponent("Estado actualizado.")}`);
}

const REPORT_REASONS = ["spam", "fraud", "inappropriate", "unsafe", "duplicate", "other"] as const;

export async function toggleSavedJob(formData: FormData) {
  const postId = assertUuid(String(formData.get("postId") || ""), "La publicación");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: existing } = await supabase.from("saved_jobs").select("post_id").eq("user_id", user.id).eq("post_id", postId).maybeSingle();
  if (existing) await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("post_id", postId);
  else await supabase.from("saved_jobs").insert({ user_id: user.id, post_id: postId });
  revalidatePath(`/app/jobs/${postId}`);
  revalidatePath("/app/activity");
}

export async function reportJob(formData: FormData) {
  const postId = assertUuid(String(formData.get("postId") || ""), "La publicación");
  let reason: (typeof REPORT_REASONS)[number];
  let details: string;
  try {
    reason = formChoice(formData, "reason", REPORT_REASONS, "el motivo");
    details = formText(formData, "details", { max: 1000, optional: true });
  } catch (error) {
    jobError(postId, error instanceof FormValidationError ? error.message : "Revisá el reporte.");
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.from("job_reports").insert({ post_id: postId, reporter_id: user.id, reason, details: details || null });
  if (error && error.code !== "23505") jobError(postId, error.message);
  revalidatePath(`/app/jobs/${postId}`);
  redirect(`/app/jobs/${postId}?message=${encodeURIComponent("Reporte recibido. Gracias por ayudar a cuidar la comunidad.")}`);
}
