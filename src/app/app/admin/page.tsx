import Link from "next/link";
import { notFound } from "next/navigation";
import { FlagIcon } from "@/components/icons";
import { relativeTime, statusLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { resolveReport } from "./actions";

type ReportRow = { id:string; post_id:string; reporter_id:string; reason:string; details:string|null; status:string; created_at:string; reviewed_at:string|null };
type PostRow = { id:string; title:string; status:string; locality:string; province:string };
type ReporterRow = { id:string; full_name:string; locality:string|null };
const reasonLabels: Record<string,string> = { spam:"Spam", fraud:"Posible fraude", inappropriate:"Contenido inapropiado", unsafe:"Situación riesgosa", duplicate:"Duplicada", other:"Otro" };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?:string; message?:string }> }) {
  const messages = await searchParams;
  const supabase = await createClient();
  const { data:{ user } } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: adminProfile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!adminProfile?.is_admin) notFound();

  const { data: reportData } = await supabase.from("job_reports").select("id,post_id,reporter_id,reason,details,status,created_at,reviewed_at").order("created_at", { ascending:false }).limit(100);
  const reports = (reportData || []) as ReportRow[];
  const postIds = [...new Set(reports.map(report => report.post_id))];
  const reporterIds = [...new Set(reports.map(report => report.reporter_id))];
  const [{ data: postData }, { data: reporterData }] = await Promise.all([
    postIds.length ? supabase.from("job_posts").select("id,title,status,locality,province").in("id", postIds) : Promise.resolve({ data: [] }),
    reporterIds.length ? supabase.from("profile_cards").select("id,full_name,locality").in("id", reporterIds) : Promise.resolve({ data: [] }),
  ]);
  const posts = new Map(((postData || []) as PostRow[]).map(post => [post.id, post]));
  const reporters = new Map(((reporterData || []) as ReporterRow[]).map(profile => [profile.id, profile]));
  const pending = reports.filter(report => report.status === "pending").length;
  const actioned = reports.filter(report => report.status === "actioned").length;

  return <section>
    <div className="appPageTitle"><p className="eyebrow">ADMINISTRACIÓN</p><h1>Moderación</h1><p>Reportes enviados por la comunidad y acciones sobre publicaciones.</p></div>
    {messages.error&&<p className="alert error">{messages.error}</p>}{messages.message&&<p className="alert success">{messages.message}</p>}
    <div className="activityStats adminStats"><article><strong>{reports.length}</strong><span>Total</span></article><article><strong>{pending}</strong><span>Pendientes</span></article><article><strong>{actioned}</strong><span>Accionados</span></article></div>
    <div className="adminReportList">{reports.length?reports.map(report=>{const post=posts.get(report.post_id);const reporter=reporters.get(report.reporter_id);return <article className={`adminReportCard ${report.status}`} key={report.id}><header><span className="reportReason"><FlagIcon/>{reasonLabels[report.reason]||report.reason}</span><span className={`statusBadge ${report.status}`}>{statusLabel(report.status)}</span></header><h2>{post?.title||"Publicación no disponible"}</h2><p>{report.details||"Sin detalles adicionales."}</p><div className="adminReportMeta"><span>Reportó: {reporter?.full_name||"Usuario"}{reporter?.locality?` · ${reporter.locality}`:""}</span><span>{relativeTime(report.created_at)}</span><span>Publicación: {post?.status||"desconocida"} · {post?.locality||""}</span></div><div className="adminReportActions"><Link className="ghostButton" href={`/app/jobs/${report.post_id}`}>Abrir publicación</Link>{report.status==="pending"&&<><form action={resolveReport}><input type="hidden" name="reportId" value={report.id}/><input type="hidden" name="resolution" value="dismissed"/><button className="ghostButton">Descartar</button></form><form action={resolveReport}><input type="hidden" name="reportId" value={report.id}/><input type="hidden" name="resolution" value="reviewed"/><button className="goldButton">Marcar revisado</button></form>{post&&["open","assigned"].includes(post.status)&&<form action={resolveReport}><input type="hidden" name="reportId" value={report.id}/><input type="hidden" name="resolution" value="actioned"/><input type="hidden" name="cancelPost" value="true"/><button className="dangerButton">Cancelar publicación</button></form>}</>}</div></article>}):<div className="emptyState"><h3>No hay reportes</h3><p>La bandeja de moderación está limpia.</p></div>}</div>
  </section>;
}
