import Link from "next/link";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return <main className="statePage"><Brand/><p className="eyebrow">ERROR 404</p><h1>Esta página no existe.</h1><p>Volvé al inicio o revisá el enlace.</p><Link className="primaryButton" href="/">Ir al inicio</Link></main>;
}
