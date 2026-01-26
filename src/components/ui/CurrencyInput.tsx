import { useState, useEffect, useRef, type ChangeEvent, type FocusEvent } from 'react'

interface CurrencyInputProps {
  value: number | string
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  min?: number
  disabled?: boolean
  error?: boolean
}

/**
 * Componente de input com máscara monetária BRL (formato: 1.000.000,00)
 * 
 * LÓGICA: O usuário digita apenas números, cada dígito representa centavos
 * - 1 → R$ 0,01
 * - 10 → R$ 0,10
 * - 100 → R$ 1,00
 * - 1000 → R$ 10,00
 * - 123456 → R$ 1.234,56
 * 
 * O valor interno é armazenado em reais (number), não em centavos
 */
export function CurrencyInput({
  value,
  onChange,
  placeholder = '0,00',
  className = '',
  min = 0,
  disabled = false,
  error = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const isTypingRef = useRef(false)

  // Valor máximo: R$ 1.000.000,00 = 100000000 centavos
  const MAX_CENTAVOS = 100000000

  /**
   * Formata um número em reais para exibição (pt-BR)
   * Ex: 1234.56 → "1.234,56"
   */
  const formatToDisplay = (reais: number): string => {
    if (reais === 0 || isNaN(reais)) return ''
    
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(reais)
  }

  /**
   * Converte centavos (número digitado) para reais
   * Ex: 123456 centavos → 1234.56 reais
   */
  const centavosToReais = (centavos: number): number => {
    return centavos / 100
  }

  /**
   * Converte reais para centavos
   * Ex: 1234.56 reais → 123456 centavos
   */
  const reaisToCentavos = (reais: number): number => {
    return Math.round(reais * 100)
  }

  // Atualiza displayValue quando value prop muda externamente (não durante digitação)
  useEffect(() => {
    if (isTypingRef.current) {
      return
    }
    
    const reais = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) || 0 : 0)
    const formatted = formatToDisplay(reais)
    
    if (formatted !== displayValue) {
      setDisplayValue(formatted)
    }
  }, [value])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    isTypingRef.current = true
    
    let inputValue = e.target.value
    
    // Remove tudo exceto dígitos (não aceita vírgula, ponto, R$, etc)
    // O usuário digita apenas números, cada dígito = centavos
    const digitsOnly = inputValue.replace(/\D/g, '')
    
    // Se não há nada, limpa
    if (!digitsOnly) {
      setDisplayValue('')
      onChange(0)
      isTypingRef.current = false
      return
    }
    
    // Converte para número (centavos)
    let centavos = parseInt(digitsOnly, 10)
    
    // Limita ao máximo permitido (R$ 1.000.000,00 = 100.000.000 centavos)
    if (centavos > MAX_CENTAVOS) {
      centavos = MAX_CENTAVOS
    }
    
    // Converte centavos para reais
    const reais = centavosToReais(centavos)
    
    // Formata para exibição (pt-BR: ponto para milhar, vírgula para decimal)
    const formatted = formatToDisplay(reais)
    
    // Atualiza o display
    setDisplayValue(formatted)
    
    // Chama onChange com valor em reais (não centavos)
    onChange(Math.max(min, reais))
    
    // Reseta flag após um pequeno delay
    setTimeout(() => {
      isTypingRef.current = false
    }, 0)
  }

  const handleBlur = () => {
    // Garante formatação completa ao perder foco
    const reais = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) || 0 : 0)
    const formatted = formatToDisplay(reais)
    setDisplayValue(formatted)
    onChange(Math.max(min, reais))
    isTypingRef.current = false
  }

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    // Seleciona todo o texto ao focar para facilitar edição
    e.target.select()
  }

  return (
    <div className={`flex items-center rounded-full border bg-white px-4 h-14 ${error ? 'border-red-500' : 'border-border'} ${className}`}>
      <span className="text-text-secondary mr-2">R$</span>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full outline-none text-body text-text-primary bg-transparent"
      />
    </div>
  )
}
