/**
 * Utilitários para validação de dados
 */

/**
 * Valida formato de email
 * @param email - Email a ser validado
 * @returns true se o email é válido
 * @example
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid") // false
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida estrutura de CPF brasileiro (apenas formato, sem consulta online)
 * @param cpf - CPF a ser validado
 * @returns true se o CPF tem estrutura válida
 * @example
 * isValidCPF("123.456.789-09") // true (estrutura válida)
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/[^\d]/g, '')

  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleaned)) return false

  // Validação dos dígitos verificadores
  let sum = 0
  let remainder

  // Valida primeiro dígito
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false

  // Valida segundo dígito
  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false

  return true
}

/**
 * Verifica se uma data é válida e não é futura (quando aplicável)
 * @param date - Data a ser validada
 * @param allowFuture - Se permite datas futuras (padrão: false)
 * @returns true se a data é válida
 * @example
 * isValidDate(new Date(2024, 0, 15), false) // true
 * isValidDate(new Date(2025, 0, 15), false) // false (futura)
 */
export function isValidDate(date: Date, allowFuture: boolean = false): boolean {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return false
  }

  if (!allowFuture && date > new Date()) {
    return false
  }

  return true
}

/**
 * Verifica se um valor é número positivo maior que zero
 * @param value - Valor a ser validado
 * @returns true se o valor é positivo e maior que zero
 * @example
 * isPositiveNumber(100) // true
 * isPositiveNumber(0) // false
 * isPositiveNumber(-10) // false
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0 && isFinite(value)
}
