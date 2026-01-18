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
            bg-black/40
            lg:hidden
          "
          onClick={onClose}
        />
      )}

      {/* Dropdown */}
      <div
        className={`
          fixed left-0 right-0 top-0 z-40
          px-4 pt-16 pb-4
          transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0 pointer-events-none'}
          lg:hidden
        `}
        style={{ transitionProperty: 'transform, opacity' }}
      >
        <div
          className="
            bg-bg-primary
            border border-border
            rounded-lg
            shadow-lg
            overflow-hidden
          "
        >
          {/* Header dentro do dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-avatar-bg flex items-center justify-center text-text-primary font-semibold">
                {user.avatar}
              </div>
              <div className="flex flex-col">
                <span className="text-text-primary font-semibold text-base leading-5">
                  {user.name}
                </span>
                <span className="text-text-secondary text-sm leading-5">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-primary"
              aria-label="Fechar menu"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de navegação */}
          <nav className="flex flex-col px-2 py-2">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`
                    flex items-center gap-3
                    px-3 py-3
                    rounded-full
                    text-base font-medium
                    transition-colors duration-150
                    ${isActive
                      ? 'bg-black text-white'
                      : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'}
                  `}
                >
                  <Icon
                    name={item.icon}
                    className={`
                      w-5 h-5
                      ${isActive ? 'text-primary' : 'text-inherit'}
                    `}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Botão Sair */}
          <div className="px-2 pb-3">
            <button
              className="
                w-full flex items-center justify-center gap-2
                px-4 py-3 rounded-full
                text-white bg-danger
                font-semibold text-base
                transition-colors duration-150
                hover:opacity-90
              "
              onClick={onClose}
            >
              <Icon name="logout" className="w-5 h-5 text-white" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
