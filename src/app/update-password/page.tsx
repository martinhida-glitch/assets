import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { updatePassword } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password?error=" + encodeURIComponent("Solicitá un enlace de recuperación nuevo."));

  return (
    <main className="authPage">
      <section className="authCard">
        <Brand />
        <div className="authHeading">
          <h1>Nueva contraseña</h1>
          <p>Elegí una clave segura para volver a ingresar a ALTOQUE.</p>
        </div>
        {params.error && <p className="alert error">{params.error}</p>}
        <form action={updatePassword} className="formStack">
          <label>Nueva contraseña<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
          <label>Repetir contraseña<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></label>
          <p className="fieldHint">Debe incluir al menos una letra y un número.</p>
          <button className="primaryButton full" type="submit">Guardar contraseña</button>
        </form>
      </section>
    </main>
  );
}
