import { Brand } from "@/components/brand";
import { BottomNav } from "@/components/bottom-nav";
import { BellIcon, PinIcon } from "@/components/icons";
import { signOut } from "@/app/auth/actions";

export function AppShell({ children, locality }: { children: React.ReactNode; locality?: string | null }) {
  return (
    <div className="appFrame">
      <header className="appHeader">
        <Brand compact app />
        <div className="appHeaderActions">
          <span className="localityPill"><PinIcon /> {locality || "Elegir localidad"}</span>
          <button className="iconButton" aria-label="Notificaciones"><BellIcon /></button>
        </div>
      </header>
      <main className="appMain">{children}</main>
      <BottomNav />
      <form action={signOut} className="signOutDock"><button type="submit" title="Cerrar sesión">Salir</button></form>
    </div>
  );
}
