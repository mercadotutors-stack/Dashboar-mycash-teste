/**
 * Utilitários para formatação de valores monetários
 */

/**
 * Formata um número como moeda brasileira
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como "R$ 1.234,56"
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formata um valor monetário de forma compacta para gráficos
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como "R$ 2,5k" ou "R$ 1,2M"
 * @example
 * formatCompactCurrency(2500) // "R$ 2,5k"
 * formatCompactCurrency(1200000) // "R$ 1,2M"
 */
export function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1).replace('.', ',')}M`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}k`
  }
  return formatCurrency(value)
}

/**
 * Converte string de input do usuário em número limpo
 * Remove "R$", pontos de milhar e troca vírgula por ponto
 * @param input - String de input do usuário
 * @returns Número limpo ou 0 se inválido
 * @example
 * parseCurrencyInput("R$ 1.234,56") // 1234.56
 * parseCurrencyInput("1.234,56") // 1234.56
 */
export function parseCurrencyInput(input: string): number {
  if (!input || typeof input !== 'string') return 0

  // Remove R$, espaços e pontos de milhar
  let cleaned = input.replace(/R\$\s*/g, '').replace(/\./g, '').trim()

  // Troca vírgula por ponto
  cleaned = cleaned.replace(',', '.')

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}
