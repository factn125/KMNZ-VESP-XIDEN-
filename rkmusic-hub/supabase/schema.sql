-- ============================================================
-- RK Music Hub — Supabase Schema
-- Supabase の SQL Editor に貼り付けて実行してください
-- ============================================================

-- アーティストテーブル
create table if not exists public.artists (
  id          serial primary key,
  slug        text unique not null,       -- 'kmnz' | 'vesp' | 'xiden' | 'honk'
  name_ja     text not null,
  name_en     text not null,
  description text,
  color1      text default '#ffffff',     -- グラデーション左色
  color2      text default '#aaaaaa',     -- グラデーション右色
  spotify_id  text,
  youtube_handle text,
  twitter_handle text,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- 曲テーブル
create table if not exists public.songs (
  id              serial primary key,
  artist_id       integer references public.artists(id) on delete cascade,
  title           text not null,
  year            integer not null,
  type            text not null check (type in ('orig','cover','collab')),
  members         text[] default '{}',    -- ['unit'] | ['lita','tina'] など
  youtube_id      text default '',
  spotify_url     text default '',
  note            text default '',
  is_external     boolean default false,  -- チャンネル外コラボ
  collab_artists  text[] default '{}',    -- コラボ相手 ['kmnz','vesp'] など
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- updated_at 自動更新トリガー
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger songs_updated_at
  before update on public.songs
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- RLS (Row Level Security)
-- 公開読み取り可 / 書き込みは認証ユーザーのみ
-- ============================================================
alter table public.artists enable row level security;
alter table public.songs    enable row level security;

-- 全員が読み取り可
create policy "Public read artists" on public.artists for select using (true);
create policy "Public read songs"   on public.songs   for select using (true);

-- 認証済みユーザーのみ書き込み可（管理者）
create policy "Auth insert artists" on public.artists for insert with check (auth.role() = 'authenticated');
create policy "Auth update artists" on public.artists for update using (auth.role() = 'authenticated');
create policy "Auth delete artists" on public.artists for delete using (auth.role() = 'authenticated');

create policy "Auth insert songs"   on public.songs   for insert with check (auth.role() = 'authenticated');
create policy "Auth update songs"   on public.songs   for update using (auth.role() = 'authenticated');
create policy "Auth delete songs"   on public.songs   for delete using (auth.role() = 'authenticated');

-- ============================================================
-- 初期アーティストデータ
-- ============================================================
insert into public.artists (slug, name_ja, name_en, description, color1, color2, spotify_id, youtube_handle, twitter_handle, sort_order) values
  ('kmnz',  'KMNZ',           'KMNZ',           'Virtual Hip Hop Unit', '#ff6b35', '#ff3a6e', '4uWpa0r7BZUXJ1ip2LJysz', '@KMNZOFFICIAL',        '@KMNSTREET',    1),
  ('vesp',  'VESPERBELL',     'VESPERBELL',     'Virtual Rock Girls Duo','#7b61ff', '#00d4ff', '0FMBfzP2kK1RajdetEVL5c', '@VESPERBELL',          '@vesperbell_info',2),
  ('xiden', 'XIDEN',          'XIDEN',          'VSinger Solo',         '#00e5b0', '#00aaff', '5IFmw6YxkOCVBaVEPbBMOf', '@XIDEN_RKMusic',       '@XIDEN_RKMusic', 3),
  ('honk',  'HONK THE HORN',  'HONK THE HORN',  'Virtual Girls Duo',    '#ffcc00', '#ff9966', null,                    '@honkthehorn_official', '@HONKTHEHORN_', 4)
on conflict (slug) do nothing;

-- ============================================================
-- 初期曲データ（KMNZサンプル数曲 — 残りは管理画面から追加）
-- ============================================================
do $$
declare
  kmnz_id integer;
  vesp_id integer;
  xiden_id integer;
  honk_id integer;
begin
  select id into kmnz_id  from public.artists where slug='kmnz';
  select id into vesp_id  from public.artists where slug='vesp';
  select id into xiden_id from public.artists where slug='xiden';
  select id into honk_id  from public.artists where slug='honk';

  -- KMNZ
  insert into public.songs (artist_id,title,year,type,members,youtube_id) values
    (kmnz_id,'OPENER',             2026,'orig','{unit}',''),
    (kmnz_id,'WAVE',               2025,'orig','{unit}',''),
    (kmnz_id,'DROPS',              2025,'orig','{unit}',''),
    (kmnz_id,'POSSE',              2025,'orig','{unit}',''),
    (kmnz_id,'TOKONATSU STYLE 2025',2025,'orig','{unit}',''),
    (kmnz_id,'Super Shooter (Cover)',2025,'cover','{unit}',''),
    (kmnz_id,'VERSE',              2024,'orig','{unit}','ZGlm8HqSkkU'),
    (kmnz_id,'MID JOURNEY',        2024,'orig','{unit}','X2YvS5GxXpo'),
    (kmnz_id,'CALLING',            2024,'orig','{unit}','YFq_i4TfCfs'),
    (kmnz_id,'BE NOISY!',          2024,'orig','{unit}','oBN6MF4PnNQ'),
    (kmnz_id,'NEW DAYS',           2024,'orig','{unit}','pJjXRKlGCtM'),
    (kmnz_id,'META FICTION',       2024,'orig','{unit}','I_B6ERBWmpc'),
    (kmnz_id,'DROP IN',            2024,'orig','{unit}','Dv7PF42O31A'),
    (kmnz_id,'GROWL',              2024,'orig','{unit}',''),
    (kmnz_id,'REVERSE',            2024,'orig','{lita}',''),
    (kmnz_id,'ビビデバ (Cover) / TINA',2024,'cover','{tina}','vD4ZhEpMoFE'),
    (kmnz_id,'ドラマツルギー (Cover) / NERO',2025,'cover','{nero}',''),
    (kmnz_id,'VR - Virtual Reality',2018,'orig','{lita}','9q5k3ySevqI'),
    (kmnz_id,'R U GAME?',          2019,'orig','{lita}',''),
    (kmnz_id,'melty girl',         2019,'orig','{lita}',''),
    (kmnz_id,'sTarZ',              2019,'orig','{lita}',''),
    (kmnz_id,'OUR DAYS',           2023,'orig','{lita}',''),
    (kmnz_id,'BE NOISY! (Cover) XIDEN × KMNZ LITA',2024,'collab','{collab,lita}','LDYgJhLoYZI'),
    (kmnz_id,'RISE feat.KMNZ LITA (VOICE SPARK ver.)',2024,'collab','{collab,lita}','');

  -- VESPERBELL
  insert into public.songs (artist_id,title,year,type,members,youtube_id) values
    (vesp_id,'MACH',               2026,'orig','{unit}',''),
    (vesp_id,'ISSEN / 一閃',        2025,'orig','{unit}',''),
    (vesp_id,'NO MORE!!',          2025,'orig','{unit}',''),
    (vesp_id,'WINGS',              2025,'orig','{unit}',''),
    (vesp_id,'Noise in Silence',   2024,'orig','{unit}','CCvB5X8UuvQ'),
    (vesp_id,'Bell Ringer',        2024,'orig','{unit}','jkzFmMPMSr8'),
    (vesp_id,'羽化 (emergence)',    2024,'orig','{unit}',''),
    (vesp_id,'RAMPAGE',            2023,'orig','{unit}','NX7s6-pWKXk'),
    (vesp_id,'VERSUS',             2021,'orig','{unit}','1KiQAq9UjAA'),
    (vesp_id,'RISE',               2020,'orig','{unit}','LZ3UEVqLr40'),
    (vesp_id,'The Everlasting Guilty Crown (Cover) / ヨミ',2020,'cover','{yomi}','5vZNqN6uNhg'),
    (vesp_id,'テレキャスター・ストライプ (Cover) / カスカ',2020,'cover','{kasuka}','UolCzCUHVu4'),
    (vesp_id,'ロウワー (Cover) ヨミ × 空澄セナ',2025,'collab','{collab,yomi}','V6C16SIlfR0');

  -- XIDEN
  insert into public.songs (artist_id,title,year,type,members,youtube_id) values
    (xiden_id,'RUNWAY',            2026,'orig','{xiden}',''),
    (xiden_id,'closer',            2025,'orig','{xiden}',''),
    (xiden_id,'宿命 (Shukumei)',   2025,'orig','{xiden}',''),
    (xiden_id,'OVERLAY',           2024,'orig','{xiden}','nQz7DLTFxuU'),
    (xiden_id,'BE NOISY! (Cover) XIDEN × KMNZ LITA',2024,'collab','{collab,xiden}','LDYgJhLoYZI'),
    (xiden_id,'ハレンチ (Cover / CHANMINA)',2024,'cover','{xiden}',''),
    (xiden_id,'フライデー・ナイト (Cover / Natori)',2024,'cover','{xiden}','');

  -- HONK THE HORN
  insert into public.songs (artist_id,title,year,type,members,youtube_id) values
    (honk_id,'NO LEASH',           2026,'orig','{unit}','7kTUgS414QE');

end $$;
