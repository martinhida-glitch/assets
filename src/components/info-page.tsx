import type { ReactNode } from "react";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";

export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <div className="publicPage">
      <PublicHeader />
      <main className="infoMain">
        <header className="infoHero">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </header>
        <article className="infoDocument">{children}</article>
      </main>
      <PublicFooter />
    </div>
  );
}
