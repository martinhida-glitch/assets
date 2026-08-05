import Link from "next/link";
import type { JobPost } from "@/lib/types";
import { formatMoney, relativeTime, statusLabel } from "@/lib/format";
import { PinIcon } from "@/components/icons";
export function JobCard({ post, showStatus = false }: { post: JobPost; showStatus?: boolean }) {
  return <Link href={`/app/jobs/${post.id}`} className="jobCard">
    <div className="jobTop"><span className="categoryTag">{post.categories?.name || (post.kind === "employment" ? "Empleo" : "Servicio")}</span><span className="jobPrice">{formatMoney(post.budget_min,post.budget_max,post.budget_mode)}</span></div>
    <h3>{post.title}</h3><p>{post.description}</p>
    <div className="jobMeta"><span><PinIcon/>{post.locality}</span><span>{relativeTime(post.published_at)}</span>{post.schedule_text&&<span>{post.schedule_text}</span>}{showStatus&&<span className={`statusBadge ${post.status}`}>{statusLabel(post.status)}</span>}</div>
  </Link>;
}
