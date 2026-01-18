import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar/Sidebar'
import { useSidebar } from '../../hooks/useSidebar'

export function Layout() {
  const sidebar = useSidebar()

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar - apenas no desktop (lg: ≥1280px) */}
      <div className="hidden lg:block lg:flex-shrink-0">
        <Sidebar isExpanded={sidebar.isExpanded} toggle={sidebar.toggle} />
      </div>

      {/* Conteúdo principal */}
      <main
        className={`
          flex-1 min-w-0 w-full
          transition-all duration-300 ease-in-out
        `}
        style={{
          marginLeft: sidebar.isExpanded ? 300 : 80,
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}
