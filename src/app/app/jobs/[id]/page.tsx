import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { BookmarkIcon, FlagIcon, PinIcon, StarIcon, UserIcon } from "@/components/icons";
import { formatMoney, relativeTime, statusLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { JobPost, Proposal } from "@/lib/types";
import {
  acceptProposal,
  changePostStatus,
  reportJob,
  submitProposal,
  submitReview,
  toggleSavedJob,
} from "./actions";

type JobImage = { id: string; storage_path: string; sort_order: number };
type PageMessages = { error?: string; message?: string };
type ReviewRow = { rating: number; comment: string | null };

export default async function JobDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<PageMessages> }) {
  const { id } = await params;
  const messages = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post } = await supabase.from("job_posts").select("*,categories(name,group_name,slug)").eq("id", id).maybeSingle();
  if (!post) notFound();

  const typed = post as unknown as JobPost;
  const [{ data: author }, { data: images }, { data: proposals }] = await Promise.all([
    supabase.from("profile_cards").select("full_name,headline,avatar_url,bio,experience_text,availability_text,locality,province,identity_verified").eq("id", typed.author_id).maybeSingle(),
    supabase.from("job_images").select("id,storage_path,sort_order").eq("post_id", id).order("sort_order"),
    supabase.from("proposals").select("*").eq("post_id", id).order("created_at"),
  ]);

  const typedProposals = (proposals || []) as Proposal[];
  const isOwner = user.id === typed.author_id;
  const ownProposal = typedProposals.find((proposal) => proposal.proposer_id === user.id);
  const acceptedProposal = typedProposals.find((proposal) => proposal.status === "accepted");

  const [{ data: authorReviews }, { data: ownReview }] = await Promise.all([
    supabase.from("job_reviews").select("rating,comment").eq("reviewee_id", typed.author_id),
    supabase.from("job_reviews").select("rating,comment").eq("post_id", id).eq("reviewer_id", user.id).maybeSingle(),
  ]);
  const ratings = ((authorReviews || []) as ReviewRow[]).map((review) => review.rating);
  const averageRating = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null;
  const canReview = typed.status === "completed" && Boolean(acceptedProposal) && (isOwner || acceptedProposal?.proposer_id === user.id);

  const [{ data: saved }, { data: reported }] = !isOwner
    ? await Promise.all([
        supabase.from("saved_jobs").select("post_id").eq("user_id", user.id).eq("post_id", id).maybeSingle(),
        supabase.from("job_reports").select("id").eq("reporter_id", user.id).eq("post_id", id).maybeSingle(),
      ])
    : [{ data: null }, { data: null }];

  return <section>
    {messages.error && <p className="alert error">{messages.error}</p>}
    {messages.message && <p className="alert success">{messages.message}</p>}

    <article className="detailHero"><span className="categoryTag">{typed.categories?.name}</span><h1>{typed.title}</h1><p>{typed.description}</p><div className="detailMeta"><span><PinIcon />{typed.locality}, {typed.province}</span><span>{relativeTime(typed.published_at)}</span><strong>{formatMoney(typed.budget_min, typed.budget_max, typed.budget_mode)}</strong><span className={`statusBadge ${typed.status}`}>{statusLabel(typed.status)}</span></div></article>

    {!isOwner && <div className="communityActions"><form action={toggleSavedJob}><input type="hidden" name="postId" value={id}/><button className={`ghostButton ${saved ? "saved" : ""}`}><BookmarkIcon />{saved ? "Guardada" : "Guardar"}</button></form>{reported?<span className="reportSent"><FlagIcon /> Reportada</span>:<details className="reportDetails"><summary><FlagIcon /> Reportar</summary><form action={reportJob} className="reportForm"><input type="hidden" name="postId" value={id}/><label>Motivo<select name="reason" required defaultValue="spam"><option value="spam">Spam</option><option value="fraud">Posible fraude</option><option value="inappropriate">Contenido inapropiado</option><option value="unsafe">Situación riesgosa</option><option value="duplicate">Duplicada</option><option value="other">Otro</option></select></label><label>Detalles <span className="optional">(opcional)</span><textarea name="details" maxLength={1000}/></label><button className="dangerButton">Enviar reporte</button></form></details>}</div>}

    {images?.length?<div className="imageGallery">{(images as JobImage[]).map((image)=><Image key={image.id} width={720} height={480} src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/job-images/${image.storage_path}`} alt="Foto de la publicación" unoptimized/>)}</div>:null}

    <article className="authorCard"><div className="authorAvatar">{author?.avatar_url?<Image src={author.avatar_url} alt="" width={70} height={70} unoptimized/>:<UserIcon/>}</div><div><span className="sponsoredLabel">PERFIL LOCAL</span><h2>{author?.full_name||"Usuario de ALTOQUE"}</h2>{author?.headline&&<strong>{author.headline}</strong>}<p>{author?.bio||"Este perfil todavía no agregó una presentación."}</p>{author?.identity_verified&&<span className="verified"><StarIcon /> Identidad verificada</span>}{averageRating!==null&&<span className="ratingSummary"><StarIcon /> {averageRating.toFixed(1)} · {ratings.length} {ratings.length===1?"calificación":"calificaciones"}</span>}</div></article>

    {canReview&&!ownReview&&<form action={submitReview} className="reviewPanel"><input type="hidden" name="postId" value={id}/><h2>Calificá este trabajo</h2><p>Tu opinión se publica en el perfil de la otra persona.</p><div className="ratingChoices" role="radiogroup" aria-label="Calificación">{[1,2,3,4,5].map((rating)=><label key={rating}><input type="radio" name="rating" value={rating} required/><span>{rating} ★</span></label>)}</div><textarea name="comment" maxLength={1000} placeholder="Contá brevemente cómo fue la experiencia (opcional)."/><button className="goldButton">Publicar calificación</button></form>}
    {ownReview&&<p className="reviewReceived">Ya calificaste este trabajo con <strong>{ownReview.rating} de 5 estrellas</strong>.</p>}

    {!isOwner&&typed.status==="open"&&!ownProposal?<form action={submitProposal} className="premiumForm proposalForm"><input type="hidden" name="postId" value={id}/><div className="sectionTitle"><div><h2>Enviar una propuesta</h2><p>Explicá precio, disponibilidad y qué incluye.</p></div></div><div className="formGrid"><label>Monto<input name="amount" type="number" min="0"/></label><label>Modalidad<select name="amountUnit" defaultValue="total"><option value="total">Total</option><option value="hour">Por hora</option><option value="day">Por día</option><option value="month">Mensual</option><option value="open">A convenir</option></select></label></div><label>Mensaje<textarea name="message" required minLength={3} placeholder="Presentate y explicá cómo resolverías la necesidad."/></label><div className="formGrid"><label>Disponibilidad<input name="availability" placeholder="Ej.: Mañana desde las 14"/></label><label>Tiempo estimado<input name="estimated" placeholder="Ej.: 3 horas"/></label></div><label>Qué incluye<input name="includes"/></label><label>Garantía o aclaraciones<input name="warranty"/></label><button className="primaryButton full">Enviar propuesta</button></form>:ownProposal?<p className="privacyPanel">Tu propuesta está <strong>{statusLabel(ownProposal.status)}</strong>.</p>:null}

    {isOwner&&<section className="ownerArea"><div className="sectionTitle"><div><h2>Propuestas recibidas</h2><p>Compará y elegí con confianza.</p></div></div><div className="proposalList">{typedProposals.length?typedProposals.map((proposal)=><article className="proposalCard" key={proposal.id}><div><span className={`statusBadge ${proposal.status}`}>{statusLabel(proposal.status)}</span><h3>{formatMoney(proposal.amount, proposal.amount, proposal.amount_unit==="open"?"open":"fixed")}</h3></div><p>{proposal.message}</p>{proposal.availability_text&&<small>Disponibilidad: {proposal.availability_text}</small>}{proposal.status==="pending"&&typed.status==="open"&&<form action={acceptProposal}><input type="hidden" name="proposalId" value={proposal.id}/><input type="hidden" name="postId" value={id}/><button className="goldButton">Aceptar propuesta</button></form>}</article>):<div className="emptyState"><h3>Todavía no recibiste propuestas</h3><p>Las nuevas propuestas aparecerán en esta sección.</p></div>}</div>{["open","assigned"].includes(typed.status)&&<div className="ownerButtons">{typed.status==="assigned"&&<form action={changePostStatus}><input type="hidden" name="postId" value={id}/><input type="hidden" name="status" value="completed"/><button className="ghostButton">Marcar completada</button></form>}<form action={changePostStatus}><input type="hidden" name="postId" value={id}/><input type="hidden" name="status" value="cancelled"/><button className="dangerButton">Cancelar publicación</button></form></div>}</section>}
  </section>;
}
