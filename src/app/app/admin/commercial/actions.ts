"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertUuid, FormValidationError, formChoice, formText } from "@/lib/form-validation";

const PLACEMENTS = ["top_banner", "contextual_card", "in_feed", "wall_note", "category_sponsor"] as const;
const CAMPAIGN_STATUSES = ["draft", "pending", "active", "paused", "ended"] as const;

function commercialError(message: string): never {
  redirect(`/app/admin/commercial?error=${encodeURIComponent(message)}`);
}

function optionalText(formData: FormData, key: string, max: number) {
  return formText(formData, key, { max, optional: true });
}

function argentinaDate(raw: string, optional = false): string | null {
  if (!raw) {
    if (optional) return null;
    return new Date().toISOString();
  }
  const normalized = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw) ? `${raw}:00-03:00` : raw;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) throw new FormValidationError("La fecha no es válida.");
  return date.toISOString();
}

export async function createBusiness(formData: FormData) {
  try {
    const name = formText(formData, "name", { min: 2, max: 100, label: "el nombre del comercio" });
    const slug = formText(formData, "slug", { min: 2, max: 100, label: "el identificador" }).toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new FormValidationError("El identificador debe usar minúsculas, números y guiones.");
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_create_business", {
      p_name: name,
      p_slug: slug,
      p_description: optionalText(formData, "description", 1200) || null,
      p_logo_url: optionalText(formData, "logoUrl", 1000) || null,
      p_whatsapp: optionalText(formData, "whatsapp", 40) || null,
      p_locality: optionalText(formData, "locality", 100) || null,
      p_province: optionalText(formData, "province", 80) || null,
      p_is_verified: formData.get("isVerified") === "on",
      p_is_active: formData.get("isActive") === "on",
    });
    if (error) commercialError(error.message.includes("duplicate") ? "Ese identificador de comercio ya existe." : "No pudimos crear el comercio.");
  } catch (error) {
    commercialError(error instanceof FormValidationError ? error.message : "Revisá los datos del comercio.");
  }
  revalidatePath("/app/admin/commercial");
  redirect(`/app/admin/commercial?message=${encodeURIComponent("Comercio creado.")}`);
}

export async function createCampaign(formData: FormData) {
  try {
    const businessId = assertUuid(String(formData.get("businessId") || ""), "El comercio");
    const placement = formChoice(formData, "placement", PLACEMENTS, "la ubicación publicitaria");
    const status = formChoice(formData, "status", CAMPAIGN_STATUSES, "el estado");
    const rawCategory = String(formData.get("categoryId") || "").trim();
    const categoryId = rawCategory ? Number(rawCategory) : null;
    if (categoryId !== null && (!Number.isInteger(categoryId) || categoryId <= 0)) throw new FormValidationError("La categoría no es válida.");
    const priorityRaw = Number(String(formData.get("priority") || "50"));
    const priority = Number.isFinite(priorityRaw) ? Math.max(0, Math.min(100, Math.round(priorityRaw))) : 50;
    const startsAt = argentinaDate(String(formData.get("startsAt") || ""))!;
    const endsAt = argentinaDate(String(formData.get("endsAt") || ""), true);
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) throw new FormValidationError("La fecha final debe ser posterior a la inicial.");

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_create_campaign", {
      p_business_id: businessId,
      p_internal_name: formText(formData, "internalName", { min: 2, max: 120, label: "el nombre interno" }),
      p_placement: placement,
      p_title: formText(formData, "title", { min: 3, max: 120, label: "el título" }),
      p_body: optionalText(formData, "body", 320) || null,
      p_cta_label: optionalText(formData, "ctaLabel", 40) || null,
      p_cta_url: optionalText(formData, "ctaUrl", 1000) || null,
      p_coupon_code: optionalText(formData, "couponCode", 40) || null,
      p_category_id: categoryId,
      p_group_name: optionalText(formData, "groupName", 120) || null,
      p_locality: optionalText(formData, "locality", 100) || null,
      p_province: optionalText(formData, "province", 80) || null,
      p_priority: priority,
      p_starts_at: startsAt,
      p_ends_at: endsAt,
      p_status: status,
    });
    if (error) commercialError("No pudimos crear la campaña. Revisá URLs, fechas y campos obligatorios.");
  } catch (error) {
    commercialError(error instanceof FormValidationError ? error.message : "Revisá los datos de la campaña.");
  }
  revalidatePath("/app/admin/commercial");
  redirect(`/app/admin/commercial?message=${encodeURIComponent("Campaña creada.")}`);
}

export async function setCampaignStatus(formData: FormData) {
  try {
    const campaignId = assertUuid(String(formData.get("campaignId") || ""), "La campaña");
    const status = formChoice(formData, "status", CAMPAIGN_STATUSES, "el estado");
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_set_campaign_status", { p_campaign_id: campaignId, p_status: status });
    if (error) commercialError("No pudimos cambiar el estado de la campaña.");
  } catch (error) {
    commercialError(error instanceof FormValidationError ? error.message : "Datos inválidos.");
  }
  revalidatePath("/app/admin/commercial");
  redirect(`/app/admin/commercial?message=${encodeURIComponent("Estado de campaña actualizado.")}`);
}
