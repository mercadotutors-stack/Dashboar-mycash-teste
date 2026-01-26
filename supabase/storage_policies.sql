-- ============ STORAGE POLICIES - AVATARS BUCKET ============
-- Execute este arquivo no Supabase SQL Editor após criar o bucket 'avatars'
-- 
-- IMPORTANTE: 
-- 1. Crie o bucket 'avatars' no Supabase Dashboard > Storage
-- 2. Configure o bucket como público (para leitura direta das imagens)
-- 3. Execute este script para configurar as políticas RLS

-- ============ REMOVE POLÍTICAS ANTIGAS (se existirem) ============
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;

-- ============ POLÍTICAS PARA BUCKET AVATARS ============

-- 1. PERMITIR UPLOAD: Qualquer usuário autenticado pode fazer upload no bucket avatars
-- A estrutura de pastas é: {userId}/{memberId || 'general'}/{timestamp}.{ext}
-- Permite upload em qualquer pasta dentro do bucket avatars
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

-- ============ VERIFICAÇÃO ============
-- Execute esta query para verificar se as políticas foram criadas:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
