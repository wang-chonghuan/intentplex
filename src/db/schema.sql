-- The whole content store. Applied by scripts/migrate.mjs, which is idempotent:
-- every statement is CREATE ... IF NOT EXISTS, so running it twice is a no-op.
--
-- Two axes that are easy to confuse and are deliberately separate tables:
--   rendition   — the site's own language versions (zh authored, en generated)
--   syndication — the platform versions (X zh/en, LinkedIn, Weibo)

create table if not exists media (
  id          uuid primary key,
  -- sha256 of the processed bytes. Deliberately **not** unique: the imported
  -- archive contains the same picture under two names (it was posted twice and
  -- each posting produced its own path), and those paths are referenced by
  -- entries that must keep rendering byte for byte. Identity here is `path`;
  -- sha256 is what lets a *new* upload notice it already has these bytes.
  sha256      text        not null,
  -- The public path, e.g. /media/linkedin/li-2371d55ac00a.webp. Stored rather
  -- than derived because the imported archive's paths must survive the move
  -- byte for byte — 180 entries reference them and none of that text is rewritten.
  path        text        not null unique,
  mime        text        not null,
  width       int,
  height      int,
  bytes       bytea       not null,
  -- The 128px list rendition. Null for SVGs, which are already small.
  thumb_bytes bytea,
  created_at  timestamptz not null default now()
);

create table if not exists entry (
  id             uuid primary key,
  kind           text        not null check (kind in ('post', 'article', 'work')),
  slug           text        not null,
  date           timestamptz not null,
  cover_media_id uuid references media (id),
  status         text        not null default 'published' check (status in ('draft', 'published')),
  -- The author asked for the English version and the four platform posts to be
  -- (re)written. Nothing in the container does that work: it happens on the
  -- author's own machine, in Claude Code, through the ipsl-compose skill — the
  -- same reason posting does. This column is how the website asks.
  generate_requested boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (kind, slug)
);

create table if not exists rendition (
  id        uuid primary key,
  entry_id  uuid not null references entry (id) on delete cascade,
  lang      text not null check (lang in ('en', 'zh')),
  title     text not null,
  body_md   text not null,
  -- Where this came from when it was written somewhere else first.
  source_url text,
  -- 'authored' is the one a person wrote; 'generated' came from a model and
  -- must be read by the author before the entry is published (ui.md Guidance).
  origin    text not null default 'authored' check (origin in ('authored', 'generated')),
  unique (entry_id, lang)
);

create table if not exists syndication (
  id         uuid primary key,
  entry_id   uuid        not null references entry (id) on delete cascade,
  channel    text        not null check (channel in ('x-en', 'x-zh', 'linkedin', 'weibo')),
  body       text        not null default '',
  -- draft    — generated, not yet approved
  -- approved — the author pressed send; the local skill may pick it up
  -- posting  — the skill claimed it. Set BEFORE the network call, so a crash
  --            leaves evidence rather than silently re-sending on the next run
  -- posted   — remote_url is filled in
  -- skip     — deliberately not going to this channel
  status     text        not null default 'draft'
             check (status in ('draft', 'approved', 'posting', 'posted', 'skip')),
  remote_url text,
  posted_at  timestamptz,
  updated_at timestamptz not null default now(),
  unique (entry_id, channel)
);

create index if not exists media_sha256_idx on media (sha256);
create index if not exists entry_kind_date_idx on entry (kind, date desc);
create index if not exists syndication_status_idx on syndication (status);
