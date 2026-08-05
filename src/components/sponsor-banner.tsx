"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { ContextualAd } from "@/lib/types";
import { safeCssImageUrl, safeExternalUrl } from "@/lib/safe-url";
import { createClient } from "@/lib/supabase/client";
import { ArrowIcon, PinIcon } from "@/components/icons";

const SESSION_KEY = "altoque_ad_session";

function getAnonymousSession(): string {
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing && existing.length >= 8 && existing.length <= 128) return existing;
  const token = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(SESSION_KEY, token);
  return token;
}

export function SponsorBanner({
  ad,
  compact = false,
  viewerLocality,
}: {
  ad?: ContextualAd | null;
  compact?: boolean;
  viewerLocality?: string | null;
}) {
  const recorded = useRef(false);
  const supabase = useMemo(() => createClient(), []);
  const targetUrl = safeExternalUrl(ad?.cta_url);
  const imageUrl = safeCssImageUrl(ad?.image_url);

  const record = useCallback(async (eventType: "impression" | "click" | "whatsapp") => {
    if (!ad) return;
    try {
      await supabase.rpc("record_ad_event", {
        p_campaign_id: ad.campaign_id,
        p_event_type: eventType,
        p_category_id: ad.category_id || null,
        p_locality: viewerLocality || ad.locality || null,
        p_placement: ad.placement || null,
        p_session_token: getAnonymousSession(),
      });
    } catch {
      // Las métricas no deben interrumpir la navegación del usuario.
    }
  }, [ad, supabase, viewerLocality]);

  useEffect(() => {
    if (!ad || !targetUrl || recorded.current) return;
    recorded.current = true;
    void record("impression");
  }, [ad, record, targetUrl]);

  if (!ad || !targetUrl) return null;

  let clickType: "click" | "whatsapp" = "click";
  try {
    const hostname = new URL(targetUrl).hostname.toLowerCase();
    if (hostname === "wa.me" || hostname.endsWith("whatsapp.com")) clickType = "whatsapp";
  } catch {
    return null;
  }

  return (
    <a
      className={`sponsorBanner ${compact ? "compact" : ""}`}
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => void record(clickType)}
    >
      <div>
        <span className="sponsoredLabel">PATROCINADO</span>
        <h3>{ad.title}</h3>
        {ad.body && <p>{ad.body}</p>}
        <span className="sponsorCta">{ad.cta_label || "Conocer más"}<ArrowIcon /></span>
      </div>
      <div className="sponsorVisual">
        {imageUrl ? (
          <span className="sponsorImage" style={{ backgroundImage: `url("${imageUrl}")` }} aria-hidden="true" />
        ) : (
          <><PinIcon /><strong>{ad.business_name}</strong></>
        )}
      </div>
    </a>
  );
}
