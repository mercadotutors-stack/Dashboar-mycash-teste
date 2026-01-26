# Schema Supabase - mycash+

## 📋 Instruções de Aplicação

### Cenário 1: Primeira vez (não há tabelas criadas)
Execute o arquivo `schema.sql` completo no editor SQL do Supabase:
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo de `schema.sql`
4. Execute

### Cenário 2: Tabelas já existem (apenas corrigir políticas RLS)
Execute apenas o arquivo `schema_fixed.sql`:
1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo de `schema_fixed.sql`
4. Execute

### Cenário 3: Configurar Storage para Upload de Avatares
**✅ AUTOMÁTICO:** O bucket e políticas já foram criados via migration!

Se precisar recriar manualmente, execute `create_avatars_bucket.sql` no SQL Editor:
- Cria o bucket 'avatars' automaticamente
- Configura como público
- Aplica todas as políticas RLS necessárias
- Tudo em um único script!

## 🔒 Políticas RLS

### Tabelas do Banco de Dados
Todas as tabelas têm políticas RLS **permissivas** (`USING (true) WITH CHECK (true)`) que permitem:
- ✅ SELECT (leitura)
- ✅ INSERT (criação)
- ✅ UPDATE (atualização)
- ✅ DELETE (exclusão)

**Tabelas com políticas:**
- `users`
- `family_members`
- `categories`
- `accounts`
- `transactions`
- `recurring_transactions`

### Storage (Bucket Avatars)
O bucket `avatars` tem políticas que permitem:
- ✅ **Upload:** Qualquer usuário autenticado pode fazer upload
- ✅ **Update:** Qualquer usuário autenticado pode atualizar arquivos
- ✅ **Delete:** Qualquer usuário autenticado pode deletar arquivos
- ✅ **Read:** Leitura pública (qualquer pessoa pode visualizar)

**Arquivo:** `storage_policies.sql`

## ⚠️ Importante

Se você receber erros ao executar, verifique:
1. Se as tabelas existem (execute `schema.sql` primeiro se necessário)
2. Se RLS está habilitado nas tabelas
3. Se as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas
4. Se o bucket 'avatars' foi criado antes de executar `storage_policies.sql`
