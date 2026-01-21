import { format, formatDistanceToNow, isToday, isYesterday, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Utilitários para formatação de datas
 */

/**
 * Formata uma data como "DD/MM/AAAA"
 * @param date - Data a ser formatada
 * @returns String formatada como "15/01/2024"
 * @example
 * formatDate(new Date(2024, 0, 15)) // "15/01/2024"
 */
export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: ptBR })
}

/**
 * Formata uma data em formato extenso
 * @param date - Data a ser formatada
 * @returns String formatada como "15 de Janeiro de 2024"
 * @example
 * formatDateLong(new Date(2024, 0, 15)) // "15 de Janeiro de 2024"
 */
export function formatDateLong(date: Date): string {
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

/**
 * Formata um intervalo de datas
 * @param startDate - Data inicial
 * @param endDate - Data final (pode ser null)
 * @returns String formatada como "01 jan - 31 jan, 2024"
 * @example
 * formatDateRange(new Date(2024, 0, 1), new Date(2024, 0, 31)) // "01 jan - 31 jan, 2024"
 */
export function formatDateRange(startDate: Date, endDate: Date | null): string {
  if (!endDate) {
    return format(startDate, 'dd LLL', { locale: ptBR })
  }

  const start = format(startDate, 'dd LLL', { locale: ptBR })
  const end = format(endDate, 'dd LLL', { locale: ptBR })
  const year = format(endDate, 'yyyy', { locale: ptBR })

  // Se as datas estão no mesmo ano, mostra apenas uma vez
  if (format(startDate, 'yyyy') === year) {
    return `${start} - ${end}, ${year}`
  }

  return `${format(startDate, 'dd LLL yyyy', { locale: ptBR })} - ${format(endDate, 'dd LLL yyyy', { locale: ptBR })}`
}

/**
 * Formata uma data de forma relativa
 * @param date - Data a ser formatada
 * @returns String formatada como "Hoje", "Ontem", "Há 3 dias"
 * @example
 * formatRelativeDate(new Date()) // "Hoje"
 * formatRelativeDate(subDays(new Date(), 1)) // "Ontem"
 */
export function formatRelativeDate(date: Date): string {
  if (isToday(date)) {
    return 'Hoje'
  }

  if (isYesterday(date)) {
    return 'Ontem'
  }

  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
}
