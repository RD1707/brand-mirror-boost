-- ============================================================================
-- BOTICÁRIO CLONE — SCHEMA COMPLETO PARA SUPABASE
-- Cole este arquivo inteiro no SQL Editor do Supabase e execute uma vez.
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
create extension if not exists "pgcrypto";

-- ============================================================================
-- 2. ENUM DE ROLES
-- ============================================================================
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum ('pending', 'paid', 'failed', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 3. TABELAS
-- ============================================================================

-- Categorias
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  display_order int default 0,
  created_at timestamptz not null default now()
);

-- Produtos
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  line text,
  description text,
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2),
  image_url text,
  images text[] default '{}',
  category_id uuid references public.categories(id) on delete set null,
  rating numeric(2,1) default 5.0,
  review_count int default 0,
  stock int default 100,
  badge text,
  featured boolean default false,
  active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(active);
create index if not exists idx_products_featured on public.products(featured);

-- Profiles (vinculado a auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  cpf text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User roles (separado para evitar privilege escalation)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Orders (pedidos)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status public.order_status not null default 'pending',
  -- Comprador
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  buyer_cpf text,
  -- Endereço de entrega (jsonb: {cep, street, number, complement, neighborhood, city, state})
  shipping_address jsonb not null,
  -- Valores
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  -- Stripe / pagamento (preenchido pelo webhook — NUNCA armazenamos número completo do cartão)
  stripe_session_id text,
  stripe_payment_intent text,
  card_last4 text,
  card_brand text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- ============================================================================
-- 4. FUNÇÃO has_role (SECURITY DEFINER — evita recursão de RLS)
-- ============================================================================
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- ============================================================================
-- 5. TRIGGER — cria profile automaticamente no signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'phone'
  );
  -- Toda nova conta recebe role 'user' por padrão
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 6. TRIGGER updated_at
-- ============================================================================
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.update_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.update_updated_at();

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.update_updated_at();

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Categories: leitura pública, escrita só admin
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all" on public.categories for select using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Products: leitura pública (apenas ativos para anônimos), escrita só admin
drop policy if exists "products_select_active" on public.products;
create policy "products_select_active" on public.products for select
  using (active = true or public.has_role(auth.uid(), 'admin'));

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Profiles: usuário vê/edita o próprio; admin vê todos
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select
  using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- User roles: usuário vê o próprio role; só admin escreve
drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own" on public.user_roles for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

drop policy if exists "user_roles_admin_write" on public.user_roles;
create policy "user_roles_admin_write" on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Orders: dono vê o próprio; admin vê tudo; qualquer um (logado ou não) pode criar (checkout guest)
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

