import Link from "next/link";

export function Brand({ compact = false, app = false }: { compact?: boolean; app?: boolean }) {
  return (
    <Link href={app ? "/app" : "/"} className={`brand ${compact ? "compact" : ""}`} aria-label="ALTOQUE, inicio">
      <span className="brandSymbol" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="img">
          <defs>
            <linearGradient id="pinBlue" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#00e5ff"/><stop offset="1" stopColor="#006cff"/></linearGradient>
            <linearGradient id="checkGold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0a8"/><stop offset=".45" stopColor="#ffc107"/><stop offset="1" stopColor="#a76b00"/></linearGradient>
          </defs>
          <path className="speedLine" d="M4 24h20M1 31h20M7 38h15" />
          <path className="pinPath" d="M34 5c-14 0-24 10-24 23 0 17 24 31 24 31s24-14 24-31C58 15 48 5 34 5Z" fill="none" stroke="url(#pinBlue)"/>
          <path d="m20 29 10 10L51 17" fill="none" stroke="url(#checkGold)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      <span className="brandTextBlock">
        <span className="brandWords"><span className="brandAl">AL</span><span className="brandToque">TOQUE</span></span>
        {!compact && <small>CONECTA · PUBLICÁ · RESOLVÉ</small>}
      </span>
    </Link>
  );
}
