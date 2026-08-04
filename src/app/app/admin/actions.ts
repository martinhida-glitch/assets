"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertUuid, FormValidationError, formChoice } from "@/lib/form-validation";

const RESOLUTIONS = ["reviewed", "dismissed", "actioned"] as const;

export async function resolveReport(formData: FormData) {
  let reportId: string;
  let resolution: (typeof RESOLUTIONS)[number];
  try {
    reportId = assertUuid(String(formData.get("reportId") || ""), "El reporte");
    resolution = formChoice(formData, "resolution", RESOLUTIONS, "la resolución");
  } catch (error) {
    redirect(`/app/admin?error=${encodeURIComponent(error instanceof FormValidationError ? error.message : "Datos inválidos.")}`);
  }

  const cancelPost = formData.get("cancelPost") === "true";
  const supabase = await createClient();
  const { error } = await supabase.rpc("moderate_job_report", {
    p_report_id: reportId,
    p_resolution: resolution,
    p_cancel_post: cancelPost,
  });

  if (error) redirect(`/app/admin?error=${encodeURIComponent("No pudimos aplicar la moderación.")}`);
  revalidatePath("/app/admin");
  revalidatePath("/app/jobs");
  redirect(`/app/admin?message=${encodeURIComponent(cancelPost ? "Publicación cancelada y reporte resuelto." : "Reporte actualizado.")}`);
}
