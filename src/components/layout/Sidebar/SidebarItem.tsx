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
          ? 'gap-3 px-5 py-3 w-[236px] h-14'
          : 'justify-center w-12 h-12'}
        ${isActive
          ? 'bg-sidebar-active text-sidebar-active-text'
          : 'text-text-primary hover:bg-bg-secondary'}
      `}
      title={!isExpanded ? label : undefined}
    >
      {/* Ícone */}
      <span className="flex-shrink-0 w-5 h-5">
        <Icon
          name={iconName}
          className={`
            w-full h-full
            ${isActive ? 'text-sidebar-active-text' : 'text-text-primary'}
          `}
        />
      </span>

      {/* Texto (apenas quando expandido) */}
      {isExpanded && (
        <span
          className={`
            truncate font-semibold
            ${isActive ? 'text-sidebar-active-text' : 'text-text-primary'}
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

      {/* Tooltip no colapsado */}
      {!isExpanded && (
        <span
          className="
            absolute left-full ml-3 top-1/2 -translate-y-1/2
            whitespace-nowrap
            bg-black text-white text-sm font-medium
            rounded-full px-3 py-1
            opacity-0 pointer-events-none
            group-hover:opacity-100
            transition-opacity duration-150
            shadow-lg
            z-50
          "
        >
          {label}
        </span>
      )}
    </Link>
  )
}
