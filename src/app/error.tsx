"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="statePage"><p className="eyebrow">ALGO NO SALIÓ BIEN</p><h1>No pudimos cargar esta pantalla.</h1><p>Podés intentar nuevamente sin perder tu cuenta.</p><button className="primaryButton" onClick={reset}>Reintentar</button></main>;
}
