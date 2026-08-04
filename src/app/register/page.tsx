import Link from "next/link";
import { Brand } from "@/components/brand";
import { signUp } from "@/app/auth/actions";
import { ARGENTINA_PROVINCES } from "@/lib/constants";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="authPage">
      <section className="authCard wide">
        <Brand />
        <div className="authHeading"><h1>Crear una cuenta</h1><p>Una persona, una cuenta, todas las posibilidades.</p></div>
        {params.error && <p className="alert error">{params.error}</p>}
        <form action={signUp} className="formStack">
          <div className="formGrid">
            <label>Nombre completo<input name="fullName" autoComplete="name" required /></label>
            <label>Teléfono<input name="phone" type="tel" autoComplete="tel" required /></label>
            <label>Provincia<select name="province" defaultValue="La Pampa" required>{ARGENTINA_PROVINCES.map((province) => <option key={province}>{province}</option>)}</select></label>
            <label>Localidad<input name="locality" defaultValue="Ingeniero Luiggi" required /></label>
          </div>
          <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
          <div className="formGrid"><label>Contraseña<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label><label>Repetir contraseña<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required /></label></div><p className="fieldHint">Usá al menos 8 caracteres, con una letra y un número.</p>
          <label className="legalCheck"><input name="acceptedLegal" type="checkbox" required/><span>Acepto los <Link href="/terminos" target="_blank">Términos de uso</Link> y la <Link href="/privacidad" target="_blank">Política de privacidad</Link>.</span></label>
          <button className="primaryButton full" type="submit">Crear cuenta</button>
        </form>
        <p className="privacyNote">La dirección exacta, el documento y el CV nunca se mostrarán públicamente.</p>
        <p className="authFooter">¿Ya tenés cuenta? <Link href="/login">Ingresá</Link></p>
      </section>
    </main>
  );
}
