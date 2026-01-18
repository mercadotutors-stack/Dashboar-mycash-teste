import { useState } from 'react'
import { Icon } from '../../ui/Icon'
import { MenuDropdown } from './MenuDropdown'

const mockUser = {
  name: 'Lucas Marte',
  email: 'lucasmarte@gmail.com',
  avatar: 'LM',
}

export function HeaderMobile() {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen((prev) => !prev)
  const close = () => setIsOpen(false)

  return (
    <>
      <header
        className="
          fixed top-0 left-0 right-0 z-40
          flex items-center justify-between
          px-4 py-3
          bg-bg-primary
          border-b border-border
          shadow-sm
          lg:hidden
        "
      >
        <div className="flex items-center">
          <span
            className="font-bold text-sidebar-active-text"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '22px',
              lineHeight: '28px',
              letterSpacing: '0.3px',
            }}
          >
            mycash+
          </span>
        </div>

        <button
          onClick={toggle}
          className="
            w-10 h-10 rounded-full
            bg-bg-secondary
            border border-border
            flex items-center justify-center
            text-text-primary
          "
          aria-label="Abrir menu"
        >
          <Icon name={isOpen ? 'close' : 'menu'} className="w-6 h-6" />
        </button>
      </header>

      <MenuDropdown isOpen={isOpen} onClose={close} user={mockUser} />
      {/* Spacer to empurrar conteúdo para baixo do header fixo */}
      <div className="h-16 lg:hidden" aria-hidden />
    </>
  )
}
