import Link from "next/link";

import { JobCard } from "@/components/job-card";
import { formatMoney, statusLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { JobPost } from "@/lib/types";

type ActivityProposal = {
  id: string;
  post_id: string;
  amount: number | null;
  amount_unit: string;
  message: string;
  status: string;
};

type ProposalPost = {
  id: string;
  title: string;
  locality: string;
  status: string;
};

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: posts }, { data: proposals }, { data: savedRows }] = await Promise.all([
    supabase
      .from("job_posts")
      .select("*,categories(name,group_name,slug)")
      .eq("author_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("proposals")
      .select("id,post_id,amount,amount_unit,message,status")
      .eq("proposer_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase.from("saved_jobs").select("post_id").eq("user_id", user!.id).order("created_at", { ascending: false }),
  ]);

  const typedPosts = (posts || []) as unknown as JobPost[];
  const typedProposals = (proposals || []) as ActivityProposal[];
  const proposalPostIds = [...new Set(typedProposals.map((proposal) => proposal.post_id))];
  const savedPostIds = (savedRows || []).map((row) => row.post_id);

  const { data: proposalPosts } = proposalPostIds.length
    ? await supabase
        .from("job_posts")
        .select("id,title,locality,status")
        .in("id", proposalPostIds)
    : { data: [] as ProposalPost[] };

  const proposalPostMap = new Map(
    ((proposalPosts || []) as ProposalPost[]).map((post) => [post.id, post]),
  );

  const { data: savedPosts } = savedPostIds.length
    ? await supabase
        .from("job_posts")
        .select("*,categories(name,group_name,slug)")
        .in("id", savedPostIds)
        .eq("status", "open")
    : { data: [] as JobPost[] };
  const typedSaved = (savedPosts || []) as unknown as JobPost[];

  return (
    <section>
      <div className="appPageTitle">
        <p className="eyebrow">TU MOVIMIENTO</p>
        <h1>Mi actividad</h1>
        <p>Publicaciones, propuestas y trabajos elegidos en un solo lugar.</p>
      </div>

      <div className="activityStats">
        <article>
          <strong>{typedPosts.length}</strong>
          <span>Publicaciones</span>
        </article>
        <article>
          <strong>{typedProposals.length}</strong>
          <span>Propuestas</span>
        </article>
        <article>
          <strong>{typedPosts.filter((post) => post.status === "completed").length}</strong>
          <span>Completadas</span>
        </article>
      </div>

      <div className="sectionTitle">
        <div>
          <h2>Mis publicaciones</h2>
          <p>Controlá su estado y propuestas.</p>
        </div>
      </div>

      <div className="jobList">
        {typedPosts.length ? (
          typedPosts.map((post) => <JobCard key={post.id} post={post} showStatus />)
        ) : (
          <div className="emptyState">
            <h3>Aún no publicaste</h3>
            <Link className="primaryButton small" href="/app/publish">
              Publicar ahora
            </Link>
          </div>
        )}
      </div>

      <div className="sectionTitle spaced">
        <div>
          <h2>Oportunidades guardadas</h2>
          <p>Favoritos privados para revisar más tarde.</p>
        </div>
      </div>
      <div className="jobList">
        {typedSaved.length ? typedSaved.map((post) => <JobCard key={post.id} post={post} />) : <div className="emptyState"><h3>No guardaste oportunidades</h3><Link className="primaryButton small" href="/app/jobs">Explorar trabajos</Link></div>}
      </div>

      <div className="sectionTitle spaced">
        <div>
          <h2>Mis propuestas</h2>
          <p>Seguimiento de tus postulaciones.</p>
        </div>
      </div>

      <div className="proposalList">
        {typedProposals.length ? (
          typedProposals.map((proposal) => {
            const post = proposalPostMap.get(proposal.post_id);
            return (
              <Link
                href={`/app/jobs/${proposal.post_id}`}
                className="proposalCard"
                key={proposal.id}
              >
                <div>
                  <span className={`statusBadge ${proposal.status}`}>
                    {statusLabel(proposal.status)}
                  </span>
                  <h3>{post?.title || "Publicación"}</h3>
                </div>
                <p>{proposal.message}</p>
                <strong>
                  {formatMoney(
                    proposal.amount,
                    proposal.amount,
                    proposal.amount_unit === "open" ? "open" : "fixed",
                  )}
                </strong>
              </Link>
            );
          })
        ) : (
          <div className="emptyState">
            <h3>Aún no enviaste propuestas</h3>
            <Link className="primaryButton small" href="/app/jobs">
              Buscar oportunidades
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
