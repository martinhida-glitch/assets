"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActivityIcon, HomeIcon, PlusIcon, UserIcon, WorkIcon } from "@/components/icons";
const items = [
  { href: "/app", label: "Inicio", icon: HomeIcon, exact: true },
  { href: "/app/jobs", label: "Trabajos", icon: WorkIcon },
  { href: "/app/publish", label: "Publicar", icon: PlusIcon, publish: true },
  { href: "/app/activity", label: "Actividad", icon: ActivityIcon },
  { href: "/app/profile", label: "Perfil", icon: UserIcon },
];
export function BottomNav(){const pathname=usePathname();return <nav className="bottomNav" aria-label="Navegación principal">{items.map(item=>{const active=item.exact?pathname===item.href:pathname.startsWith(item.href);const Icon=item.icon;return <Link key={item.href} href={item.href} className={`${active?"active":""} ${item.publish?"publishNav":""}`}><span><Icon/></span><small>{item.label}</small></Link>})}</nav>}