drop policy if exists "orders_insert_anyone" on public.orders;
create policy "orders_insert_anyone" on public.orders for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders for update
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Order items: visível se o order pai é visível; insert junto com order
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items for select
  using (exists (
    select 1 from public.orders o where o.id = order_id
    and (o.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
  ));

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items for insert
  with check (exists (
    select 1 from public.orders o where o.id = order_id
    and (o.user_id = auth.uid() or o.user_id is null)
  ));

-- ============================================================================
-- 8. STORAGE BUCKET — product-images
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_write" on storage.objects;
create policy "product_images_admin_write" on storage.objects for all
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 9. SEED — CATEGORIAS
-- ============================================================================
insert into public.categories (name, slug, image_url, display_order) values
  ('Perfumaria', 'perfumaria', 'https://images.unsplash.com/photo-1594035910387-fbc370765ad8?w=400&h=400&fit=crop', 1),
  ('Corpo e Banho', 'corpo-e-banho', 'https://images.unsplash.com/photo-1570194065650-d99fb4ee3313?w=400&h=400&fit=crop', 2),
  ('Maquiagem', 'maquiagem', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop', 3),
  ('Cabelos', 'cabelos', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&h=400&fit=crop', 4),
  ('Skincare', 'skincare', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', 5),
  ('Masculino', 'masculino', 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=400&h=400&fit=crop', 6)
on conflict (slug) do nothing;

-- ============================================================================
-- 10. SEED — PRODUTOS FICTÍCIOS (~25)
-- Substitua pelo painel admin depois.
-- ============================================================================
do $$
declare
  cat_perf uuid; cat_corpo uuid; cat_make uuid; cat_cab uuid; cat_skin uuid; cat_masc uuid;
begin
  select id into cat_perf from public.categories where slug='perfumaria';
  select id into cat_corpo from public.categories where slug='corpo-e-banho';
  select id into cat_make from public.categories where slug='maquiagem';
  select id into cat_cab from public.categories where slug='cabelos';
  select id into cat_skin from public.categories where slug='skincare';
  select id into cat_masc from public.categories where slug='masculino';

  insert into public.products (name, slug, line, description, price, original_price, image_url, category_id, rating, review_count, badge, featured) values
  -- Perfumaria
  ('Colônia Floral Doce 90ml', 'colonia-floral-doce-90ml', 'Floral', 'Fragrância feminina envolvente com notas florais de jasmim e baunilha.', 139.90, 169.90, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop', cat_perf, 4.7, 1243, '17% OFF', true),
  ('Eau de Parfum Âmbar Noir 100ml', 'eau-de-parfum-ambar-noir-100ml', 'Noir', 'Perfume amadeirado intenso com âmbar, sândalo e baunilha.', 249.90, 299.90, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=600&fit=crop', cat_perf, 4.9, 856, 'NOVO', true),
  ('Body Splash Cítrico 200ml', 'body-splash-citrico-200ml', 'Splash', 'Body splash refrescante com bergamota e limão siciliano.', 59.90, null, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&h=600&fit=crop', cat_perf, 4.5, 432, null, true),
  ('Colônia Frutal Vibrant 100ml', 'colonia-frutal-vibrant-100ml', 'Vibrant', 'Fragrância jovem e divertida com pêssego e maracujá.', 119.90, 149.90, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=600&fit=crop', cat_perf, 4.6, 678, '20% OFF', false),

  -- Corpo e Banho
  ('Loção Hidratante Ameixa 400ml', 'locao-hidratante-ameixa-400ml', 'Nativa', 'Loção corporal de absorção rápida com extrato de ameixa.', 49.90, 59.90, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop', cat_corpo, 4.8, 2103, null, true),
  ('Sabonete Líquido Karité 250ml', 'sabonete-liquido-karite-250ml', 'Cuide-se', 'Sabonete cremoso com manteiga de karité que hidrata enquanto limpa.', 29.90, null, 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=600&fit=crop', cat_corpo, 4.7, 891, null, false),
  ('Óleo Corporal Relaxante 200ml', 'oleo-corporal-relaxante-200ml', 'Spa', 'Óleo aromático com lavanda e camomila para massagem relaxante.', 69.90, 89.90, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop', cat_corpo, 4.9, 1456, '22% OFF', true),
  ('Esfoliante Corporal Açúcar 250g', 'esfoliante-corporal-acucar-250g', 'Pure', 'Esfoliante natural com cristais de açúcar e óleo de coco.', 39.90, null, 'https://images.unsplash.com/photo-1570194065650-d99fb4ee3313?w=600&h=600&fit=crop', cat_corpo, 4.6, 567, null, false),

  -- Maquiagem
  ('Batom Matte Vermelho Intenso', 'batom-matte-vermelho-intenso', 'Make', 'Batom matte de longa duração com cor intensa e acabamento aveludado.', 39.90, 49.90, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop', cat_make, 4.7, 1890, '20% OFF', true),
  ('Base Líquida HD 30ml', 'base-liquida-hd-30ml', 'Pro', 'Base de alta cobertura com acabamento natural e proteção FPS 15.', 89.90, 109.90, 'https://images.unsplash.com/photo-1631214540242-3cd5915f6649?w=600&h=600&fit=crop', cat_make, 4.8, 2341, null, true),
  ('Máscara para Cílios Volume', 'mascara-cilios-volume', 'Eyes', 'Máscara que oferece até 8x mais volume sem borrar.', 49.90, null, 'https://images.unsplash.com/photo-1631214499150-8c9a7b6f4ad9?w=600&h=600&fit=crop', cat_make, 4.6, 987, null, false),
  ('Paleta de Sombras Nude 12 cores', 'paleta-sombras-nude-12-cores', 'Eyes', 'Paleta versátil com 12 tons nude perfeitos para qualquer ocasião.', 99.90, 129.90, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop', cat_make, 4.9, 1523, '23% OFF', true),
  ('Pó Compacto Natural', 'po-compacto-natural', 'Skin', 'Pó compacto que controla o brilho por até 8 horas.', 59.90, null, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop', cat_make, 4.5, 678, null, false),

  -- Cabelos
  ('Shampoo Hidratante Coco 300ml', 'shampoo-hidratante-coco-300ml', 'Care', 'Shampoo nutritivo com óleo de coco para cabelos secos.', 34.90, 42.90, 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&h=600&fit=crop', cat_cab, 4.7, 1234, null, false),
  ('Condicionador Reparador 300ml', 'condicionador-reparador-300ml', 'Care', 'Condicionador que repara cabelos danificados em 1 minuto.', 36.90, null, 'https://images.unsplash.com/photo-1626015449850-9d3d2df3a7d9?w=600&h=600&fit=crop', cat_cab, 4.8, 987, null, false),
  ('Máscara Capilar Intensiva 250g', 'mascara-capilar-intensiva-250g', 'Repair', 'Máscara de tratamento profundo para cabelos quimicamente tratados.', 79.90, 99.90, 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop', cat_cab, 4.9, 1567, '20% OFF', true),
  ('Óleo Capilar Brilho 60ml', 'oleo-capilar-brilho-60ml', 'Shine', 'Óleo finalizador que dá brilho intenso sem pesar.', 49.90, null, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&h=600&fit=crop', cat_cab, 4.6, 543, null, false),

  -- Skincare
  ('Sérum Vitamina C 30ml', 'serum-vitamina-c-30ml', 'Glow', 'Sérum antioxidante com vitamina C estabilizada que ilumina a pele.', 129.90, 159.90, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop', cat_skin, 4.9, 2345, '19% OFF', true),
  ('Hidratante Facial FPS 30 50ml', 'hidratante-facial-fps-30-50ml', 'Daily', 'Hidratante diário com proteção solar para todos os tipos de pele.', 79.90, null, 'https://images.unsplash.com/photo-1556228720-da4e85f4e5b1?w=600&h=600&fit=crop', cat_skin, 4.8, 1789, null, true),
  ('Água Micelar 200ml', 'agua-micelar-200ml', 'Clean', 'Removedor suave de maquiagem que limpa e hidrata em um único passo.', 39.90, 49.90, 'https://images.unsplash.com/photo-1556228841-7d1cabd4d3a9?w=600&h=600&fit=crop', cat_skin, 4.7, 1432, '20% OFF', false),
  ('Máscara Facial Argila 75g', 'mascara-facial-argila-75g', 'Detox', 'Máscara purificante de argila verde para pele oleosa.', 44.90, null, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop', cat_skin, 4.6, 678, null, false),

  -- Masculino
  ('Eau de Toilette Masculino 100ml', 'eau-toilette-masculino-100ml', 'Men', 'Fragrância marcante com notas amadeiradas e cítricas.', 169.90, 199.90, 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=600&h=600&fit=crop', cat_masc, 4.8, 1876, '15% OFF', true),
  ('Pós-Barba Calmante 100ml', 'pos-barba-calmante-100ml', 'Men', 'Bálsamo pós-barba que acalma e hidrata a pele sensibilizada.', 49.90, null, 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&h=600&fit=crop', cat_masc, 4.7, 654, null, false),
  ('Shampoo 3 em 1 Masculino 250ml', 'shampoo-3-em-1-masculino-250ml', 'Men', 'Shampoo, condicionador e gel de banho em um só produto.', 34.90, null, 'https://images.unsplash.com/photo-1626015449850-9d3d2df3a7d9?w=600&h=600&fit=crop', cat_masc, 4.5, 432, null, false),
  ('Desodorante Aerosol Masculino 150ml', 'desodorante-aerosol-masculino-150ml', 'Men', 'Proteção 48h com fragrância amadeirada e refrescante.', 19.90, 24.90, 'https://images.unsplash.com/photo-1585239928715-90e1b1d24f48?w=600&h=600&fit=crop', cat_masc, 4.6, 891, '20% OFF', false)
  on conflict (slug) do nothing;
end $$;

-- ============================================================================
-- 11. COMO VIRAR ADMIN
-- ============================================================================
-- Depois de se cadastrar pelo site, rode este comando substituindo o email:
--
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = 'seu@email.com'
--   on conflict (user_id, role) do nothing;
--
-- ============================================================================
-- FIM
-- ============================================================================
