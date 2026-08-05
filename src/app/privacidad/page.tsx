import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Privacidad" };

export default function PrivacyPage() {
  return (
    <InfoPage eyebrow="DATOS PERSONALES" title="Política de privacidad" intro="Qué información usa ALTOQUE, para qué se utiliza y qué controles conserva cada persona.">
      <p className="infoNotice">Versión inicial para el lanzamiento piloto. Se actualizará cuando se incorporen nuevos medios de pago, verificaciones o proveedores.</p>
      <h2>1. Datos que se recopilan</h2>
      <p>ALTOQUE puede tratar datos de registro y perfil, como nombre, correo, teléfono, localidad, presentación laboral, avatar y CV. También almacena publicaciones, propuestas, archivos subidos, favoritos, reportes y actividad necesaria para prestar el servicio.</p>
      <h2>2. Finalidades</h2>
      <p>Los datos se usan para crear y proteger la cuenta, mostrar perfiles públicos limitados, conectar necesidades con oportunidades, gestionar propuestas, prevenir abusos, responder reportes y medir anuncios patrocinados.</p>
      <h2>3. Información pública y privada</h2>
      <p>El perfil público no muestra el teléfono ni el CV. El CV se conserva en almacenamiento privado. La ubicación publicada debe ser aproximada: no recomendamos escribir domicilios exactos, datos bancarios, documentos ni información sensible dentro de una publicación.</p>
      <h2>4. Proveedores tecnológicos</h2>
      <p>La aplicación utiliza Supabase para autenticación, base de datos y archivos, y Vercel para alojamiento y entrega de la aplicación. Cada proveedor puede procesar datos técnicos indispensables conforme a sus propias condiciones y medidas de seguridad.</p>
      <h2>5. Publicidad y métricas</h2>
      <p>Los anuncios se identifican como patrocinados. Para medir impresiones y clics se usa un identificador anónimo del dispositivo. No se vende el contenido privado de las cuentas a los anunciantes.</p>
      <h2>6. Derechos sobre los datos</h2>
      <p>Las personas pueden solicitar información, acceso, rectificación, actualización o supresión de sus datos. Mientras se habilita el canal administrativo definitivo, estas solicitudes se gestionarán desde la sección de ayuda de la aplicación.</p>
      <h2>7. Conservación y seguridad</h2>
      <p>Los datos se conservan mientras la cuenta esté activa o mientras sean necesarios para prevenir fraude, resolver conflictos y cumplir obligaciones. Se aplican permisos por usuario, almacenamiento privado y restricciones de acceso, aunque ningún sistema puede garantizar riesgo cero.</p>
      <h2>8. Menores de edad</h2>
      <p>ALTOQUE no está diseñado para que menores contraten trabajos o compartan datos personales sin intervención de una persona adulta responsable.</p>
      <h2>9. Fuentes oficiales</h2>
      <p>Para conocer los derechos reconocidos por la normativa argentina, consultá la información de la Agencia de Acceso a la Información Pública.</p>
      <p><a className="textLink" href="https://www.argentina.gob.ar/aaip/datospersonales/derechos" target="_blank" rel="noreferrer">Derechos sobre datos personales — Argentina.gob.ar</a></p>
    </InfoPage>
  );
}
