"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormValidationError, formEmail, formText } from "@/lib/form-validation";
import { getSiteOrigin } from "@/lib/site-url";

function errorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function strongPassword(formData: FormData, key = "password"): string {
  const password = formText(formData, key, { min: 8, max: 128, label: "la contraseña" });
  if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(password) || !/\d/.test(password)) {
    throw new FormValidationError("La contraseña debe incluir al menos una letra y un número.");
  }
  return password;
}

export async function signIn(formData: FormData) {
  let email: string;
  let password: string;
  try {
    email = formEmail(formData);
    password = formText(formData, "password", { min: 6, max: 128, label: "la contraseña" });
  } catch (error) {
    errorRedirect("/login", error instanceof FormValidationError ? error.message : "Datos inválidos.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) errorRedirect("/login", "No pudimos iniciar sesión. Revisá el correo y la contraseña.");
  redirect("/app");
}

export async function signUp(formData: FormData) {
  let values: {
    fullName: string;
    phone: string;
    province: string;
    locality: string;
    email: string;
    password: string;
  };

  try {
    const password = strongPassword(formData);
    const confirmation = formText(formData, "confirmPassword", {
      min: 8,
      max: 128,
      label: "la confirmación de contraseña",
    });
    if (password !== confirmation) throw new FormValidationError("Las contraseñas no coinciden.");

    values = {
      fullName: formText(formData, "fullName", { min: 3, max: 120, label: "el nombre completo" }),
      phone: formText(formData, "phone", { min: 6, max: 30, label: "el teléfono" }),
      province: formText(formData, "province", { min: 2, max: 80, label: "la provincia" }),
      locality: formText(formData, "locality", { min: 2, max: 100, label: "la localidad" }),
      email: formEmail(formData),
      password,
    };
  } catch (error) {
    errorRedirect("/register", error instanceof FormValidationError ? error.message : "Datos inválidos.");
  }

  const origin = await getSiteOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: {
        full_name: values.fullName,
        phone: values.phone,
        province: values.province,
        locality: values.locality,
      },
    },
  });

  if (error) errorRedirect("/register", error.message);
  if (data.session) redirect("/app");
  redirect("/login?message=" + encodeURIComponent("Cuenta creada. Revisá tu correo para confirmar el registro."));
}

export async function requestPasswordReset(formData: FormData) {
  let email: string;
  try {
    email = formEmail(formData);
  } catch (error) {
    errorRedirect("/forgot-password", error instanceof FormValidationError ? error.message : "Correo inválido.");
  }

  const origin = await getSiteOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/update-password`,
  });
  if (error) errorRedirect("/forgot-password", "No pudimos enviar el correo de recuperación.");
  redirect(`/login?message=${encodeURIComponent("Te enviamos un enlace para cambiar la contraseña.")}`);
}

export async function updatePassword(formData: FormData) {
  let password: string;
  try {
    password = strongPassword(formData);
    const confirmation = formText(formData, "confirmPassword", {
      min: 8,
      max: 128,
      label: "la confirmación de contraseña",
    });
    if (password !== confirmation) throw new FormValidationError("Las contraseñas no coinciden.");
  } catch (error) {
    errorRedirect("/update-password", error instanceof FormValidationError ? error.message : "Contraseña inválida.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) errorRedirect("/login", "El enlace de recuperación venció. Solicitá uno nuevo.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) errorRedirect("/update-password", "No pudimos actualizar la contraseña.");
  redirect(`/app/profile?message=${encodeURIComponent("Contraseña actualizada correctamente.")}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
