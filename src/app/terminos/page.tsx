import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Términos" };

export default function TermsPage() {
  return (
    <InfoPage eyebrow="REGLAS DEL SERVICIO" title="Términos de uso" intro="Condiciones básicas para publicar, ofrecer trabajos, contratar y utilizar espacios patrocinados.">
      <p className="infoNotice">Documento operativo inicial. Antes de una monetización masiva debe ser revisado por asesoría jurídica local.</p>
      <h2>1. Función de ALTOQUE</h2>
      <p>ALTOQUE es una plataforma de contacto local. Permite publicar necesidades, oportunidades, servicios y vacantes, y recibir propuestas. Salvo indicación expresa, ALTOQUE no es empleador, contratista, representante ni parte del acuerdo celebrado entre usuarios.</p>
      <h2>2. Cuenta y veracidad</h2>
      <p>Cada persona debe mantener una sola identidad auténtica, proteger su contraseña y proporcionar información clara. Está prohibido suplantar personas o comercios, manipular verificaciones o crear actividad engañosa.</p>
      <h2>3. Publicaciones permitidas</h2>
      <p>Las publicaciones deben describir una necesidad u oportunidad legítima, indicar condiciones relevantes y respetar las leyes aplicables. No se permiten estafas, discriminación, acoso, explotación, contenido sexual, productos ilegales, armas, sustancias prohibidas, datos personales de terceros ni trabajos que impliquen riesgos no informados.</p>
      <h2>4. Propuestas y acuerdos</h2>
      <p>Precio, alcance, materiales, horarios, garantías y forma de pago deben acordarse de manera clara antes de comenzar. ALTOQUE no garantiza la identidad, capacidad, matrícula, solvencia, calidad o cumplimiento de una persona, salvo el alcance específico de una verificación visible.</p>
      <h2>5. Seguridad</h2>
      <p>No envíes dinero por adelantado a desconocidos sin verificar identidad y condiciones. Evitá compartir códigos, claves, documentos completos o datos bancarios. Para tareas reguladas, solicitá matrícula, seguro o habilitación cuando corresponda.</p>
      <h2>6. Moderación</h2>
      <p>ALTOQUE puede ocultar, limitar o eliminar publicaciones, propuestas, cuentas o anuncios ante reportes, riesgo, incumplimiento o requerimiento legal. Un reporte no implica por sí mismo que exista una infracción.</p>
      <h2>7. Comercios y publicidad</h2>
      <p>Los espacios pagos se muestran como “Patrocinado”, “Anuncio local” o “Comercio aliado”. El comercio es responsable por la exactitud de precios, vigencia, stock, condiciones, permisos y promociones comunicadas.</p>
      <h2>8. Disponibilidad</h2>
      <p>El servicio puede cambiar, suspender funciones o presentar interrupciones. Se harán esfuerzos razonables para mantener estabilidad, pero no se promete disponibilidad ininterrumpida.</p>
      <h2>9. Aceptación y cambios</h2>
      <p>Crear una cuenta y utilizar la plataforma implica aceptar estos términos y la política de privacidad. Los cambios importantes serán comunicados dentro de la aplicación.</p>
      <h2>10. Información clara</h2>
      <p>Las ofertas, condiciones y limitaciones deben presentarse de forma comprensible. Para información general sobre relaciones de consumo podés consultar el portal oficial argentino.</p>
      <p><a className="textLink" href="https://www.argentina.gob.ar/justicia/derechofacil/leysimple/defensa-del-consumidor" target="_blank" rel="noreferrer">Defensa del consumidor — Argentina.gob.ar</a></p>
    </InfoPage>
  );
}
