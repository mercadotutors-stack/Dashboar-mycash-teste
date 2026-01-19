import { useEffect, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'
import { CurrencyInput } from '../ui/CurrencyInput'

type Props = {
  open: boolean
  onClose: () => void
}

const roleSuggestions = ['Pai', 'Mãe', 'Filho', 'Filha', 'Avô', 'Avó', 'Tio', 'Tia']

export function AddMemberModal({ open, onClose }: Props) {
  const { addFamilyMember } = useFinance()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [income, setIncome] = useState<number>(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName('')
      setRole('')
      setAvatarUrl('')
      setIncome(0)
      setErrors({})
    }
  }, [open])

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 3) next.name = 'Por favor, insira um nome válido'
    if (!role.trim()) next.role = 'Por favor, informe a função na família'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      await addFamilyMember({
        name: name.trim(),
        role: role.trim(),
        email: '',
        monthlyIncome: income,
        avatarUrl: avatarUrl || undefined,
      })
      setToast('Membro adicionado com sucesso!')
      setTimeout(() => setToast(null), 2000)
      onClose()
    } catch (err) {
      console.error('Erro ao adicionar membro:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar membro. Verifique o console.'
      setToast(`Erro: ${errorMessage}`)
      setTimeout(() => setToast(null), 4000)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#C4E703] flex items-center justify-center">
            <Icon name="person_add" className="w-7 h-7 text-black" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-heading-xl font-bold text-text-primary">Adicionar Membro da Família</h2>
            <p className="text-text-secondary text-sm">
              Adicione membros para organizar as finanças da família.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-gray-100"
          aria-label="Fechar modal"
        >
          <Icon name="close" className="w-6 h-6 text-text-primary" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-bg-secondary/60 px-4">
        <div className="mx-auto w-full max-w-3xl py-6 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Nome Completo</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.name ? 'border-red-500' : 'border-border'
                }`}
                placeholder="Ex: João Silva"
              />
              {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Função na Família</label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                list="role-suggestions"
                className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.role ? 'border-red-500' : 'border-border'
                }`}
                placeholder="Ex: Pai, Mãe, Filho..."
              />
              <datalist id="role-suggestions">
                {roleSuggestions.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
              {errors.role ? <p className="text-sm text-red-600">{errors.role}</p> : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Avatar (URL)</label>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="h-12 rounded-full border border-border bg-white px-4 text-body text-text-primary outline-none"
                  placeholder="https://imagem.com/avatar.png"
                />
                <span className="text-xs text-text-secondary">Ou deixe vazio para usar avatar padrão.</span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Upload (JPG/PNG até 5MB)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="text-sm text-text-secondary"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    // Em ambiente real faríamos upload; aqui apenas guardamos nome para referência
                    setAvatarUrl(file.name)
                  }}
                />
                <span className="text-xs text-text-secondary">Sem upload real neste protótipo.</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Renda Mensal Estimada (opcional)</label>
              <CurrencyInput
                value={income}
                onChange={(value) => setIncome(value)}
                placeholder="0,00"
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 z-10 border-t border-border bg-white px-6 py-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="h-11 px-6 rounded-full border border-border text-text-primary hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="h-11 px-6 rounded-full bg-black text-white font-semibold hover:opacity-90"
        >
          Adicionar Membro
        </button>
      </footer>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black text-white px-4 py-2 shadow-lg z-50">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
