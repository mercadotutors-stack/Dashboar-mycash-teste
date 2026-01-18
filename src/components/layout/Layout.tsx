import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar/Sidebar'
import { useSidebar } from '../../hooks/useSidebar'

export function Layout() {
  const sidebar = useSidebar()

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/44256b10-28d3-49da-af14-981df50490d6', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'H3',
      location: 'Layout.tsx:render',
      message: 'Layout margin-left vs sidebar state',
      data: {
        isExpanded: sidebar.isExpanded,
        marginLeft: sidebar.isExpanded ? 300 : 80,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion

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
