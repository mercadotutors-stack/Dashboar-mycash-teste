import { useEffect, useMemo, useRef, useState } from 'react'
import { NAVIGATION_ITEMS } from '../../../constants'
import { SidebarItem } from './SidebarItem'
import { UserProfile } from './UserProfile'
import { Icon } from '../../ui/Icon'
import { useFinance } from '../../../context/FinanceContext'
import { ModalWrapper } from '../../ui/ModalWrapper'

interface SidebarProps {
  isExpanded: boolean
  toggle: () => void
}

export function Sidebar({ isExpanded, toggle }: SidebarProps) {
  const { workspaces, activeWorkspaceId, setActiveWorkspace, createWorkspace, updateWorkspace } = useFinance()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'family' | 'company' | 'other'>('family')
  const [newSubtitle, setNewSubtitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
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

  const handleCreateWorkspace = async () => {
    if (!newName.trim()) return
    try {
      setIsSaving(true)
      const id = await createWorkspace({ name: newName.trim(), type: newType, subtitle: newSubtitle.trim() || undefined })
      setActiveWorkspace(id)
      setShowCreateModal(false)
      setNewName('')
      setNewType('family')
      setNewSubtitle('')
      setIsDropdownOpen(false)
    } catch (err) {
      console.error(err)
      alert('Erro ao criar workspace')
    } finally {
      setIsSaving(false)
    }
  }

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
            {/* Workspace Switcher no sidebar (estilo Notion/Drive) */}
            <div className="flex flex-col gap-3 rounded-[12px] border border-border bg-white p-3 shadow-sm w-full">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#111827]">Workspaces</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false)
                    setShowCreateModal(true)
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
                          setShowCreateModal(true)
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

      {/* Modal de criação de workspace (padrão igual transação) */}
      <ModalWrapper
        open={showCreateModal}
        onClose={() => {
          if (isSaving) return
          setShowCreateModal(false)
          setNewName('')
          setNewType('family')
          setNewSubtitle('')
        }}
        className="w-full h-full bg-white flex flex-col"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-text-primary">
              <Icon name="workspace_premium" className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-heading-xl font-bold text-text-primary">Novo workspace</h2>
              <p className="text-text-secondary text-sm">Organize dados por família, empresa ou projetos.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isSaving) return
              setShowCreateModal(false)
              setNewName('')
              setNewType('family')
              setNewSubtitle('')
            }}
            className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-gray-100"
            aria-label="Fechar modal"
          >
            <Icon name="close" className="w-6 h-6 text-text-primary" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-bg-secondary/60 px-4">
          <div className="mx-auto w-full max-w-3xl py-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-text-primary">Nome do workspace</span>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Família Torso"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-text-primary">Legenda</span>
                <input
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Workspace padrão"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-text-primary">Tipo</span>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'family' | 'company' | 'other')}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="family">Família</option>
                  <option value="company">Empresa</option>
                  <option value="other">Outro</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <footer className="sticky bottom-0 border-t border-border bg-white px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (isSaving) return
              setShowCreateModal(false)
              setNewName('')
              setNewType('family')
              setNewSubtitle('')
            }}
            className="text-sm text-text-secondary hover:text-text-primary transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreateWorkspace}
            disabled={isSaving || !newName.trim()}
            className="text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition px-4 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Criando...' : 'Criar workspace'}
          </button>
        </footer>
      </ModalWrapper>
    </aside>
  )
}
