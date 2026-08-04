"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  FormValidationError,
  formChoice,
  formInteger,
  formText,
  optionalMoney,
} from "@/lib/form-validation";

const KINDS = ["service", "employment"] as const;
const URGENCIES = ["normal", "soon", "urgent", "scheduled"] as const;
const BUDGET_MODES = ["open", "fixed", "range", "hourly", "daily", "monthly"] as const;
const EXPIRIES = ["1h", "3h", "today", "24h", "3d", "none"] as const;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function expiryDate(value: (typeof EXPIRIES)[number]): string | null {
  const now = new Date();
  if (value === "none") return null;
  if (value === "today") {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end.toISOString();
  }
  const hours = value === "1h" ? 1 : value === "3h" ? 3 : value === "24h" ? 24 : 72;
  return new Date(now.getTime() + hours * 3_600_000).toISOString();
}

function publishError(message: string): never {
  redirect(`/app/publish?error=${encodeURIComponent(message)}`);
}

export async function createPost(formData: FormData) {
  let values: {
    kind: (typeof KINDS)[number];
    categoryId: number;
    title: string;
    description: string;
    province: string;
    locality: string;
    zoneReference: string;
    desiredDate: string;
    urgency: (typeof URGENCIES)[number];
    budgetMode: (typeof BUDGET_MODES)[number];
    budgetMin: number | null;
    budgetMax: number | null;
    scheduleText: string;
    expiry: (typeof EXPIRIES)[number];
  };

  try {
    values = {
      kind: formChoice(formData, "kind", KINDS, "el tipo de publicación"),
      categoryId: formInteger(formData, "categoryId", { min: 1, label: "la categoría" }),
      title: formText(formData, "title", { min: 5, max: 120, label: "el título" }),
      description: formText(formData, "description", { min: 10, max: 4000, label: "la descripción" }),
      province: formText(formData, "province", { min: 2, max: 80, label: "la provincia" }),
      locality: formText(formData, "locality", { min: 2, max: 100, label: "la localidad" }),
      zoneReference: formText(formData, "zoneReference", { max: 200, optional: true }),
      desiredDate: formText(formData, "desiredDate", { max: 10, optional: true }),
      urgency: formChoice(formData, "urgency", URGENCIES, "la urgencia"),
      budgetMode: formChoice(formData, "budgetMode", BUDGET_MODES, "el presupuesto"),
      budgetMin: optionalMoney(formData, "budgetMin", "El monto mínimo"),
      budgetMax: optionalMoney(formData, "budgetMax", "El monto máximo"),
      scheduleText: formText(formData, "scheduleText", { max: 160, optional: true }),
      expiry: formChoice(formData, "expiry", EXPIRIES, "el vencimiento"),
    };
  } catch (error) {
    publishError(error instanceof FormValidationError ? error.message : "Revisá los datos de la publicación.");
  }

  if (values.budgetMin != null && values.budgetMax != null && values.budgetMin > values.budgetMax) {
    publishError("El monto mínimo no puede superar al máximo.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post, error } = await supabase
    .from("job_posts")
    .insert({
      author_id: user.id,
      category_id: values.categoryId,
      kind: values.kind,
      title: values.title,
      description: values.description,
      province: values.province,
      locality: values.locality,
      zone_reference: values.zoneReference || null,
      desired_date: values.desiredDate || null,
      urgency: values.urgency,
      budget_mode: values.budgetMode,
      budget_min: values.budgetMin,
      budget_max: values.budgetMax,
      status: "open",
      is_wall_visible: formData.get("isWallVisible") === "on",
      schedule_text: values.scheduleText || null,
      expires_at: expiryDate(values.expiry),
    })
    .select("id")
    .single();

  if (error || !post) publishError(error?.message || "No se pudo publicar.");

  const files = formData
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0)
    .slice(0, 4);

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    if (file.size > 10 * 1024 * 1024 || !ALLOWED_IMAGE_TYPES.has(file.type)) continue;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${user.id}/${post.id}/${Date.now()}-${index}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("job-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (!uploadError) {
      await supabase.from("job_images").insert({
        post_id: post.id,
        owner_id: user.id,
        storage_path: path,
        sort_order: index,
      });
    }
  }

  revalidatePath("/app", "layout");
  redirect(`/app/jobs/${post.id}?message=${encodeURIComponent("Publicación creada correctamente.")}`);
}
