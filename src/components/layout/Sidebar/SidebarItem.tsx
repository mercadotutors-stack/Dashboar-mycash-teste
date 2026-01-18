import { Link, useLocation } from 'react-router-dom'
import { Icon } from '../../ui/Icon'

interface SidebarItemProps {
  label: string
  path: string
  iconName: string
  isExpanded: boolean
}

export function SidebarItem({ label, path, iconName, isExpanded }: SidebarItemProps) {
  const location = useLocation()
  const isActive = location.pathname === path

  return (
    <Link
      to={path}
      className={`
        group relative flex items-center
        rounded-full
        transition-colors duration-200 ease-in-out
        ${isExpanded
          ? 'gap-2 px-4 py-3 w-[236px] h-12'
          : 'justify-center w-12 h-12'}
        ${isActive
          ? 'bg-black text-white'
          : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'}
      `}
      title={!isExpanded ? label : undefined}
    >
      {/* Ícone */}
      <span className="flex-shrink-0 w-4 h-4">
        <Icon
          name={iconName}
          className={`
            w-full h-full
            ${isActive ? 'text-primary' : 'text-text-secondary'}
          `}
        />
      </span>

      {/* Texto (apenas quando expandido) */}
      {isExpanded && (
        <span
          className={`
            truncate font-semibold
            ${isActive ? 'text-white' : 'text-text-secondary'}
          `}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            lineHeight: '24px',
            letterSpacing: '0.3px',
          }}
        >
          {label}
        </span>
      )}

      {/* Tooltip (apenas quando colapsado) */}
      {!isExpanded && (
        <span className="
          absolute left-full ml-sm
          px-sm py-xs
          bg-gray-800 text-white text-small whitespace-nowrap
          rounded-md
          opacity-0 pointer-events-none group-hover:opacity-100
          transition-opacity duration-200 delay-300 z-50
          shadow-lg
        ">
          {label}
        </span>
      )}
    </Link>
  )
}
