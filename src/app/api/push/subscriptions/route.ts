import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type SubscriptionPayload = {
  endpoint?: unknown;
  expirationTime?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
};

function validText(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.length >= min && value.length <= max;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  let payload: SubscriptionPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Suscripción inválida." }, { status: 400 });
  }

  const endpoint = payload.endpoint;
  const p256dh = payload.keys?.p256dh;
  const auth = payload.keys?.auth;
  if (!validText(endpoint, 20, 4096) || !validText(p256dh, 20, 512) || !validText(auth, 8, 256)) {
    return NextResponse.json({ error: "Faltan datos de la suscripción." }, { status: 400 });
  }

  const expirationTime = typeof payload.expirationTime === "number" ? Math.trunc(payload.expirationTime) : null;
  const { error } = await supabase.rpc("register_push_subscription", {
    p_endpoint: endpoint,
    p_p256dh: p256dh,
    p_auth: auth,
    p_expiration_time: expirationTime,
    p_user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
  });

  if (error) return NextResponse.json({ error: "No pudimos guardar este dispositivo." }, { status: 500 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  let endpoint = "";
  try {
    const payload = await request.json();
    endpoint = typeof payload?.endpoint === "string" ? payload.endpoint : "";
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!validText(endpoint, 20, 4096)) return NextResponse.json({ error: "Suscripción inválida." }, { status: 400 });
  const { error } = await supabase.rpc("unregister_push_subscription", { p_endpoint: endpoint });
  if (error) return NextResponse.json({ error: "No pudimos desactivar este dispositivo." }, { status: 500 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
