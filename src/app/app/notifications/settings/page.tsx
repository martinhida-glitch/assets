import Link from "next/link";
import { redirect } from "next/navigation";

import { BellIcon, PinIcon } from "@/components/icons";
import { PushSubscriptionManager } from "@/components/push-subscription-manager";
import { ARGENTINA_PROVINCES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { createJobAlert, deleteJobAlert, sendTestPush, toggleJobAlert, updatePushPreferences } from "./actions";

type Preferences = {
  push_enabled: boolean;
  proposal_received: boolean;
  proposal_status: boolean;
  job_status: boolean;
  review_received: boolean;
  new_matching_jobs: boolean;
};
type Category = { id:number; name:string; group_name:string };
type Alert = { id:string; category_id:number|null; query_text:string|null; province:string|null; locality:string|null; is_active:boolean; created_at:string };

const defaultPreferences: Preferences = {
  push_enabled: true,
  proposal_received: true,
  proposal_status: true,
  job_status: true,
  review_received: true,
  new_matching_jobs: true,
};

export default async function PushSettingsPage({ searchParams }: { searchParams: Promise<{ error?:string; message?:string }> }) {
  const messages = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: preferencesData }, { data: categoryData }, { data: alertData }, { data: profile }] = await Promise.all([
    supabase.from("notification_preferences").select("push_enabled,proposal_received,proposal_status,job_status,review_received,new_matching_jobs").eq("user_id", user.id).maybeSingle(),
    supabase.from("categories").select("id,name,group_name").eq("is_active", true).order("sort_order"),
    supabase.from("job_alerts").select("id,category_id,query_text,province,locality,is_active,created_at").order("created_at", { ascending:false }),
    supabase.from("profiles").select("province,locality").eq("id", user.id).maybeSingle(),
  ]);

  const preferences = (preferencesData || defaultPreferences) as Preferences;
  const categories = (categoryData || []) as Category[];
  const alerts = (alertData || []) as Alert[];
  const categoryNames = new Map(categories.map(category => [category.id, category.name]));

  return <section>
    <div className="appPageTitle notificationSettingsTitle">
      <div><p className="eyebrow">AVISOS EN TIEMPO REAL</p><h1>Notificaciones push</h1><p>Elegí qué querés recibir y qué oportunidades te interesan.</p></div>
      <Link className="ghostButton" href="/app/notifications">Volver a notificaciones</Link>
    </div>
    {messages.error&&<p className="alert error">{messages.error}</p>}
    {messages.message&&<p className="alert success">{messages.message}</p>}

    <PushSubscriptionManager />

    <form action={updatePushPreferences} className="premiumForm pushPreferencesForm">
      <div className="sectionTitle"><div><h2>Qué avisos recibir</h2><p>Podés cambiar estas opciones cuando quieras.</p></div></div>
      <label className="preferenceToggle"><input type="checkbox" name="pushEnabled" defaultChecked={preferences.push_enabled}/><span><strong>Push generales</strong><small>Interruptor principal para todos los avisos externos.</small></span></label>
      <label className="preferenceToggle"><input type="checkbox" name="proposalReceived" defaultChecked={preferences.proposal_received}/><span><strong>Nuevas propuestas</strong><small>Cuando alguien se postula a una publicación tuya.</small></span></label>
      <label className="preferenceToggle"><input type="checkbox" name="proposalStatus" defaultChecked={preferences.proposal_status}/><span><strong>Propuesta aceptada o rechazada</strong><small>Cuando cambia el resultado de una propuesta que enviaste.</small></span></label>
      <label className="preferenceToggle"><input type="checkbox" name="jobStatus" defaultChecked={preferences.job_status}/><span><strong>Estado del trabajo</strong><small>Cuando un trabajo asignado se completa o cancela.</small></span></label>
      <label className="preferenceToggle"><input type="checkbox" name="reviewReceived" defaultChecked={preferences.review_received}/><span><strong>Calificaciones</strong><small>Cuando recibís una reseña después de un trabajo.</small></span></label>
      <label className="preferenceToggle"><input type="checkbox" name="newMatchingJobs" defaultChecked={preferences.new_matching_jobs}/><span><strong>Nuevas oportunidades compatibles</strong><small>Usa las alertas que configurás más abajo.</small></span></label>
      <button className="primaryButton full">Guardar preferencias</button>
    </form>

    <section className="pushTestPanel">
      <div><span className="sponsoredLabel">COMPROBACIÓN</span><h2>Probar este teléfono</h2><p>Primero activá las push arriba. Después enviá un aviso real de prueba.</p></div>
      <form action={sendTestPush}><button className="goldButton"><BellIcon/> Enviar prueba</button></form>
    </section>

    <form action={createJobAlert} className="premiumForm jobAlertForm">
      <div className="sectionTitle"><div><h2>Crear alerta de oportunidades</h2><p>Te avisaremos cuando una publicación coincida con la categoría o las palabras elegidas.</p></div></div>
      <div className="formGrid">
        <label>Categoría <span className="optional">(opcional)</span><select name="categoryId" defaultValue=""><option value="">Cualquier categoría</option>{categories.map(category=><option key={category.id} value={category.id}>{category.group_name} · {category.name}</option>)}</select></label>
        <label>Palabra o tarea <span className="optional">(opcional)</span><input name="queryText" minLength={2} maxLength={100} placeholder="Ej.: cortar pasto, pintura, mandados"/></label>
        <label>Provincia<select name="province" defaultValue={profile?.province||"La Pampa"}><option value="">Todo el país</option>{ARGENTINA_PROVINCES.map(province=><option key={province}>{province}</option>)}</select></label>
        <label>Localidad <span className="optional">(vacío = toda la provincia)</span><input name="locality" maxLength={100} defaultValue={profile?.locality||"Ingeniero Luiggi"}/></label>
      </div>
      <p className="fieldHint"><PinIcon/> Por ahora “cerca” usa localidad y provincia. El radio exacto por kilómetros se activará cuando el usuario autorice ubicación precisa.</p>
      <button className="primaryButton full">Crear alerta push</button>
    </form>

    <div className="sectionTitle spaced"><div><h2>Tus alertas</h2><p>Cada alerta puede pausarse o eliminarse.</p></div></div>
    <div className="jobAlertList">{alerts.length?alerts.map(alert=><article className={`jobAlertCard ${alert.is_active?"active":"paused"}`} key={alert.id}><div className="jobAlertIcon"><BellIcon/></div><div><span className="sponsoredLabel">{alert.is_active?"ACTIVA":"PAUSADA"}</span><h3>{alert.category_id?categoryNames.get(alert.category_id)||"Categoría": "Cualquier categoría"}</h3><p>{alert.query_text?`Contiene: “${alert.query_text}”`:"Sin palabra específica"}</p><small>{[alert.locality,alert.province].filter(Boolean).join(", ")||"Todo el país"}</small></div><div className="jobAlertActions"><form action={toggleJobAlert}><input type="hidden" name="id" value={alert.id}/><input type="hidden" name="active" value={alert.is_active?"false":"true"}/><button className="ghostButton">{alert.is_active?"Pausar":"Activar"}</button></form><form action={deleteJobAlert}><input type="hidden" name="id" value={alert.id}/><button className="dangerButton">Eliminar</button></form></div></article>):<div className="emptyState"><h3>No creaste alertas</h3><p>Creá una para enterarte apenas aparezca un trabajo compatible.</p></div>}</div>
  </section>;
}
