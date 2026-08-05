import Link from "next/link";
import type { JobPost } from "@/lib/types";
import { expirationLabel, relativeTime } from "@/lib/format";
import { PinIcon } from "@/components/icons";
export function WallBoard({ posts, limit }: { posts: JobPost[]; limit?: number }) {
  const visible = typeof limit === "number" ? posts.slice(0, limit) : posts;
  if (!visible.length) return <div className="wallEmpty"><strong>El muro está listo</strong><p>Las oportunidades rápidas que se publiquen aparecerán acá como notas pegadas.</p><Link className="primaryButton small" href="/app/publish">Publicar la primera</Link></div>;
  return <div className="wallBoard">{visible.map((post,index)=><Link href={`/app/jobs/${post.id}`} className={`stickyNote tone${index%4} ${post.urgency==='urgent'?'urgent':''}`} key={post.id}><span className="pinDot"/><span className="noteKind">{post.kind==='employment'?'OFERTA':'NECESITO'}</span><h3>{post.title}</h3>{post.schedule_text&&<p className="schedule">{post.schedule_text}</p>}<div className="noteMeta"><span><PinIcon/>{post.locality}</span><span>{post.expires_at?expirationLabel(post.expires_at):relativeTime(post.published_at)}</span></div></Link>)}</div>;
}
