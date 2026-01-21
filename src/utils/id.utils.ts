/**
 * Utilitários para geração de IDs únicos
 */

/**
 * Gera um ID único usando crypto.randomUUID ou fallback
 * @returns String com ID único
 * @example
 * generateUniqueId() // "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateUniqueId(): string {
  // Usa crypto.randomUUID se disponível (navegadores modernos)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback para navegadores mais antigos
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${Math.random().toString(36).substring(2, 9)}`
}
