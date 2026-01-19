import { supabase } from './supabaseClient'

/**
 * Faz upload de uma imagem para o Supabase Storage
 * 
 * IMPORTANTE: Você precisa criar um bucket chamado 'avatars' no Supabase Storage:
 * 1. Acesse o Supabase Dashboard > Storage
 * 2. Crie um novo bucket chamado 'avatars'
 * 3. Configure as políticas RLS (Row Level Security) para permitir uploads autenticados
 * 
 * @param file Arquivo de imagem a ser enviado
 * @param userId ID do usuário (para organização)
 * @param memberId ID do membro (opcional, para avatares de membros)
 * @returns URL pública da imagem ou null em caso de erro
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
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${memberId || 'general'}/${Date.now()}.${fileExt}`
    const filePath = fileName

    // Faz upload para o bucket 'avatars'
    // Se o bucket não existir, você verá um erro no console
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Permite sobrescrever se já existir
      })

    if (error) {
      console.error('Erro ao fazer upload:', error)
      // Se o erro for sobre bucket não encontrado, fornece mensagem mais clara
      if (error.message?.includes('Bucket') || error.message?.includes('not found')) {
        throw new Error('Bucket "avatars" não encontrado. Crie o bucket no Supabase Storage primeiro.')
      }
      throw error
    }

    // Obtém URL pública da imagem
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
