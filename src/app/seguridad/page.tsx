import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Seguridad" };

export default function SafetyPage() {
  return (
    <InfoPage eyebrow="CONFIANZA LOCAL" title="Centro de seguridad" intro="Recomendaciones para contratar, trabajar y encontrarse con otras personas de manera más segura.">
      <h2>Antes de aceptar</h2>
      <ul><li>Revisá el perfil, la descripción y la coherencia de la propuesta.</li><li>Confirmá precio, materiales, duración, forma de pago y garantía por escrito.</li><li>Para tareas técnicas o reguladas, pedí matrícula, referencias o seguro cuando corresponda.</li></ul>
      <h2>Pagos</h2>
      <ul><li>No compartas claves, códigos de verificación ni acceso a billeteras.</li><li>Evitá anticipos importantes a personas que no pudiste verificar.</li><li>Guardá comprobantes y registrá cualquier cambio del acuerdo.</li></ul>
      <h2>Encuentros y domicilios</h2>
      <ul><li>Compartí con alguien de confianza dónde y con quién vas a encontrarte.</li><li>En la publicación usá referencias aproximadas, nunca información sensible.</li><li>Si una situación genera presión, amenazas o dudas, interrumpí el contacto.</li></ul>
      <h2>Reportes</h2>
      <p>Dentro de cada oportunidad podés reportar spam, fraude, contenido inapropiado, riesgo, duplicados u otros problemas. Los reportes quedan asociados a la cuenta que los envía y no se muestran públicamente.</p>
      <h2>Emergencias</h2>
      <p>ALTOQUE no reemplaza servicios de emergencia ni autoridades. Ante peligro inmediato, contactá a los servicios públicos correspondientes de tu localidad.</p>
    </InfoPage>
  );
}
