import { createClient } from "@/lib/supabase/server";
import type { Category, ContextualAd, JobPost } from "@/lib/types";
import { SearchIcon } from "@/components/icons";
import { JobCard } from "@/components/job-card";
import { SponsorBanner } from "@/components/sponsor-banner";
import { WallBoard } from "@/components/wall-board";

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; wall?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const safeQ = q.normalize("NFKC").replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  const parsedCategory = params.category ? Number(params.category) : null;
  const categoryId = parsedCategory && Number.isInteger(parsedCategory) && parsedCategory > 0 ? parsedCategory : null;
  const wall = params.wall === "1";
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  const {data:profile}=await supabase.from("profiles").select("locality,province").eq("id",user!.id).maybeSingle();
  const {data:categories}=await supabase.from("categories").select("id,slug,name,group_name,kind").eq("is_active",true).order("sort_order");
  let query=supabase.from("job_posts").select("*,categories(name,group_name,slug)").eq("status","open").order("published_at",{ascending:false}).limit(100);
  if(categoryId) query=query.eq("category_id",categoryId);
  if(wall) query=query.eq("is_wall_visible",true).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
  if(safeQ) query=query.or(`title.ilike.%${safeQ}%,description.ilike.%${safeQ}%,locality.ilike.%${safeQ}%`);
  const {data:posts}=await query;
  const typedCategories=(categories||[]) as unknown as Category[];
  const selected=typedCategories.find((c:Category)=>c.id===categoryId);
  const {data:ads}=await supabase.rpc("get_contextual_ads",{p_placement:"contextual_card",p_category_id:categoryId,p_group_name:selected?.group_name||null,p_locality:profile?.locality||null,p_province:profile?.province||null,p_limit:1});
  return <section><div className="appPageTitle"><p className="eyebrow">{wall?"MURO LOCAL":"OPORTUNIDADES"}</p><h1>{wall?"El muro de ALTOQUE":"Trabajos cerca tuyo"}</h1><p>{wall?"Notas rápidas con horario y vencimiento.":"Buscá servicios, changas, recados y vacantes por categoría."}</p></div>
    <form className="jobFilters"><label className="premiumSearch"><SearchIcon/><input name="q" defaultValue={q} placeholder="Buscar oportunidad..."/></label><select name="category" defaultValue={categoryId||""}><option value="">Todas las categorías</option>{typedCategories.map((c:Category)=><option key={c.id} value={c.id}>{c.name}</option>)}</select>{wall&&<input type="hidden" name="wall" value="1"/>}<button className="primaryButton small">Buscar</button></form>
    <SponsorBanner compact ad={(ads?.[0]||null) as ContextualAd|null} viewerLocality={profile?.locality || null}/>
    {wall?<WallBoard posts={(posts||[]) as unknown as JobPost[]}/>:<div className="jobList">{posts?.length?(posts as unknown as JobPost[]).map(post=><JobCard key={post.id} post={post}/>):<div className="emptyState"><SearchIcon/><h3>Sin resultados</h3><p>Probá otra búsqueda o publicá una nueva necesidad.</p></div>}</div>}
  </section>;
}
