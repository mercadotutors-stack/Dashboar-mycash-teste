import { useState, useEffect, useRef, type ChangeEvent, type FocusEvent } from 'react'
import { formatCurrency, parseCurrencyInput } from '../../utils'

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
    const numValue = typeof num === 'string' ? parseCurrencyInput(num) : num
    if (isNaN(numValue) || numValue === 0) return ''
    
    // Remove o "R$ " do formatCurrency e retorna apenas o valor formatado
    return formatCurrency(numValue).replace('R$ ', '')
  }

  // Converte string formatada para número (ex: "1.000,50" -> 1000.50)
  const parseFromDisplay = (str: string): number => {
    if (!str) return 0
    const parsed = parseCurrencyInput(str)
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
    let inputValue = e.target.value
    
    // Remove tudo exceto dígitos e vírgula (incluindo pontos de milhar, R$, espaços, etc)
    let cleaned = inputValue.replace(/[^\d,]/g, '')
    
    // Se não há nada, limpa
    if (!cleaned || cleaned === ',') {
      setDisplayValue('')
      onChange(0)
      return
    }
    
    // Garante apenas uma vírgula (pega a primeira se houver múltiplas)
    const commaIndex = cleaned.indexOf(',')
    let integerPart = ''
    let decimalPart = ''
    
    if (commaIndex >= 0) {
      integerPart = cleaned.substring(0, commaIndex)
      decimalPart = cleaned.substring(commaIndex + 1).replace(/,/g, '').slice(0, 2) // Remove vírgulas extras e limita a 2 decimais
    } else {
      integerPart = cleaned
    }
    
    // Remove zeros à esquerda, mas mantém pelo menos um dígito
    integerPart = integerPart.replace(/^0+/, '') || '0'
    
    // Se a parte inteira está vazia mas há decimais, adiciona zero
    if (!integerPart && decimalPart) {
      integerPart = '0'
    }
    
    // Formata a parte inteira com pontos de milhar (a cada 3 dígitos da direita para esquerda)
    // Usa regex para adicionar pontos corretamente
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    
    // Monta o valor formatado final
    const formatted = decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger
    
    // Atualiza o display
    setDisplayValue(formatted)
    
    // Converte para número usando a função utilitária e chama onChange
    const numericValue = parseFromDisplay(formatted)
    onChange(numericValue)
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
