import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Ayuda" };

export default function HelpPage() {
  return (
    <InfoPage eyebrow="CENTRO DE AYUDA" title="Cómo usar ALTOQUE" intro="Guía rápida para publicar, proponer, elegir y resolver oportunidades locales.">
      <h2>Necesito resolver algo</h2>
      <ol><li>Creá tu cuenta y completá localidad y perfil.</li><li>Entrá en <strong>Publicar</strong>, elegí una categoría y describí lo necesario.</li><li>Indicá presupuesto, urgencia, horario y vencimiento.</li><li>Compará propuestas y aceptá una sola.</li><li>Al terminar, marcá la publicación como completada.</li></ol>
      <h2>Quiero trabajar</h2>
      <ol><li>Completá especialidad, experiencia, disponibilidad y radio de trabajo.</li><li>Buscá oportunidades por texto, categoría o localidad.</li><li>Enviá una propuesta clara con precio, tiempo y qué incluye.</li><li>Revisá las notificaciones para saber si fue aceptada.</li></ol>
      <h2>Muro de ALTOQUE</h2>
      <p>El muro muestra necesidades recientes, recados, changas y oportunidades con vencimiento. Las notas vencidas o asignadas dejan de aparecer automáticamente.</p>
      <h2>Favoritos</h2>
      <p>Podés guardar una oportunidad para revisarla después. Tus favoritos son privados.</p>
      <h2>Problemas de acceso</h2>
      <p>Usá <Link className="textLink" href="/forgot-password">Olvidé mi contraseña</Link>. Revisá también la carpeta de correo no deseado si esperás un mensaje de confirmación.</p>
      <h2>Contenido problemático</h2>
      <p>Abrí la publicación y utilizá la opción <strong>Reportar</strong>. No publiques acusaciones, documentos ni datos personales dentro del muro.</p>
    </InfoPage>
  );
}
