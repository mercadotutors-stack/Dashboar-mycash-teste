import type { Transaction } from '../types'

/**
 * Utilitários para manipulação de arrays e objetos
 */

/**
 * Agrupa transações por categoria e soma os valores
 * @param transactions - Array de transações
 * @returns Objeto com categorias como chaves e valores somados
 * @example
 * groupByCategory([{category: "Alimentação", amount: 100}, {category: "Alimentação", amount: 50}])
 * // { "Alimentação": 150 }
 */
export function groupByCategory(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Sem categoria'
    acc[category] = (acc[category] || 0) + transaction.amount
    return acc
  }, {} as Record<string, number>)
}

/**
 * Filtra transações por intervalo de datas
 * @param transactions - Array de transações
 * @param startDate - Data inicial do intervalo
 * @param endDate - Data final do intervalo
 * @returns Array filtrado de transações dentro do intervalo
 * @example
 * filterByDateRange(transactions, new Date(2024, 0, 1), new Date(2024, 0, 31))
 */
export function filterByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter((transaction) => {
    const txDate = transaction.date.getTime()
    const start = startDate.getTime()
    const end = endDate.getTime()
    return txDate >= start && txDate <= end
  })
}

/**
 * Ordena transações por data
 * @param transactions - Array de transações
 * @param order - Ordem de classificação ('asc' ou 'desc')
 * @returns Array ordenado de transações
 * @example
 * sortByDate(transactions, 'desc') // Mais recentes primeiro
 */
export function sortByDate(transactions: Transaction[], order: 'asc' | 'desc' = 'desc'): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateA = a.date.getTime()
    const dateB = b.date.getTime()
    return order === 'asc' ? dateA - dateB : dateB - dateA
  })
}
