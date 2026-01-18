import { NAVIGATION_ITEMS } from '../../../constants'
import { SidebarItem } from './SidebarItem'
import { UserProfile } from './UserProfile'
import { Icon } from '../../ui/Icon'

interface SidebarProps {
  isExpanded: boolean
  toggle: () => void
}

export function Sidebar({ isExpanded, toggle }: SidebarProps) {

  return (
    <aside
      className={`
        h-screen bg-bg-primary border-r border-sidebar-border
        flex flex-col relative
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-[300px] px-8 py-8' : 'w-[72px] px-4 py-6'}
      `}
    >
      {/* Estrutura: topo (logo), meio (nav), base (perfil) */}
      <div className="flex h-full flex-col justify-between">
        {/* Topo: logo e botão toggle */}
        <div className="flex items-start justify-between relative">
          {isExpanded ? (
            <h1
              className="font-bold text-sidebar-active-text"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '20px',
                lineHeight: '28px',
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

          <button
            onClick={toggle}
            className={`
              absolute -right-3 top-2
              w-8 h-8 rounded-full border border-sidebar-border
              bg-bg-primary flex items-center justify-center
              shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
              hover:shadow-lg transition duration-200
            `}
            aria-label={isExpanded ? 'Colapsar sidebar' : 'Expandir sidebar'}
          >
            <Icon
              name={isExpanded ? 'chevronLeft' : 'chevronRight'}
              className="text-sidebar-active-text w-4 h-4"
            />
          </button>
        </div>

        {/* Navegação central (aprox. 56px abaixo do logo) */}
        <div className="flex flex-col gap-3 mt-14">
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

        {/* Perfil na base */}
        <UserProfile isExpanded={isExpanded} />
      </div>
    </aside>
  )
}
