import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeInternalPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/app";
  try {
    const url = new URL(value, "https://altoque.local");
    if (url.origin !== "https://altoque.local") return "/app";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/app";
  }
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const nextPath = safeInternalPath(request.nextUrl.searchParams.get("next"));
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = nextPath.split(/[?#]/, 1)[0] || "/app";
  redirectTo.search = "";
  redirectTo.hash = "";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(redirectTo);
  }

  redirectTo.pathname = "/login";
  redirectTo.searchParams.set("error", "El enlace de confirmación es inválido o venció.");
  return NextResponse.redirect(redirectTo);
}
