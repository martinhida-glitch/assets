-- ALTOQUE v027 — métricas anónimas para campañas patrocinadas.
-- Ya aplicada en producción. Se conserva para versionado; no ejecutar manualmente.

create or replace function public.record_ad_event(
  p_campaign_id uuid,
  p_event_type text,
  p_category_id bigint default null,
  p_locality text default null,
  p_placement text default null,
  p_session_token text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text;
begin
  if p_event_type not in ('impression','click','whatsapp') then
    raise exception 'Tipo de evento inválido';
  end if;

  if p_session_token is null or char_length(p_session_token) < 8 or char_length(p_session_token) > 128 then
    raise exception 'Sesión anónima inválida';
  end if;

  perform 1
  from public.ad_campaigns c
  join public.businesses b on b.id = c.business_id
  where c.id = p_campaign_id
    and c.status = 'active'
    and c.starts_at <= now()
    and (c.ends_at is null or c.ends_at > now())
    and b.is_active = true;

  if not found then
    raise exception 'Campaña no disponible';
  end if;

  v_hash := encode(extensions.digest(p_session_token || ':' || p_campaign_id::text, 'sha256'), 'hex');

  if p_event_type = 'impression' and exists (
    select 1
    from public.ad_events e
    where e.campaign_id = p_campaign_id
      and e.event_type = p_event_type
      and e.anonymous_session_hash = v_hash
      and e.occurred_at > now() - interval '30 minutes'
  ) then
    return;
  end if;

  insert into public.ad_events (
    campaign_id, event_type, category_id, locality, placement, anonymous_session_hash
  ) values (
    p_campaign_id,
    p_event_type,
    p_category_id,
    nullif(left(trim(coalesce(p_locality,'')),100),''),
    nullif(left(trim(coalesce(p_placement,'')),40),''),
    v_hash
  );
end;
$$;

revoke all on function public.record_ad_event(uuid,text,bigint,text,text,text) from public;
grant execute on function public.record_ad_event(uuid,text,bigint,text,text,text)
  to anon, authenticated, service_role;

create index if not exists ad_events_dedupe_idx
  on public.ad_events (campaign_id, event_type, anonymous_session_hash, occurred_at desc);
