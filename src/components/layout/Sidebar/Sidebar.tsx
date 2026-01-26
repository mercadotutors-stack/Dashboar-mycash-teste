import { NAVIGATION_ITEMS } from '../../../constants'
import { SidebarItem } from './SidebarItem'
import { UserProfile } from './UserProfile'
import { Icon } from '../../ui/Icon'
import { useFinance } from '../../../context/FinanceContext'

interface SidebarProps {
  isExpanded: boolean
  toggle: () => void
}

export function Sidebar({ isExpanded, toggle }: SidebarProps) {
  const { workspaces, activeWorkspaceId, setActiveWorkspace, createWorkspace } = useFinance()

  return (
    <aside
      className={`
        h-screen bg-bg-primary border-r border-sidebar-border
        flex flex-col relative
        sticky top-0
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-[300px] px-8 py-8' : 'w-[72px] px-4 py-6'}
        box-border
      `}
    >
      {/* Botão toggle - posicionado no topo do sidebar (32px do topo) */}
      <button
        onClick={toggle}
        className={`
          absolute -right-3 top-8
          w-8 h-8 rounded-full border border-sidebar-border
          bg-bg-primary flex items-center justify-center
          shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
          hover:shadow-lg transition duration-200
          z-10
        `}
        aria-label={isExpanded ? 'Colapsar sidebar' : 'Expandir sidebar'}
      >
        <Icon
          name={isExpanded ? 'chevronLeft' : 'chevronRight'}
          className="text-sidebar-active-text w-4 h-4"
        />
      </button>

      {/* Estrutura: topo (logo + nav), base (perfil) */}
      <div className="flex h-full flex-col">
        {/* Topo: logo e navegação */}
        <div className="flex flex-col">
          {/* Logo e botão toggle */}
          <div className="flex items-start justify-between w-full">
            {isExpanded ? (
              <h1
                className="font-bold text-sidebar-active-text"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '36px',
                  lineHeight: '44px',
                  letterSpacing: '0.3px',
                }}
              >
                mycash+
              </h1>
            ) : (
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-sm">
                m+
              </div>
            )}
          </div>

          {/* Navegação (32px abaixo do logo no desktop) */}
          <div className="flex flex-col gap-3 mt-8 w-full">
            {/* Workspace Switcher no sidebar (estilo card) */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon name="workspace_premium" className="w-5 h-5 text-text-primary" />
                  <span className="text-sm font-semibold leading-none text-text-primary">Workspaces</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const name = prompt('Nome do novo workspace')
                    if (!name) return
                    const type = prompt('Tipo (family, company, other)', 'family') || 'family'
                    try {
                      const id = await createWorkspace({ name, type })
                      setActiveWorkspace(id)
                    } catch (err) {
                      console.error(err)
                      alert('Erro ao criar workspace')
                    }
                  }}
                  className="h-9 px-4 rounded-full border border-border text-sm font-semibold text-text-primary hover:bg-bg-secondary transition flex items-center gap-2"
                >
                  <Icon name="add" className="w-4 h-4" />
                  <span>Novo</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full">
                <Icon name="folder" className="w-4 h-4 text-text-secondary" />
                <select
                  value={activeWorkspaceId || ''}
                  onChange={(e) => setActiveWorkspace(e.target.value)}
                  disabled={!workspaces.length}
                  className="h-10 flex-1 rounded-full border border-border bg-bg-primary px-4 text-sm text-text-primary outline-none"
                >
                  {!workspaces.length ? (
                    <option value="">Nenhum workspace</option>
                  ) : (
                    workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <nav
              className={`
                flex flex-col
                ${isExpanded ? 'gap-3' : 'gap-2'}
              `}
            >
              {NAVIGATION_ITEMS.map((item) => (
                <SidebarItem
                  key={item.path}
                  label={item.label}
                  path={item.path}
                  iconName={item.icon}
                  isExpanded={isExpanded}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* Perfil na base */}
        <div className="mt-auto">
          <UserProfile isExpanded={isExpanded} />
        </div>
      </div>
    </aside>
  )
}
