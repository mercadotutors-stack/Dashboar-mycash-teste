import { supabase } from './supabaseClient'

/**
 * Faz upload de uma imagem para o Supabase Storage
 * 
 * ## Configuração Necessária no Supabase
 * 
 * ### 1. Criar o bucket 'avatars'
 * - Acesse o Supabase Dashboard > Storage
 * - Crie um novo bucket chamado exatamente 'avatars'
 * - Configure como público (para acesso direto às imagens)
 * 
 * ### 2. Políticas RLS (Row Level Security)
 * 
 * **IMPORTANTE:** Execute o arquivo `supabase/storage_policies.sql` no Supabase SQL Editor.
 * 
 * As políticas configuradas permitem:
 * - ✅ Qualquer usuário autenticado pode fazer upload no bucket avatars
 * - ✅ Qualquer usuário autenticado pode atualizar arquivos no bucket avatars
 * - ✅ Qualquer usuário autenticado pode deletar arquivos no bucket avatars
 * - ✅ Leitura pública (qualquer pessoa pode visualizar avatares)
 * 
 * **Arquivo SQL:** `supabase/storage_policies.sql`
 * 
 * Execute no Supabase SQL Editor após criar o bucket 'avatars'.
 * 
 * ### 3. Estrutura de Pastas
 * O upload cria automaticamente a estrutura:
 * ```
 * avatars/
 *   └── {userId}/
 *       ├── general/          (avatar geral do usuário)
 *       └── {memberId}/       (avatar específico de membro)
 * ```
 * 
 * ### 4. Limitações de Segurança
 * - ✅ Validação de tipo de arquivo (apenas imagens)
 * - ✅ Limite de tamanho: 5MB máximo
 * - ✅ RLS garante que usuários só podem modificar seus próprios arquivos
 * - ⚠️ O bucket é público para leitura (necessário para exibir avatares sem autenticação)
 * - ⚠️ URLs públicas não expiram - considere usar signed URLs em produção para maior segurança
 * 
 * @param file Arquivo de imagem a ser enviado
 * @param userId ID do usuário autenticado (para organização e segurança)
 * @param memberId ID do membro (opcional, para avatares específicos de membros da família)
 * @returns URL pública da imagem ou null em caso de erro
 * 
 * @example
 * ```ts
 * const file = event.target.files[0]
 * const url = await uploadImage(file, user.id, memberId)
 * if (url) {
 *   // URL pública disponível: url
 * } else {
 *   // Erro no upload
 * }
 * ```
 */
export async function uploadImage(
  file: File,
  userId: string,
  memberId?: string
): Promise<string | null> {
  try {
    // Validação do arquivo
    if (!file.type.startsWith('image/')) {
      throw new Error('Arquivo deve ser uma imagem')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Arquivo deve ter no máximo 5MB')
    }

    // Gera nome único para o arquivo
    // Estrutura: {userId}/{memberId || 'general'}/{timestamp}.{ext}
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${memberId || 'general'}/${Date.now()}.${fileExt}`
    const filePath = fileName

    // Faz upload para o bucket 'avatars'
    // A política RLS garante que apenas o usuário autenticado pode fazer upload
    // em pastas que começam com seu próprio userId
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Permite sobrescrever se já existir (útil para atualizar avatar)
      })

    if (error) {
      console.error('Erro ao fazer upload:', error)
      // Se o erro for sobre bucket não encontrado, fornece mensagem mais clara
      if (error.message?.includes('Bucket') || error.message?.includes('not found')) {
        throw new Error(
          'Bucket "avatars" não encontrado. Crie o bucket no Supabase Storage primeiro e configure as políticas RLS conforme documentação.'
        )
      }
      throw error
    }

    // Obtém URL pública da imagem
    // Como o bucket é público, esta URL pode ser usada diretamente
    // Em produção, considere usar signed URLs para maior segurança
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      throw new Error('Não foi possível obter a URL pública da imagem')
    }

    return urlData.publicUrl
  } catch (error) {
    console.error('Erro no upload de imagem:', error)
    // Retorna null para que o componente possa tratar o erro
    return null
  }
}
