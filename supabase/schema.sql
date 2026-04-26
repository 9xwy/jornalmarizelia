create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.allowed_admin_emails (
  email text primary key,
  label text,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_allowed_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.allowed_admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  summary text not null,
  content text not null,
  author_name text not null,
  cover_image_url text,
  cover_tone text default 'from-primary/60 to-primary/25',
  featured boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text default '',
  category text not null,
  image_url text,
  cover_tone text default 'from-primary/60 to-primary/25',
  featured boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  category text not null default 'Academico',
  location text default '',
  event_date date not null,
  highlight boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.student_works (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  work_type text not null,
  author_name text not null,
  excerpt text not null,
  content text not null,
  cover_image_url text,
  cover_tone text default 'from-primary/60 to-primary/25',
  featured boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  notice_type text not null,
  icon text not null default 'info',
  title text not null,
  description text not null,
  pinned boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  description text default '',
  is_active boolean not null default true,
  closes_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null,
  votes_count integer not null default 0,
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  voter_token text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (poll_id, voter_token)
);

alter table public.allowed_admin_emails drop constraint if exists allowed_admin_emails_email_format_check;
alter table public.allowed_admin_emails
add constraint allowed_admin_emails_email_format_check
check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') not valid;

alter table public.news_posts drop constraint if exists news_posts_slug_format_check;
alter table public.news_posts
add constraint news_posts_slug_format_check
check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$') not valid;

alter table public.student_works drop constraint if exists student_works_slug_format_check;
alter table public.student_works
add constraint student_works_slug_format_check
check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$') not valid;

alter table public.news_posts drop constraint if exists news_posts_cover_image_url_scheme_check;
alter table public.news_posts
add constraint news_posts_cover_image_url_scheme_check
check (cover_image_url is null or cover_image_url ~* '^https?://[^[:space:]]+$') not valid;

alter table public.gallery_items drop constraint if exists gallery_items_image_url_scheme_check;
alter table public.gallery_items
add constraint gallery_items_image_url_scheme_check
check (image_url is null or image_url ~* '^https?://[^[:space:]]+$') not valid;

alter table public.student_works drop constraint if exists student_works_cover_image_url_scheme_check;
alter table public.student_works
add constraint student_works_cover_image_url_scheme_check
check (cover_image_url is null or cover_image_url ~* '^https?://[^[:space:]]+$') not valid;

drop trigger if exists news_posts_set_updated_at on public.news_posts;
create trigger news_posts_set_updated_at before update on public.news_posts for each row execute function public.set_updated_at();

drop trigger if exists gallery_items_set_updated_at on public.gallery_items;
create trigger gallery_items_set_updated_at before update on public.gallery_items for each row execute function public.set_updated_at();

drop trigger if exists calendar_events_set_updated_at on public.calendar_events;
create trigger calendar_events_set_updated_at before update on public.calendar_events for each row execute function public.set_updated_at();

drop trigger if exists student_works_set_updated_at on public.student_works;
create trigger student_works_set_updated_at before update on public.student_works for each row execute function public.set_updated_at();

drop trigger if exists notices_set_updated_at on public.notices;
create trigger notices_set_updated_at before update on public.notices for each row execute function public.set_updated_at();

drop trigger if exists polls_set_updated_at on public.polls;
create trigger polls_set_updated_at before update on public.polls for each row execute function public.set_updated_at();

drop trigger if exists poll_options_set_updated_at on public.poll_options;
create trigger poll_options_set_updated_at before update on public.poll_options for each row execute function public.set_updated_at();

alter table public.allowed_admin_emails enable row level security;
alter table public.news_posts enable row level security;
alter table public.gallery_items enable row level security;
alter table public.calendar_events enable row level security;
alter table public.student_works enable row level security;
alter table public.notices enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;

grant select on public.news_posts to anon, authenticated;
grant select on public.gallery_items to anon, authenticated;
grant select on public.calendar_events to anon, authenticated;
grant select on public.student_works to anon, authenticated;
grant select on public.notices to anon, authenticated;
grant select on public.polls to anon, authenticated;
grant select on public.poll_options to anon, authenticated;

grant select, insert, update, delete on public.news_posts to authenticated;
grant select, insert, update, delete on public.gallery_items to authenticated;
grant select, insert, update, delete on public.calendar_events to authenticated;
grant select, insert, update, delete on public.student_works to authenticated;
grant select, insert, update, delete on public.notices to authenticated;
grant select, insert, update, delete on public.polls to authenticated;
grant select, insert, update, delete on public.poll_options to authenticated;
grant select on public.allowed_admin_emails to authenticated;
grant select on public.poll_votes to authenticated;

drop policy if exists "public read allowed_admin_emails" on public.allowed_admin_emails;
create policy "public read allowed_admin_emails"
on public.allowed_admin_emails
for select
to authenticated
using (public.is_allowed_admin());

drop policy if exists "admin manage allowed_admin_emails" on public.allowed_admin_emails;
create policy "admin manage allowed_admin_emails"
on public.allowed_admin_emails
for all
to authenticated
using (public.is_allowed_admin())
with check (public.is_allowed_admin());

drop policy if exists "public read published news" on public.news_posts;
create policy "public read published news"
on public.news_posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "admin manage news" on public.news_posts;
create policy "admin manage news"
on public.news_posts
for all
to authenticated
using (public.is_allowed_admin())
with check (public.is_allowed_admin());

drop policy if exists "public read published gallery" on public.gallery_items;
create policy "public read published gallery"
on public.gallery_items
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "admin manage gallery" on public.gallery_items;
create policy "admin manage gallery"
on public.gallery_items
for all
to authenticated
using (public.is_allowed_admin())
with check (public.is_allowed_admin());

drop policy if exists "public read published events" on public.calendar_events;
create policy "public read published events"
on public.calendar_events
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "admin manage events" on public.calendar_events;
create policy "admin manage events"
on public.calendar_events
for all
to authenticated
using (public.is_allowed_admin())
with check (public.is_allowed_admin());

drop policy if exists "public read published works" on public.student_works;
create policy "public read published works"
on public.student_works
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "admin manage works" on public.student_works;
create policy "admin manage works"
on public.student_works
for all
to authenticated
using (public.is_allowed_admin())
with check (public.is_allowed_admin());

drop policy if exists "public read published notices" on public.notices;
create policy "public read published notices"
on public.notices
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "admin manage notices" on public.notices;
create policy "admin manage notices"
on public.notices
for all
to authenticated
using (public.is_allowed_admin())
with check (public.is_allowed_admin());

drop policy if exists "public read active polls" on public.polls;
create policy "public read active polls"
on public.polls
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "admin manage polls" on public.polls;
create policy "admin manage polls"
on public.polls
for all
to authenticated
using (public.is_allowed_admin())
with check (public.is_allowed_admin());

drop policy if exists "public read poll options" on public.poll_options;
create policy "public read poll options"
on public.poll_options
for select
to anon, authenticated
using (
  exists (
    select 1 from public.polls
    where polls.id = poll_options.poll_id
      and polls.is_active = true
  )
);

drop policy if exists "admin manage poll options" on public.poll_options;
create policy "admin manage poll options"
on public.poll_options
for all
to authenticated
using (public.is_allowed_admin())
with check (public.is_allowed_admin());

drop policy if exists "admin manage poll votes" on public.poll_votes;
create policy "admin manage poll votes"
on public.poll_votes
for all
to authenticated
using (public.is_allowed_admin())
with check (public.is_allowed_admin());

create or replace function public.vote_for_poll_option(
  p_poll_id uuid,
  p_option_id uuid,
  p_voter_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vote_exists boolean;
  v_total_votes integer;
begin
  if p_voter_token is null or length(trim(p_voter_token)) < 12 then
    raise exception 'Voto invalido.';
  end if;

  if not exists (
    select 1
    from public.polls
    where id = p_poll_id
      and is_active = true
      and (closes_at is null or closes_at > timezone('utc', now()))
  ) then
    raise exception 'A enquete nao esta ativa.';
  end if;

  if not exists (
    select 1
    from public.poll_options
    where id = p_option_id
      and poll_id = p_poll_id
  ) then
    raise exception 'Opcao nao encontrada.';
  end if;

  select count(*) > 0
  into v_vote_exists
  from public.poll_votes
  where poll_id = p_poll_id
    and voter_token = p_voter_token;

  if v_vote_exists then
    raise exception 'Voce ja votou nesta enquete.';
  end if;

  insert into public.poll_votes (poll_id, option_id, voter_token)
  values (p_poll_id, p_option_id, p_voter_token);

  update public.poll_options
  set votes_count = votes_count + 1
  where id = p_option_id;

  select coalesce(sum(votes_count), 0)
  into v_total_votes
  from public.poll_options
  where poll_id = p_poll_id;

  return jsonb_build_object(
    'success', true,
    'poll_id', p_poll_id,
    'option_id', p_option_id,
    'total_votes', v_total_votes
  );
end;
$$;

grant execute on function public.vote_for_poll_option(uuid, uuid, text) to anon, authenticated;

comment on table public.allowed_admin_emails is 'Adicione aqui os emails que podem usar o painel admin.';
comment on function public.vote_for_poll_option(uuid, uuid, text) is 'Executa um voto publico com protecao por token local.';

insert into public.allowed_admin_emails (email, label)
values ('scrylocked@proton.me', 'Administrador principal')
on conflict (email) do nothing;
