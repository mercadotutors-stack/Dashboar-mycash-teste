import { NAVIGATION_ITEMS } from '../../../constants'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '../../ui/Icon'

interface MenuDropdownProps {
  isOpen: boolean
  onClose: () => void
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function MenuDropdown({ isOpen, onClose, user }: MenuDropdownProps) {
  const location = useLocation()

  const handleNavClick = () => {
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="
            fixed inset-0 z-30
            bg-black/50
            lg:hidden
          "
          onClick={onClose}
        />
      )}

      {/* Dropdown */}
      <div
        className={`
          fixed left-0 right-0 top-0 z-40
          px-4 pt-24 pb-6
          transition-all duration-200 ease-out
          ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}
          lg:hidden
        `}
        style={{ transitionProperty: 'transform, opacity' }}
      >
        <div
          className="
            w-full max-w-screen-md mx-auto
            bg-bg-primary
            border border-sidebar-border
            rounded-2xl
            shadow-[0px_20px_40px_rgba(0,0,0,0.18)]
            overflow-hidden
          "
        >
          {/* Header dentro do dropdown */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
            <div className="flex items-center gap-4">
              <div
                className="rounded-full bg-sidebar-avatar-bg flex items-center justify-center text-text-primary font-semibold"
                style={{
                  width: 'calc(var(--sidebar-avatar-size) * 2)',
                  height: 'calc(var(--sidebar-avatar-size) * 2)',
                  fontSize: 'var(--font-size-sidebar-name)',
                  lineHeight: 'var(--line-height-sidebar-name)',
                  letterSpacing: 'var(--letter-spacing-sidebar-label)',
                }}
              >
                {user.avatar}
              </div>
              <div className="flex flex-col">
                <span
                  className="text-text-primary font-semibold"
                  style={{
                    fontSize: 'var(--font-size-sidebar-name)',
                    lineHeight: 'var(--line-height-sidebar-name)',
                    letterSpacing: 'var(--letter-spacing-sidebar-label)',
                  }}
                >
                  {user.name}
                </span>
                <span
                  className="text-text-secondary font-regular"
                  style={{
                    fontSize: 'var(--font-size-sidebar-email)',
                    lineHeight: 'var(--line-height-sidebar-email)',
                    letterSpacing: 'var(--letter-spacing-sidebar-label)',
                  }}
                >
                  {user.email}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full border border-sidebar-border flex items-center justify-center text-text-primary hover:bg-bg-secondary transition-colors"
              aria-label="Fechar menu"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de navegação */}
          <nav className="flex flex-col px-4 py-4 gap-2">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`
                    flex items-center gap-3
                    px-4 py-3.5
                    rounded-full
                    transition-colors duration-150
                    ${isActive
                      ? 'bg-text-primary text-bg-primary'
                      : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'}
                  `}
                >
                  <Icon
                    name={item.icon}
                    className={`
                      w-5 h-5
                      ${isActive ? 'text-sidebar-active' : 'text-inherit'}
                    `}
                  />
                  <span
                    className="font-semibold"
                    style={{
                      fontSize: 'var(--font-size-sidebar-label)',
                      lineHeight: 'var(--line-height-sidebar-label)',
                      letterSpacing: 'var(--letter-spacing-sidebar-label)',
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Botão Sair */}
          <div className="px-4 pb-5">
            <button
              className="
                w-full flex items-center justify-center gap-2
                px-4 py-4 rounded-full
                text-white bg-danger
                font-semibold
                transition-colors duration-150
                hover:opacity-90
              "
              onClick={onClose}
            >
              <Icon name="logout" className="w-5 h-5 text-white" />
              <span
                style={{
                  fontSize: 'var(--font-size-sidebar-label)',
                  lineHeight: 'var(--line-height-sidebar-label)',
                  letterSpacing: 'var(--letter-spacing-sidebar-label)',
                }}
              >
                Sair
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
