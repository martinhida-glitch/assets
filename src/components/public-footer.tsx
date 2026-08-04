import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="publicFooter richFooter">
      <div>
        <strong>ALTOQUE</strong>
        <span>Conecta · Publicá · Resolvé.</span>
      </div>
      <nav aria-label="Información y ayuda">
        <Link href="/ayuda">Ayuda</Link>
        <Link href="/seguridad">Seguridad</Link>
        <Link href="/privacidad">Privacidad</Link>
        <Link href="/terminos">Términos</Link>
      </nav>
    </footer>
  );
}
