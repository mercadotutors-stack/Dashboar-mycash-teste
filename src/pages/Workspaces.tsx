import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFinance } from '../context/FinanceContext'
import { ROUTES } from '../constants'
import { Icon } from '../components/ui/Icon'

export default function Workspaces() {
  const { workspaces, activeWorkspaceId, setActiveWorkspace, createWorkspace } = useFinance()
  const navigate = useNavigate()

  useEffect(() => {
    // Se já existe workspace ativo e há pelo menos um carregado, vai direto para dashboard
    if (workspaces.length > 0 && activeWorkspaceId) {
      // mantém a tela para troca manual; não auto-navega
    }
  }, [workspaces, activeWorkspaceId])

  const handleSelect = (id: string) => {
    setActiveWorkspace(id)
    navigate(ROUTES.DASHBOARD)
  }

  const handleCreate = async () => {
    const name = prompt('Nome do workspace', 'Novo workspace')
    if (!name) return
    const type = prompt('Tipo (family, company, other)', 'family') || 'family'
    try {
      const id = await createWorkspace({ name, type })
      setActiveWorkspace(id)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      console.error(err)
      alert('Erro ao criar workspace')
    }
  }

  return (
    <div className="min-h-screen w-full bg-bg-primary flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="workspace_premium" className="w-8 h-8 text-text-primary" />
            <div className="flex flex-col">
              <h1 className="text-heading-xl font-bold text-text-primary">Selecione um workspace</h1>
              <p className="text-text-secondary text-sm">Organize seus dados por contexto (família, empresa, etc.).</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="h-10 px-4 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900 transition"
          >
            + Novo workspace
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSelect(ws.id)}
              className={`w-full rounded-xl border px-4 py-4 text-left flex flex-col gap-2 transition hover:border-black ${
                ws.id === activeWorkspaceId ? 'border-black bg-gray-50' : 'border-border bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-heading-md font-semibold text-text-primary truncate">{ws.name}</span>
                <span className="text-xs px-2 py-1 rounded-full border border-border text-text-secondary">
                  {ws.type}
                </span>
              </div>
              <p className="text-sm text-text-secondary truncate">Owner: {ws.ownerId.slice(0, 8)}...</p>
              {ws.id === activeWorkspaceId ? (
                <span className="text-xs text-green-600 font-semibold">Ativo</span>
              ) : (
                <span className="text-xs text-text-secondary">Clique para ativar</span>
              )}
            </button>
          ))}

          {workspaces.length === 0 ? (
            <div className="col-span-full text-center text-text-secondary text-sm">
              Nenhum workspace encontrado. Crie o primeiro para continuar.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
