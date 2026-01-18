interface IconProps {
  name: string
  className?: string
}

/**
 * Usa Google Material Symbols Outlined (via font import em index.html).
 */
export function Icon({ name, className = '' }: IconProps) {
  const materialName = iconMap[name] ?? name

  return (
    <span
      className={`material-symbols-outlined inline-flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {materialName}
    </span>
  )
}

const iconMap: Record<string, string> = {
  home: 'home',
  'credit-card': 'credit_card',
  transactions: 'stacked_bar_chart',
  user: 'person',
  chevronLeft: 'chevron_left',
  chevronRight: 'chevron_right',
  menu: 'menu',
  close: 'close',
  logout: 'logout',
}
