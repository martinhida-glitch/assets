import { BellIcon } from "@/components/icons";
import { relativeTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { markAllNotificationsRead, openNotification } from "./actions";

type Notification = { id:string; title:string; body:string; href:string|null; is_read:boolean; created_at:string; type:string };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: notifications } = await supabase.from("notifications").select("id,title,body,href,is_read,created_at,type").order("created_at", { ascending: false }).limit(50);
  const items = (notifications || []) as Notification[];
  return <section>
    <div className="appPageTitle notificationTitle"><div><p className="eyebrow">NOVEDADES</p><h1>Notificaciones</h1><p>Propuestas, cambios y avisos importantes.</p></div>{items.some(n=>!n.is_read)&&<form action={markAllNotificationsRead}><button className="ghostButton">Marcar todas leídas</button></form>}</div>
    <div className="notificationList">{items.length?items.map(item=><form action={openNotification} key={item.id}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="href" value={item.href||"/app"}/><button className={`notificationCard ${item.is_read?"read":"unread"}`}><span className="notificationIcon"><BellIcon/></span><span><strong>{item.title}</strong><small>{item.body}</small><em>{relativeTime(item.created_at)}</em></span></button></form>):<div className="emptyState"><h3>No tenés notificaciones</h3><p>Cuando alguien envíe o cambie una propuesta, aparecerá acá.</p></div>}</div>
  </section>;
}
