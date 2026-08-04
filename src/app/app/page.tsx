import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Category, ContextualAd, JobPost } from "@/lib/types";
import { ArrowIcon, PlusIcon, SearchIcon, WorkIcon } from "@/components/icons";
import { CategoryIcon } from "@/components/category-icon";
import { JobCard } from "@/components/job-card";
import { SponsorBanner } from "@/components/sponsor-banner";
import { WallBoard } from "@/components/wall-board";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, locality, province").eq("id", user!.id).maybeSingle();
  const [{ data: categories }, { data: posts }, { data: wallPosts }, { data: ads }] = await Promise.all([
    supabase.from("categories").select("id,slug,name,group_name,kind").eq("is_active", true).order("sort_order").limit(36),
    supabase.from("job_posts").select("*,categories(name,group_name,slug)").eq("status", "open").order("published_at", { ascending: false }).limit(5),
    supabase.from("job_posts").select("*,categories(name,group_name,slug)").eq("status", "open").eq("is_wall_visible", true).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order("published_at", { ascending: false }).limit(8),
    supabase.rpc("get_contextual_ads", { p_placement: "top_banner", p_category_id: null, p_group_name: null, p_locality: profile?.locality || null, p_province: profile?.province || null, p_limit: 1 }),
  ]);
  const grouped = new Map<string, Category[]>();
  for (const category of (categories || []) as Category[]) grouped.set(category.group_name,[...(grouped.get(category.group_name)||[]),category]);
  const firstName = profile?.full_name?.split(" ")[0] || "";
  return <>
    <section className="welcomeRow"><div><p className="eyebrow">¡HOLA {firstName.toUpperCase()}!</p><h1>¿Qué necesitás hoy?</h1><p>Conectá con personas y oportunidades de {profile?.locality || "tu zona"}.</p></div></section>
    <SponsorBanner ad={(ads?.[0] || null) as ContextualAd | null} viewerLocality={profile?.locality || null}/>
    <form action="/app/jobs" className="premiumSearch"><SearchIcon/><input name="q" placeholder="Plomero, cadete, pintura, empleo..."/><button aria-label="Buscar"><ArrowIcon/></button></form>
    <section className="dashboardActions">
      <Link href="/app/publish" className="actionCard cyan"><span className="actionIcon"><PlusIcon/></span><div><h2>Necesito...</h2><p>Publicá lo que necesitás y compará propuestas.</p></div><ArrowIcon/></Link>
      <Link href="/app/jobs" className="actionCard gold"><span className="actionIcon"><WorkIcon/></span><div><h2>Quiero trabajar</h2><p>Encontrá tareas, changas y vacantes cerca.</p></div><ArrowIcon/></Link>
    </section>
    <section className="dashboardSection"><div className="sectionTitle"><div><h2>Explorar por categoría</h2><p>Servicios y oportunidades organizados.</p></div><Link href="/app/jobs">Ver todas</Link></div><div className="categoryStrip">{[...grouped.entries()].slice(0,6).map(([group,items])=><Link className="premiumCategory" href={`/app/jobs?q=${encodeURIComponent(group)}`} key={group}><span><CategoryIcon group={group}/></span><strong>{group}</strong><small>{items.slice(0,2).map(x=>x.name).join(" · ")}</small></Link>)}</div></section>
    <section className="dashboardSection"><div className="sectionTitle"><div><h2>Muro de ALTOQUE</h2><p>Recados, changas y oportunidades que acaban de publicarse.</p></div><Link href="/app/jobs?wall=1">Ver muro</Link></div><WallBoard posts={(wallPosts || []) as unknown as JobPost[]} limit={6}/></section>
    <section className="dashboardSection"><div className="sectionTitle"><div><h2>Oportunidades recientes</h2><p>Publicaciones reales de la comunidad.</p></div><Link href="/app/jobs">Ver todas</Link></div><div className="jobList">{posts?.length?(posts as unknown as JobPost[]).map(post=><JobCard post={post} key={post.id}/>):<div className="emptyState"><WorkIcon/><h3>Todavía no hay publicaciones</h3><p>La comunidad está lista. Publicá la primera necesidad u oportunidad.</p><Link href="/app/publish" className="primaryButton small">Publicar ahora</Link></div>}</div></section>
  </>;
}
