import Link from "next/link";
import { Brand } from "@/components/brand";
import { requestPasswordReset } from "@/app/auth/actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="authPage">
      <section className="authCard">
        <Brand />
        <div className="authHeading">
          <h1>Recuperar acceso</h1>
          <p>Te enviaremos un enlace seguro para crear una contraseña nueva.</p>
        </div>
        {params.error && <p className="alert error">{params.error}</p>}
        <form action={requestPasswordReset} className="formStack">
          <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
          <button className="primaryButton full" type="submit">Enviar enlace</button>
        </form>
        <p className="authFooter"><Link href="/login">Volver a ingresar</Link></p>
      </section>
    </main>
  );
}
