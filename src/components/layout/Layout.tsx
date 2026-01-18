import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar/Sidebar'

export function Layout() {

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar - apenas no desktop (lg: ≥1280px) */}
      <div className="hidden lg:block lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Conteúdo principal */}
      <main
        className={`
          flex-1 min-w-0 w-full
          transition-all duration-300 ease-in-out
          lg:ml-0
        `}
      >
        <Outlet />
      </main>
    </div>
  )
}
