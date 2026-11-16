-- Casa Pixel — one row per house, reachable only through the functions below.
-- Access model: no login. Whoever holds the house code (a long random secret) can read and write that house.
-- The table itself is closed to the public API (RLS on, no policies); only the SHA-256 of the code is stored.

create extension if not exists unaccent with schema extensions;

create table if not exists public.homes (
  id uuid primary key default gen_random_uuid(),
  secret_hash text not null unique,
  objects jsonb not null default '[]'::jsonb, -- same shape as the page's `objects` array, plus `room` on each object
  updated_at timestamptz not null default now()
);
alter table public.homes enable row level security;
revoke all on public.homes from anon, authenticated;

create or replace function public.casa_hash(p_secret text) returns text
language sql immutable as $$ select encode(sha256(convert_to(coalesce(p_secret, ''), 'utf8')), 'hex') $$;

create or replace function public.casa_norm(t text) returns text
language sql stable set search_path = public, extensions as $$ select lower(unaccent(trim(coalesce(t, '')))) $$;

create or replace function public.casa_today() returns text
language sql stable as $$ select to_char((now() at time zone 'Europe/Lisbon')::date, 'YYYY-MM-DD') $$;

-- Days left until the plant needs water (<= 0 means thirsty).
create or replace function public.casa_remaining(p jsonb) returns int
language sql stable as $$
  select coalesce((p->>'intervalDays')::int, 7) - (casa_today()::date - (p->>'lastWatered')::date)
$$;

create or replace function public.casa_water_one(p jsonb) returns jsonb
language sql stable as $$
  select p || jsonb_build_object(
    'lastWatered', casa_today(),
    'history', case when p->'history'->>0 = casa_today() then p->'history'
                    else jsonb_build_array(casa_today()) || coalesce(p->'history', '[]'::jsonb) end)
$$;

-- ---------- used by the page ----------
create or replace function public.casa_get(p_secret text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('objects', objects, 'updated_at', updated_at)
  from homes where secret_hash = casa_hash(p_secret)
$$;

-- Replaces the whole house. Returns the new updated_at, or null when the code is wrong.
create or replace function public.casa_put(p_secret text, p_objects jsonb) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare ts timestamptz;
begin
  if jsonb_typeof(p_objects) <> 'array' or pg_column_size(p_objects) > 400000 then
    raise exception 'invalid house data';
  end if;
  update homes set objects = p_objects, updated_at = now()
  where secret_hash = casa_hash(p_secret) returning updated_at into ts;
  return ts;
end $$;

-- ---------- used by Siri Shortcuts (plain-text answers, in Portuguese) ----------
-- p_target: a plant name, a group name, a room name, or "todas". Matching ignores case and accents.
create or replace function public.casa_water(p_secret text, p_target text default 'todas', p_only_thirsty boolean default false)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare
  h homes; tgt text := casa_norm(p_target); everything boolean;
  o jsonb; p jsonb; ps jsonb; objs jsonb := '[]'::jsonb; names text[] := '{}'; whole boolean;
begin
  select * into h from homes where secret_hash = casa_hash(p_secret) for update;
  if not found then return 'Código da casa inválido.'; end if;
  everything := tgt in ('', 'todas', 'tudo', 'todas as plantas', 'as plantas', 'a casa toda');
  for o in select * from jsonb_array_elements(h.objects) loop
    whole := everything or casa_norm(o->>'room') like '%' || tgt || '%'
             or (o ? 'plants' and casa_norm(o->>'name') like '%' || tgt || '%');
    if o ? 'plant' then
      p := o->'plant';
      if (whole or casa_norm(p->>'name') like '%' || tgt || '%') and (not p_only_thirsty or casa_remaining(p) <= 0) then
        p := casa_water_one(p); names := names || (p->>'name');
      end if;
      o := jsonb_set(o, '{plant}', p);
    elsif o ? 'plants' then
      ps := '[]'::jsonb;
      for p in select * from jsonb_array_elements(o->'plants') loop
        if (whole or casa_norm(p->>'name') like '%' || tgt || '%') and (not p_only_thirsty or casa_remaining(p) <= 0) then
          p := casa_water_one(p); names := names || (p->>'name');
        end if;
        ps := ps || jsonb_build_array(p);
      end loop;
      o := jsonb_set(o, '{plants}', ps);
    end if;
    objs := objs || jsonb_build_array(o);
  end loop;
  if cardinality(names) = 0 then
    return case when p_only_thirsty then 'Nenhuma planta com sede' else 'Não encontrei nenhuma planta' end
      || case when everything then '.' else ' em "' || trim(p_target) || '".' end;
  end if;
  update homes set objects = objs, updated_at = now() where id = h.id;
  return case when cardinality(names) = 1 then 'Rega registada: ' || names[1] || '.'
              else 'Rega registada em ' || cardinality(names) || ' plantas: ' || array_to_string(names, ', ') || '.' end;
end $$;

create or replace function public.casa_thirsty(p_secret text) returns text
language plpgsql stable security definer set search_path = public as $$
declare h homes; names text[];
begin
  select * into h from homes where secret_hash = casa_hash(p_secret);
  if not found then return 'Código da casa inválido.'; end if;
  select array_agg((p->>'name') || coalesce(' (' || nullif(o->>'room', '') || ')', '') order by casa_remaining(p))
  into names
  from jsonb_array_elements(h.objects) o,
       lateral jsonb_array_elements(case when o ? 'plants' then o->'plants' when o ? 'plant' then jsonb_build_array(o->'plant') else '[]'::jsonb end) p
  where casa_remaining(p) <= 0;
  if names is null then return 'Todas as plantas estão regadas.'; end if;
  return case when cardinality(names) = 1 then 'Uma planta com sede: ' else cardinality(names) || ' plantas com sede: ' end
    || array_to_string(names, ', ') || '.';
end $$;

revoke all on function public.casa_get(text), public.casa_put(text, jsonb), public.casa_water(text, text, boolean), public.casa_thirsty(text) from public;
grant execute on function public.casa_get(text), public.casa_put(text, jsonb), public.casa_water(text, text, boolean), public.casa_thirsty(text) to anon, authenticated;
