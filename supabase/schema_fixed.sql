-- Supabase schema para mycash+ v2.0 - CORRIGIDO
-- Execute este SQL no editor SQL do Supabase para corrigir políticas RLS
-- Este script remove políticas antigas e cria novas com permissões corretas

-- ============ REMOVER POLÍTICAS ANTIGAS ============
do $$
declare t text;
begin
  for t in select unnest(array[
    'users','family_members','categories','accounts','transactions','recurring_transactions'
  ]) loop
    execute format('drop policy if exists "public_all_%s" on %I;', t, t);
  end loop;
end$$;

-- ============ CRIAR POLÍTICAS RLS PERMISSIVAS ============
-- Política para users (permitir tudo)
create policy "public_all_users" on users
  for all
  using (true)
  with check (true);

-- Política para family_members (permitir tudo)
create policy "public_all_family_members" on family_members
  for all
  using (true)
  with check (true);

-- Política para categories (permitir tudo)
create policy "public_all_categories" on categories
  for all
  using (true)
  with check (true);

-- Política para accounts (permitir tudo)
create policy "public_all_accounts" on accounts
  for all
  using (true)
  with check (true);

-- Política para transactions (permitir tudo)
create policy "public_all_transactions" on transactions
  for all
  using (true)
  with check (true);

-- Política para recurring_transactions (permitir tudo)
create policy "public_all_recurring_transactions" on recurring_transactions
  for all
  using (true)
  with check (true);

-- ============ VERIFICAR SE RLS ESTÁ HABILITADO ============
alter table users enable row level security;
alter table family_members enable row level security;
alter table categories enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table recurring_transactions enable row level security;

-- ============ VERIFICAR TABELAS ============
-- Se alguma tabela não existir, o schema original deve ser executado primeiro
-- Este script apenas corrige as políticas RLS
