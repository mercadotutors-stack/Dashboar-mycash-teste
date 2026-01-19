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

  // Converte número para string formatada (ex: 1000.50 -> "1.000,50")
  const formatToDisplay = (num: number | string): string => {
    if (num === '' || num === null || num === undefined) return ''
    const numValue = typeof num === 'string' ? parseFloat(num.replace(/[^\d,]/g, '').replace(',', '.')) || 0 : num
    if (isNaN(numValue)) return ''
    
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue)
  }

  // Converte string formatada para número (ex: "1.000,50" -> 1000.50)
  const parseFromDisplay = (str: string): number => {
    if (!str) return 0
    // Remove tudo exceto dígitos e vírgula
    const cleaned = str.replace(/[^\d,]/g, '')
    // Substitui vírgula por ponto
    const normalized = cleaned.replace(',', '.')
    const parsed = parseFloat(normalized) || 0
    return Math.max(min, parsed)
  }

  // Atualiza displayValue quando value prop muda
  useEffect(() => {
    if (typeof value === 'number') {
      setDisplayValue(formatToDisplay(value))
    } else if (typeof value === 'string') {
      const num = parseFloat(value) || 0
      setDisplayValue(formatToDisplay(num))
    }
  }, [value])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Remove tudo exceto dígitos e vírgula
    const cleaned = inputValue.replace(/[^\d,]/g, '')
    
    // Garante apenas uma vírgula
    const parts = cleaned.split(',')
    let normalized = parts[0] || ''
    if (parts.length > 1) {
      // Limita casas decimais a 2
      normalized += ',' + parts.slice(1).join('').slice(0, 2)
    }
    
    // Formata enquanto digita
    if (normalized) {
      const [integerPart, decimalPart = ''] = normalized.split(',')
      // Adiciona pontos de milhar
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      const formatted = decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger
      setDisplayValue(formatted)
      
      // Chama onChange com valor numérico
      const numericValue = parseFromDisplay(formatted)
      onChange(numericValue)
    } else {
      setDisplayValue('')
      onChange(0)
    }
  }

  const handleBlur = () => {
    // Garante formatação completa ao perder foco
    const numValue = parseFromDisplay(displayValue)
    setDisplayValue(formatToDisplay(numValue))
    onChange(numValue)
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
