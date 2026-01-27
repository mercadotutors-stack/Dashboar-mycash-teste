import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NAVIGATION_ITEMS, ROUTES } from '../../../constants'
import { SidebarItem } from './SidebarItem'
import { UserProfile } from './UserProfile'
import { Icon } from '../../ui/Icon'
import { useFinance } from '../../../context/FinanceContext'

interface SidebarProps {
  isExpanded: boolean
  toggle: () => void
}

export function Sidebar({ isExpanded, toggle }: SidebarProps) {
  const { workspaces, activeWorkspaceId, setActiveWorkspace, updateWorkspace } = useFinance()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editingType, setEditingType] = useState<string | null>(null)
  const [tempName, setTempName] = useState('')
  const [tempType, setTempType] = useState<'family' | 'company' | 'other'>('family')
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const typeInputRef = useRef<HTMLSelectElement | null>(null)

  const currentWorkspace = useMemo(() => {
    if (!workspaces.length) return null
    return workspaces.find((ws) => ws.id === activeWorkspaceId) ?? workspaces[0]
  }, [workspaces, activeWorkspaceId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
      setIsDropdownOpen(false)
  }, [activeWorkspaceId])

  const handleStartEditName = (workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId)
    if (!ws) return
    setEditingName(workspaceId)
    setTempName(ws.name)
    setTimeout(() => nameInputRef.current?.focus(), 10)
  }

  const handleSaveName = async (workspaceId: string) => {
    if (!tempName.trim()) {
      setEditingName(null)
      return
    }
    try {
      await updateWorkspace(workspaceId, { name: tempName.trim() })
      setEditingName(null)
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar nome')
    }
  }

  const handleStartEditType = (workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId)
    if (!ws) return
    setEditingType(workspaceId)
    setTempType((ws.type as 'family' | 'company' | 'other') || 'family')
    setTimeout(() => typeInputRef.current?.focus(), 10)
  }

  const handleSaveType = async (workspaceId: string) => {
    try {
      await updateWorkspace(workspaceId, { type: tempType })
      setEditingType(null)
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar tipo')
    }
  }

  return (
    <aside
      className={`
        h-screen bg-bg-primary border-r border-sidebar-border
        flex flex-col relative
        sticky top-0 z-10
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
                  fontSize: '28px',
                  lineHeight: '34px',
                  letterSpacing: '0.3px',
                }}
              >
                {currentWorkspace?.name || 'Workspace'}
              </h1>
            ) : (
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xs">
                {(currentWorkspace?.name || 'W').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Navegação (32px abaixo do logo no desktop) */}
          <div className="flex flex-col gap-3 mt-8 w-full">
            {/* Workspace Switcher no sidebar (estilo Notion/Drive) */}
            {isExpanded ? (
              <div className="flex flex-col gap-3 rounded-[12px] border border-border bg-white p-3 shadow-sm w-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#111827]">Workspaces</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false)
                      navigate(ROUTES.CREATE_WORKSPACE)
                    }}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] transition flex items-center gap-1"
                  >
                    <Icon name="add" className="w-4 h-4" />
                    <span>Novo</span>
                  </button>
                </div>

                {/* Ativo */}
                <div className="relative w-full group" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="w-full rounded-[10px] border border-transparent bg-[#F9FAFB] px-3 py-2.5 flex items-center justify-between hover:bg-[#F3F4F6] transition"
                  >
                    <div className="flex items-center gap-3">
                      {currentWorkspace?.avatarUrl ? (
                        <img
                          src={currentWorkspace.avatarUrl}
                          alt={currentWorkspace.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#E5E7EB] flex items-center justify-center text-sm font-semibold text-[#111827] uppercase">
                          {(currentWorkspace?.name?.[0] ?? 'W').slice(0, 1)}
                        </div>
                      )}
                      <div className="flex flex-col text-left flex-1 min-w-0">
                        {editingName === currentWorkspace?.id ? (
                          <input
                            ref={nameInputRef}
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={() => {
                              if (currentWorkspace) handleSaveName(currentWorkspace.id)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && currentWorkspace) {
                                handleSaveName(currentWorkspace.id)
                              }
                              if (e.key === 'Escape') {
                                setEditingName(null)
                              }
                            }}
                            className="text-[14px] font-medium text-[#111827] leading-tight bg-white border border-primary rounded px-2 py-1 outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="text-[14px] font-medium text-[#111827] leading-tight cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (currentWorkspace) handleStartEditName(currentWorkspace.id)
                            }}
                          >
                            {currentWorkspace?.name ?? 'Nenhum workspace'}
                          </span>
                        )}
                        {editingType === currentWorkspace?.id ? (
                          <select
                            ref={typeInputRef}
                            value={tempType}
                            onChange={(e) => setTempType(e.target.value as 'family' | 'company' | 'other')}
                            onBlur={() => {
                              if (currentWorkspace) handleSaveType(currentWorkspace.id)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && currentWorkspace) {
                                handleSaveType(currentWorkspace.id)
                              }
                              if (e.key === 'Escape') {
                                setEditingType(null)
                              }
                            }}
                            className="text-[12px] text-[#6B7280] leading-tight bg-white border border-primary rounded px-2 py-1 outline-none mt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="family">Família</option>
                            <option value="company">Empresa</option>
                            <option value="other">Outro</option>
                          </select>
                        ) : (
                          <span
                            className="text-[12px] text-[#6B7280] leading-tight cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (currentWorkspace) handleStartEditType(currentWorkspace.id)
                            }}
                          >
                            {currentWorkspace?.subtitle ?? currentWorkspace?.type ?? 'Selecione ou crie um workspace'}
                          </span>
                        )}
                      </div>
                    </div>
                    <Icon
                      name="chevronDown"
                      className={`w-4 h-4 text-text-secondary transition ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {isDropdownOpen ? (
                    <div className="absolute left-0 right-0 top-full mt-2 rounded-[12px] border border-border bg-white shadow-lg overflow-hidden z-20">
                      <div className="max-h-72 overflow-auto flex flex-col p-2 gap-1">
                        {workspaces.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-text-secondary">Nenhum workspace disponível</div>
                        ) : (
                          workspaces.map((ws) => {
                            const isActive = ws.id === activeWorkspaceId
                            return (
                              <button
                                key={ws.id}
                                onClick={() => {
                                  setActiveWorkspace(ws.id)
                                  setIsDropdownOpen(false)
                                }}
                                className={`
                                  relative group w-full px-3 py-2.5 flex items-center justify-between gap-2 rounded-lg transition
                                  ${isActive ? 'bg-[#EEF2FF]' : 'hover:bg-[#F3F4F6]'}
                                `}
                              >
                                <div className="flex items-center gap-3">
                                  {ws.avatarUrl ? (
                                    <img src={ws.avatarUrl} alt={ws.name} className="w-10 h-10 rounded-lg object-cover" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-[#E5E7EB] flex items-center justify-center text-sm font-semibold text-[#111827] uppercase">
                                      {ws.name.slice(0, 1)}
                                    </div>
                                  )}
                                  <div className="flex flex-col text-left flex-1 min-w-0">
                                    {editingName === ws.id ? (
                                      <input
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        onBlur={() => handleSaveName(ws.id)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSaveName(ws.id)
                                          }
                                          if (e.key === 'Escape') {
                                            setEditingName(null)
                                          }
                                        }}
                                        className="text-[14px] font-semibold text-[#111827] leading-tight bg-white border border-primary rounded px-2 py-1 outline-none"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <span
                                        className="text-[14px] font-semibold text-[#111827] leading-tight cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStartEditName(ws.id)
                                        }}
                                      >
                                        {ws.name}
                                      </span>
                                    )}
                                    {editingType === ws.id ? (
                                      <select
                                        value={tempType}
                                        onChange={(e) => setTempType(e.target.value as 'family' | 'company' | 'other')}
                                        onBlur={() => handleSaveType(ws.id)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSaveType(ws.id)
                                          }
                                          if (e.key === 'Escape') {
                                            setEditingType(null)
                                          }
                                        }}
                                        className="text-[12px] text-[#6B7280] leading-tight bg-white border border-primary rounded px-2 py-1 outline-none mt-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <option value="family">Família</option>
                                        <option value="company">Empresa</option>
                                        <option value="other">Outro</option>
                                      </select>
                                    ) : (
                                      <span
                                        className="text-[12px] text-[#6B7280] leading-tight cursor-pointer hover:bg-gray-100 rounded px-1 -mx-1"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStartEditType(ws.id)
                                        }}
                                      >
                                        {ws.subtitle ?? ws.type}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isActive ? <Icon name="check" className="w-5 h-5 text-primary" /> : null}
                              </button>
                            )
                          })
                        )}
                      </div>

                      {/* Criar novo */}
                    <div className="border-t border-border">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false)
                          navigate(ROUTES.CREATE_WORKSPACE)
                        }}
                        className="w-full px-3 py-3 flex items-center gap-2 text-[13px] font-semibold text-[#111827] hover:bg-[#F9FAFB] transition"
                      >
                        <Icon name="add" className="w-4 h-4" />
                        <span>Criar novo workspace</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            ) : (
              /* Versão reduzida quando sidebar está fechado */
              <div className="relative w-full flex flex-col items-center gap-2" ref={dropdownRef}>
                {/* Avatar do workspace – único clique para abrir dropdown */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="w-10 h-10 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                  aria-label="Trocar workspace"
                >
                  {currentWorkspace?.avatarUrl ? (
                    <img
                      src={currentWorkspace.avatarUrl}
                      alt={currentWorkspace.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#E5E7EB] flex items-center justify-center text-sm font-semibold text-[#111827] uppercase">
                      {(currentWorkspace?.name?.[0] ?? 'W').slice(0, 1)}
                    </div>
                  )}
                </button>

                {/* Dropdown reduzido */}
                {isDropdownOpen ? (
                  <div className="absolute left-full ml-2 top-0 rounded-[12px] border border-border bg-white shadow-lg overflow-hidden z-20 min-w-[240px]">
                    <div className="max-h-72 overflow-auto flex flex-col p-2 gap-1">
                      {workspaces.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-text-secondary">Nenhum workspace disponível</div>
                      ) : (
                        workspaces.map((ws) => {
                          const isActive = ws.id === activeWorkspaceId
                          return (
                            <button
                              key={ws.id}
                              onClick={() => {
                                setActiveWorkspace(ws.id)
                                setIsDropdownOpen(false)
                              }}
                              className={`
                                relative group w-full px-3 py-2.5 flex items-center justify-between gap-2 rounded-lg transition
                                ${isActive ? 'bg-[#EEF2FF]' : 'hover:bg-[#F3F4F6]'}
                              `}
                            >
                              <div className="flex items-center gap-3">
                                {ws.avatarUrl ? (
                                  <img src={ws.avatarUrl} alt={ws.name} className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-[#E5E7EB] flex items-center justify-center text-sm font-semibold text-[#111827] uppercase">
                                    {ws.name.slice(0, 1)}
                                  </div>
                                )}
                                <div className="flex flex-col text-left flex-1 min-w-0">
                                  <span className="text-[14px] font-semibold text-[#111827] leading-tight">
                                    {ws.name}
                                  </span>
                                  <span className="text-[12px] text-[#6B7280] leading-tight">
                                    {ws.subtitle ?? ws.type}
                                  </span>
                                </div>
                              </div>
                              {isActive ? <Icon name="check" className="w-5 h-5 text-primary" /> : null}
                            </button>
                          )
                        })
                      )}
                    </div>

                    {/* Criar novo */}
                    <div className="border-t border-border">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false)
                          navigate(ROUTES.CREATE_WORKSPACE)
                        }}
                        className="w-full px-3 py-3 flex items-center gap-2 text-[13px] font-semibold text-[#111827] hover:bg-[#F9FAFB] transition"
                      >
                        <Icon name="add" className="w-4 h-4" />
                        <span>Criar novo workspace</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

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
