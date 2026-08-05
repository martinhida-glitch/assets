"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormValidationError, formInteger, formText } from "@/lib/form-validation";

const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function profileError(message: string): never {
  redirect(`/app/profile?error=${encodeURIComponent(message)}`);
}

export async function updateProfile(formData: FormData) {
  let values: {
    fullName: string;
    phone: string;
    province: string;
    locality: string;
    headline: string;
    bio: string;
    experience: string;
    availability: string;
    workRadiusKm: number;
  };

  try {
    values = {
      fullName: formText(formData, "fullName", { min: 3, max: 120, label: "el nombre completo" }),
      phone: formText(formData, "phone", { min: 6, max: 30, label: "el teléfono" }),
      province: formText(formData, "province", { min: 2, max: 80, label: "la provincia" }),
      locality: formText(formData, "locality", { min: 2, max: 100, label: "la localidad" }),
      headline: formText(formData, "headline", { max: 100, optional: true }),
      bio: formText(formData, "bio", { max: 1000, optional: true }),
      experience: formText(formData, "experience", { max: 2000, optional: true }),
      availability: formText(formData, "availability", { max: 300, optional: true }),
      workRadiusKm: formInteger(formData, "workRadiusKm", { min: 0, max: 300, label: "el radio de trabajo" }),
    };
  } catch (error) {
    profileError(error instanceof FormValidationError ? error.message : "Revisá los datos ingresados.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let avatarUrl: string | null = null;
  let cvPath: string | null = null;
  const { data: current } = await supabase
    .from("profiles")
    .select("avatar_url,cv_storage_path")
    .eq("id", user.id)
    .maybeSingle();
  avatarUrl = current?.avatar_url || null;
  cvPath = current?.cv_storage_path || null;

  const avatar = formData.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > 5 * 1024 * 1024) profileError("La foto supera 5 MB.");
    if (!ALLOWED_AVATAR_TYPES.has(avatar.type)) profileError("La foto debe ser JPG, PNG o WEBP.");
    const extension = (avatar.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/avatar.${extension}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, avatar, { contentType: avatar.type, upsert: true });
    if (error) profileError(error.message);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = data.publicUrl;
  }

  const cv = formData.get("cv");
  if (cv instanceof File && cv.size > 0) {
    if (cv.type !== "application/pdf" || cv.size > 10 * 1024 * 1024) {
      profileError("El CV debe ser PDF y pesar menos de 10 MB.");
    }
    const path = `${user.id}/cv-${Date.now()}.pdf`;
    const { error } = await supabase.storage
      .from("cvs")
      .upload(path, cv, { contentType: "application/pdf", upsert: false });
    if (error) profileError(error.message);
    cvPath = path;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: values.fullName,
      phone: values.phone,
      province: values.province,
      locality: values.locality,
      headline: values.headline || null,
      bio: values.bio || null,
      experience_text: values.experience || null,
      availability_text: values.availability || null,
      work_radius_km: values.workRadiusKm,
      avatar_url: avatarUrl,
      cv_storage_path: cvPath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) profileError(error.message);
  revalidatePath("/app", "layout");
  redirect(`/app/profile?message=${encodeURIComponent("Perfil actualizado correctamente.")}`);
}
