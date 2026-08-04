import Link from "next/link";
import { Brand } from "@/components/brand";

export function PublicHeader() {
  return (
    <header className="publicHeader">
      <Brand />
      <nav>
        <Link className="ghostButton" href="/login">Ingresar</Link>
        <Link className="primaryButton small" href="/register">Crear cuenta</Link>
      </nav>
    </header>
  );
}
