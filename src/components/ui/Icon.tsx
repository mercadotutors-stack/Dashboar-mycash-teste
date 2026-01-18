/**
 * Componente de ícone simples
 * Por enquanto usa emojis, futuramente pode ser substituído por biblioteca de ícones
 */
interface IconProps {
  name: string
  className?: string
}

export function Icon({ name, className = '' }: IconProps) {
  const iconMap: Record<string, string> = {
    home: '🏠',
    'credit-card': '💳',
    transactions: '📊',
    user: '👤',
    chevronLeft: '◀',
    chevronRight: '▶',
  }

  const icon = iconMap[name] || '•'

  return (
    <span className={`inline-flex items-center justify-center ${className}`} role="img" aria-label={name}>
      {icon}
    </span>
  )
}
