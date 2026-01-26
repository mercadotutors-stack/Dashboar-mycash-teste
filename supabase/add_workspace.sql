-- Cria tabela de workspaces e associa todos os dados existentes ao workspace padrão "Família Torso"
-- Workspace ID determinístico para fallback seguro
-- Rodar apenas uma vez; idempotente

do $$
declare
  v_default_workspace uuid := '00000000-0000-4000-8000-000000000001';
  v_owner uuid;
begin
  -- Owner padrão: primeiro usuário existente
  select id into v_owner from users order by created_at limit 1;
  if v_owner is null then
    raise exception 'Nenhum usuário encontrado para ser owner do workspace padrão';
  end if;

  -- Tabela de workspaces
  create table if not exists workspaces (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    type text not null default 'family',
    owner_id uuid not null references users(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  -- Policy permissiva (mantém o padrão atual)
  alter table workspaces enable row level security;
  drop policy if exists "public_all_workspaces" on workspaces;
  create policy "public_all_workspaces" on workspaces for all using (true) with check (true);

  -- Workspace padrão
  insert into workspaces (id, name, type, owner_id)
  values (v_default_workspace, 'Família Torso', 'family', v_owner)
  on conflict (id) do nothing;

  -- Adiciona workspace_id nas tabelas principais
  alter table if not exists family_members add column if not exists workspace_id uuid references workspaces(id);
  alter table if not exists categories add column if not exists workspace_id uuid references workspaces(id);
  alter table if not exists accounts add column if not exists workspace_id uuid references workspaces(id);
  alter table if not exists transactions add column if not exists workspace_id uuid references workspaces(id);
  alter table if not exists recurring_transactions add column if not exists workspace_id uuid references workspaces(id);

  -- Garante índice para filtro
  create index if not exists idx_family_members_workspace on family_members(workspace_id);
  create index if not exists idx_categories_workspace on categories(workspace_id);
  create index if not exists idx_accounts_workspace on accounts(workspace_id);
  create index if not exists idx_transactions_workspace on transactions(workspace_id);
  create index if not exists idx_recurring_workspace on recurring_transactions(workspace_id);

  -- Preenche workspace_id faltante com o padrão
  update family_members set workspace_id = v_default_workspace where workspace_id is null;
  update categories set workspace_id = v_default_workspace where workspace_id is null;
  update accounts set workspace_id = v_default_workspace where workspace_id is null;
  update transactions set workspace_id = v_default_workspace where workspace_id is null;
  update recurring_transactions set workspace_id = v_default_workspace where workspace_id is null;
end $$;
