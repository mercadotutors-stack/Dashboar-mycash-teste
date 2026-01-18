import { useState } from 'react'
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
          px-5 py-4
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
          aria-expanded={isOpen}
          className="
            w-12 h-12 rounded-full
            bg-bg-secondary
            border border-border
            flex items-center justify-center
            text-text-primary
            font-semibold
            transition-shadow duration-150
            focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-bg-primary
          "
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <span className="text-base leading-5 tracking-[0.3px]">{mockUser.avatar}</span>
        </button>
      </header>

      <MenuDropdown isOpen={isOpen} onClose={close} user={mockUser} />
      {/* Spacer to empurrar conteúdo para baixo do header fixo */}
      <div className="h-20 lg:hidden" aria-hidden />
    </>
  )
}
