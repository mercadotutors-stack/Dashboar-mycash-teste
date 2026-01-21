import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar/Sidebar'
import { useSidebar } from '../../hooks/useSidebar'
import { HeaderMobile } from './Header/HeaderMobile'

export function Layout() {
  const sidebar = useSidebar()

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Header Mobile/Tablet */}
      <HeaderMobile />

      {/* Sidebar - apenas no desktop (lg: ≥1280px) */}
      <div className="hidden lg:block lg:flex-shrink-0">
        <Sidebar isExpanded={sidebar.isExpanded} toggle={sidebar.toggle} />
      </div>

      {/* Conteúdo principal */}
      <main
        className={`
          flex-1 min-w-0 w-full
          transition-all duration-300 ease-in-out
          pt-16 sm:pt-20 lg:pt-0
          animate-fade-in
        `}
      >
        <Outlet />
      </main>
    </div>
  )
}
