# 🗄️ Configuração do Storage - Upload de Avatares

## ⚠️ IMPORTANTE: Execute estes passos antes de usar o upload de imagens

### Passo 1: Criar o Bucket 'avatars'

1. Acesse o **Supabase Dashboard**: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**
4. Clique no botão **"New bucket"** ou **"Create bucket"**
5. Preencha os dados:
   - **Name:** `avatars` (exatamente assim, em minúsculas)
   - **Public bucket:** ✅ **Marque como PÚBLICO** (necessário para exibir avatares)
   - **File size limit:** 5 MB (ou deixe o padrão)
   - **Allowed MIME types:** Deixe vazio ou adicione `image/*`
6. Clique em **"Create bucket"**

### Passo 2: Configurar Políticas RLS

1. Ainda no Supabase Dashboard, vá em **SQL Editor**
2. Abra o arquivo `supabase/storage_policies.sql` do projeto
3. **Copie todo o conteúdo** do arquivo
4. **Cole no SQL Editor** do Supabase
5. Clique em **"Run"** ou **"Execute"** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)

### Passo 3: Verificar se Funcionou

Após executar o SQL, você pode verificar se as políticas foram criadas:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

Você deve ver 4 políticas listadas:
- ✅ Authenticated users can upload avatars
- ✅ Authenticated users can update avatars
- ✅ Public can read avatars
- ✅ Authenticated users can delete avatars

## ✅ Pronto!

Agora você pode fazer upload de avatares. Teste fazendo upload de uma imagem no modal de adicionar/editar membro da família.

## 🔍 Troubleshooting

### Erro: "Bucket not found"
- ✅ Verifique se o bucket foi criado com o nome exato: `avatars` (minúsculas)
- ✅ Verifique se está no projeto correto do Supabase

### Erro: "new row violates row-level security"
- ✅ Execute o arquivo `storage_policies.sql` no SQL Editor
- ✅ Verifique se as políticas foram criadas (use a query de verificação acima)

### Erro: "403 Forbidden" ou "Permission denied"
- ✅ Verifique se o bucket está marcado como **público**
- ✅ Verifique se você está autenticado no sistema
- ✅ Execute novamente o `storage_policies.sql`

### Imagem não aparece após upload
- ✅ Verifique se a URL foi salva no banco de dados
- ✅ Abra a URL da imagem diretamente no navegador para testar
- ✅ Verifique os logs do console para mais detalhes
