-- ============ CRIAÇÃO AUTOMÁTICA DO BUCKET AVATARS ============
-- Execute este arquivo no Supabase SQL Editor para criar o bucket automaticamente
-- 
-- Este script:
-- 1. Cria o bucket 'avatars' se não existir
-- 2. Configura como público
-- 3. Aplica todas as políticas RLS necessárias

-- ============ 1. CRIAR BUCKET ============
-- Remove o bucket se já existir (para recriar com configurações corretas)
DELETE FROM storage.buckets WHERE id = 'avatars';

-- Cria o bucket 'avatars' como público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Público para leitura direta
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] -- Tipos MIME permitidos
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- ============ 2. REMOVER POLÍTICAS ANTIGAS (se existirem) ============
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;

-- ============ 3. CRIAR POLÍTICAS RLS ============

-- 1. PERMITIR UPLOAD: Qualquer usuário autenticado pode fazer upload no bucket avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
);

-- 2. PERMITIR UPDATE: Qualquer usuário autenticado pode atualizar arquivos no bucket avatars
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
)
WITH CHECK (
  bucket_id = 'avatars'
);

-- 3. PERMITIR LEITURA PÚBLICA: Qualquer pessoa pode ler arquivos do bucket avatars
-- (necessário para exibir avatares sem autenticação)
CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'avatars'
);

-- 4. PERMITIR DELETE: Qualquer usuário autenticado pode deletar arquivos no bucket avatars
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
);

-- ============ 4. VERIFICAÇÃO ============
-- Verifica se o bucket foi criado
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    RAISE NOTICE '✅ Bucket "avatars" criado com sucesso!';
  ELSE
    RAISE EXCEPTION '❌ Erro: Bucket "avatars" não foi criado';
  END IF;
END $$;

-- Verifica se as políticas foram criadas
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND policyname LIKE '%avatars%';
  
  IF policy_count >= 4 THEN
    RAISE NOTICE '✅ % políticas RLS criadas com sucesso!', policy_count;
  ELSE
    RAISE WARNING '⚠️ Apenas % políticas foram criadas. Esperado: 4', policy_count;
  END IF;
END $$;

-- ============ SUCESSO ============
-- Se você chegou aqui sem erros, o bucket e as políticas foram configurados corretamente!
-- Agora você pode fazer upload de avatares no sistema.
