import Link from "next/link";
import { Brand } from "@/components/brand";
import { BottomNav } from "@/components/bottom-nav";
import { BellIcon, PinIcon } from "@/components/icons";
import { signOut } from "@/app/auth/actions";

export function AppShell({ children, locality, unreadCount = 0 }: { children: React.ReactNode; locality?: string | null; unreadCount?: number }) {
  return (
    <div className="appFrame">
      <header className="appHeader">
        <Brand compact app />
        <div className="appHeaderActions">
          <span className="localityPill"><PinIcon /> {locality || "Elegir localidad"}</span>
          <Link className="iconButton notificationButton" aria-label="Notificaciones" href="/app/notifications"><BellIcon />{unreadCount>0&&<span>{unreadCount>9?"9+":unreadCount}</span>}</Link>
        </div>
      </header>
      <main className="appMain">{children}</main>
      <BottomNav />
      <form action={signOut} className="signOutDock"><button type="submit" title="Cerrar sesión">Salir</button></form>
    </div>
  );
}
