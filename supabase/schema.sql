-- Supabase schema for mycash+ v2.0
-- Run this in Supabase SQL editor before wiring the app.
-- Note: RLS here é permissiva (USING true, CHECK true) conforme solicitado.

-- ============ EXTENSIONS ============
create extension if not exists "uuid-ossp";

-- ============ ENUMS ============
create type transaction_type as enum ('INCOME','EXPENSE');
create type account_type as enum ('CHECKING','SAVINGS','CREDIT_CARD');
create type recurrence_frequency as enum ('DAILY','WEEKLY','MONTHLY','YEARLY');
create type transaction_status as enum ('PENDING','COMPLETED');

-- ============ TABLES ============
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists family_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  role text not null,
  email text,
  avatar_url text,
  monthly_income numeric(12,2) not null default 0,
  color text not null default '#3247FF',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_family_members_user on family_members(user_id);

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  icon text not null default '📌',
  type transaction_type not null,
  color text not null default '#3247FF',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_categories_user_type on categories(user_id, type);

create table if not exists accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type account_type not null,
  name text not null,
  bank text not null,
  last_digits text,
  holder_id uuid not null references family_members(id),
  balance numeric(12,2) not null default 0,
  credit_limit numeric(12,2),
  current_bill numeric(12,2) not null default 0,
  due_day int,
  closing_day int,
  theme text default 'black',
  logo_url text,
  color text not null default '#3247FF',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_accounts_user_type on accounts(user_id, type);
create index if not exists idx_accounts_holder on accounts(holder_id);

create table if not exists recurring_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type transaction_type not null default 'EXPENSE',
  amount numeric(12,2) not null,
  description text not null,
  category_id uuid references categories(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  member_id uuid references family_members(id) on delete set null,
  frequency recurrence_frequency not null,
  day_of_month int,
  day_of_week int,
  start_date date not null,
  end_date date,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_recurring_user_active on recurring_transactions(user_id, is_active);
create index if not exists idx_recurring_category on recurring_transactions(category_id);
create index if not exists idx_recurring_account on recurring_transactions(account_id);

create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type transaction_type not null,
  amount numeric(12,2) not null,
  description text not null,
  date date not null,
  category_id uuid references categories(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  member_id uuid references family_members(id) on delete set null,
  installment_number int,
  total_installments int not null default 1,
  parent_transaction_id uuid references transactions(id) on delete cascade,
  is_recurring boolean not null default false,
  recurring_transaction_id uuid references recurring_transactions(id) on delete set null,
  status transaction_status not null default 'COMPLETED',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tx_user_date on transactions(user_id, date);
create index if not exists idx_tx_category on transactions(category_id);
create index if not exists idx_tx_account on transactions(account_id);
create index if not exists idx_tx_member on transactions(member_id);
create index if not exists idx_tx_parent on transactions(parent_transaction_id);
create index if not exists idx_tx_recurring on transactions(recurring_transaction_id);
create index if not exists idx_tx_status on transactions(status);

-- ============ RLS (permissiva) ============
alter table users enable row level security;
alter table family_members enable row level security;
alter table categories enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table recurring_transactions enable row level security;

-- Remove políticas antigas antes de criar novas
do $$
declare t text;
begin
  for t in select unnest(array[
    'users','family_members','categories','accounts','transactions','recurring_transactions'
  ]) loop
    execute format('drop policy if exists "public_all_%s" on %I;', t, t);
  end loop;
end$$;

-- Cria políticas RLS permissivas
create policy "public_all_users" on users
  for all using (true) with check (true);

create policy "public_all_family_members" on family_members
  for all using (true) with check (true);

create policy "public_all_categories" on categories
  for all using (true) with check (true);

create policy "public_all_accounts" on accounts
  for all using (true) with check (true);

create policy "public_all_transactions" on transactions
  for all using (true) with check (true);

create policy "public_all_recurring_transactions" on recurring_transactions
  for all using (true) with check (true);

-- ============ RPC helpers ============
-- Cria transação (valida recorrência x parcelas)
create or replace function create_transaction(
  p_user_id uuid,
  p_type transaction_type,
  p_amount numeric,
  p_description text,
  p_date date,
  p_category_id uuid,
  p_account_id uuid,
  p_member_id uuid,
  p_total_installments int,
  p_installment_number int,
  p_is_recurring boolean,
  p_recurring_transaction_id uuid,
  p_status transaction_status,
  p_notes text
) returns uuid as $$
declare v_id uuid := uuid_generate_v4();
begin
  if p_is_recurring and p_total_installments > 1 then
    raise exception 'Recorrente não pode ser parcelado';
  end if;

  insert into transactions(
    id, user_id, type, amount, description, date, category_id, account_id, member_id,
    total_installments, installment_number, is_recurring, recurring_transaction_id, status, notes
  ) values (
    v_id, p_user_id, p_type, p_amount, p_description, p_date, p_category_id, p_account_id, p_member_id,
    coalesce(p_total_installments,1), p_installment_number, coalesce(p_is_recurring,false),
    p_recurring_transaction_id, coalesce(p_status,'COMPLETED'), p_notes
  );
  return v_id;
end;
$$ language plpgsql security definer;

-- Categorias: create/update/delete simples
create or replace function create_category(
  p_user_id uuid,
  p_name text,
  p_icon text,
  p_type transaction_type,
  p_color text
) returns uuid as $$
declare v_id uuid := uuid_generate_v4();
begin
  insert into categories(id,user_id,name,icon,type,color)
  values (v_id,p_user_id,p_name,p_icon,p_type,p_color);
  return v_id;
end;
$$ language plpgsql security definer;

create or replace function update_category(
  p_id uuid,
  p_name text,
  p_icon text,
  p_color text,
  p_is_active boolean
) returns void as $$
begin
  update categories
     set name=p_name,
         icon=p_icon,
         color=p_color,
         is_active=p_is_active,
         updated_at=now()
   where id=p_id;
end;
$$ language plpgsql security definer;

create or replace function delete_category(p_id uuid) returns void as $$
begin
  delete from categories where id=p_id;
end;
$$ language plpgsql security definer;

-- Trigger opcional: atualizar current_bill de cartões ao inserir despesa
create or replace function update_card_bill_on_tx() returns trigger as $$
begin
  if new.account_id is not null and new.type = 'EXPENSE' then
    update accounts
       set current_bill = current_bill + new.amount
     where id = new.account_id and type = 'CREDIT_CARD';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_tx_insert_card_bill on transactions;
create trigger trg_tx_insert_card_bill
after insert on transactions
for each row execute function update_card_bill_on_tx();

-- ============ STORAGE ============
-- Crie via painel os buckets:
--  avatars (público se desejar)
--  cards-logos
--  uploads
-- Ajuste policies conforme necessidade; aqui mantemos permissivo:
-- Nota: policies de storage são geridas separadamente no Supabase.
