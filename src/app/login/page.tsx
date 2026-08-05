import Link from "next/link";
import { Brand } from "@/components/brand";
import { signIn } from "@/app/auth/actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  return (
    <main className="authPage">
      <section className="authCard">
        <Brand />
        <div className="authHeading"><h1>Ingresar</h1><p>Usá tu única cuenta para contratar, ofrecer servicios o buscar empleo.</p></div>
        {params.error && <p className="alert error">{params.error}</p>}
        {params.message && <p className="alert success">{params.message}</p>}
        <form action={signIn} className="formStack">
          <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
          <label>Contraseña<input name="password" type="password" autoComplete="current-password" minLength={6} required /></label>
          <button className="primaryButton full" type="submit">Ingresar</button>
        </form>
        <p className="authSupport"><Link href="/forgot-password">Olvidé mi contraseña</Link></p>
        <p className="authFooter">¿Todavía no tenés cuenta? <Link href="/register">Registrate gratis</Link></p>
      </section>
    </main>
  );
}
