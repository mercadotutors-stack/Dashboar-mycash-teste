/**
 * Utilitários para cálculos financeiros
 */

/**
 * Calcula percentual de um valor parcial em relação ao total
 * @param partial - Valor parcial
 * @param total - Valor total
 * @returns Percentual com uma casa decimal, ou 0 se total for zero
 * @example
 * calculatePercentage(25, 100) // 25.0
 * calculatePercentage(33.33, 100) // 33.3
 */
export function calculatePercentage(partial: number, total: number): number {
  if (total === 0) return 0
  return Math.round((partial / total) * 1000) / 10 // Uma casa decimal
}

/**
 * Calcula diferença entre dois valores
 * @param current - Valor atual
 * @param previous - Valor anterior
 * @returns Objeto com diferença absoluta e percentual de variação
 * @example
 * calculateDifference(150, 100) // { absolute: 50, percentage: 50.0 }
 * calculateDifference(100, 150) // { absolute: -50, percentage: -33.3 }
 */
export function calculateDifference(
  current: number,
  previous: number
): { absolute: number; percentage: number } {
  const absolute = current - previous
  const percentage = calculatePercentage(absolute, previous)
  return { absolute, percentage }
}

/**
 * Calcula valor de cada parcela
 * @param totalValue - Valor total
 * @param installments - Número de parcelas
 * @returns Valor de cada parcela arredondado para duas casas decimais
 * @example
 * calculateInstallmentValue(1000, 3) // 333.33
 */
export function calculateInstallmentValue(totalValue: number, installments: number): number {
  if (installments <= 0) return totalValue
  return Math.round((totalValue / installments) * 100) / 100
}
