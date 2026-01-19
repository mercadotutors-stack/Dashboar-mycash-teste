# 🔧 Configuração de Variáveis de Ambiente na Vercel

## ⚠️ Problema

O erro "usuário não inicializado" na Vercel acontece porque **as variáveis de ambiente não estão configuradas** no painel da Vercel.

## ✅ Solução: Configurar Variáveis na Vercel

### Passo 1: Acessar o Painel da Vercel

1. Acesse https://vercel.com/dashboard
2. Selecione seu projeto (Dashboard-Mycash+)

### Passo 2: Adicionar Variáveis de Ambiente

1. Vá em **Settings** (Configurações)
2. Clique em **Environment Variables** (Variáveis de Ambiente)
3. Adicione as seguintes variáveis:

#### Variável 1:
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://mopbdcwogwkeljpmgcrf.supabase.co`
- **Environment:** Selecione todas (Production, Preview, Development)

#### Variável 2:
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcGJkY3dvZ3drZWxqcG1nY3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjI3MzYsImV4cCI6MjA4NDMzODczNn0.hp48438XNwdm_lcDzVkY0yPS83zqBcNQI3qHqwVgPAI`
- **Environment:** Selecione todas (Production, Preview, Development)

### Passo 3: Salvar e Fazer Redeploy

1. Clique em **Save** para salvar as variáveis
2. Vá em **Deployments**
3. Clique nos **3 pontos (...)** do último deployment
4. Selecione **Redeploy**
5. Marque **Use existing Build Cache** como opcional
6. Clique em **Redeploy**

## 🔍 Verificação

Após o redeploy, verifique:

1. Abra o console do navegador na aplicação da Vercel (F12)
2. Procure por:
   - `🔍 Buscando usuário existente...`
   - `✅ Usuário encontrado` ou `✅ Usuário criado com sucesso`

Se aparecer `❌ Variáveis de ambiente do Supabase não configuradas`, as variáveis não foram configuradas corretamente.

## ⚠️ Importante

- As variáveis **DEVEM** começar com `VITE_` para serem expostas no build do Vite
- Depois de adicionar as variáveis, **SEMPRE faça um redeploy** para que tenham efeito
- As variáveis são diferentes entre ambientes (Production, Preview, Development)

## ✅ Após Configurar

A aplicação deve funcionar corretamente e você conseguirá:
- ✅ Adicionar membros da família
- ✅ Criar transações
- ✅ Adicionar categorias
- ✅ Criar contas/cartões
