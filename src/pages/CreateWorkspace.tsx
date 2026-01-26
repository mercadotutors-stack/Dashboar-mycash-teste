import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFinance } from '../context/FinanceContext'
import { uploadImage } from '../lib/uploadImage'
import { ROUTES } from '../constants'
import { Icon } from '../components/ui/Icon'

export default function CreateWorkspace() {
  const { createWorkspace, setActiveWorkspace, userId } = useFinance()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [type, setType] = useState<'family' | 'company' | 'other'>('family')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const preview = URL.createObjectURL(file)
      setAvatarPreview(preview)
    }
  }

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      alert('Por favor, informe o nome do workspace')
      return
    }
    if (step === 2) {
      // Step 2 to 3 (final step)
      setStep(3)
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      navigate(ROUTES.WORKSPACES)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Por favor, informe o nome do workspace')
      return
    }

    try {
      setIsSaving(true)
      let avatarUrl: string | null = null

      if (avatarFile && userId) {
        const uploaded = await uploadImage(avatarFile, userId, 'workspace')
        if (uploaded) {
          avatarUrl = uploaded
        }
      }

      const id = await createWorkspace({
        name: name.trim(),
        type,
        subtitle: subtitle.trim() || null,
        avatarUrl,
      })

      setActiveWorkspace(id)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      console.error(err)
      alert('Erro ao criar workspace')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-bg-primary flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="workspace_premium" className="w-8 h-8 text-text-primary" />
            <div className="flex flex-col">
              <h1 className="text-heading-xl font-bold text-text-primary">Novo workspace</h1>
              <p className="text-text-secondary text-sm">Crie um novo espaço para organizar seus dados</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.WORKSPACES)}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-gray-100 transition"
            aria-label="Fechar"
          >
            <Icon name="close" className="w-5 h-5 text-text-primary" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`flex-1 h-1 rounded-full ${
                  s <= step ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                  s < step
                    ? 'bg-primary text-white'
                    : s === step
                      ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s < step ? <Icon name="check" className="w-4 h-4" /> : s}
              </div>
              <div
                className={`flex-1 h-1 rounded-full ${
                  s < step ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 min-h-[400px] flex flex-col gap-6">
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Nome do workspace</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Família Torso"
                  className="w-full rounded-lg border border-border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-text-primary">Imagem do workspace</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="image" className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg border border-border bg-white hover:bg-gray-50 transition text-sm font-semibold text-text-primary"
                    >
                      Escolher imagem
                    </button>
                    <p className="text-xs text-text-secondary">PNG, JPG até 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Descrição ou tag</label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Família Torso, Trabalho, Projetos pessoais..."
                  className="w-full rounded-lg border border-border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[120px] resize-none"
                  autoFocus
                />
                <p className="text-xs text-text-secondary">Adicione uma descrição ou tag para identificar este workspace</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'family' | 'company' | 'other')}
                  className="w-full rounded-lg border border-border px-4 py-3 text-base text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="family">Família</option>
                  <option value="company">Empresa</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div className="text-center py-4">
                <h2 className="text-heading-lg font-bold text-text-primary mb-2">Revisão</h2>
                <p className="text-text-secondary text-sm">Confira as informações antes de criar</p>
              </div>

              <div className="flex flex-col gap-4 p-6 bg-gray-50 rounded-xl border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Workspace" className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="workspace_premium" className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-heading-md font-semibold text-text-primary">{name || 'Sem nome'}</span>
                    <span className="text-sm text-text-secondary">{subtitle || 'Sem descrição'}</span>
                    <span className="text-xs text-text-secondary mt-1">Tipo: {type === 'family' ? 'Família' : type === 'company' ? 'Empresa' : 'Outro'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-3 rounded-lg border border-border bg-white hover:bg-gray-50 transition text-sm font-semibold text-text-primary"
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 1 && !name.trim()}
              className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Criando...' : 'Criar workspace'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
