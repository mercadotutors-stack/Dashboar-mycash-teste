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
    setStep(step + 1)
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
    <div className="min-h-screen w-full bg-bg-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-border shadow-lg p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <Icon name="workspace_premium" className="w-10 h-10 text-text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-heading-xl font-bold text-text-primary">Novo workspace</h1>
              <p className="text-text-secondary text-sm mt-1">Crie um novo espaço para organizar seus dados</p>
            </div>
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
          <div className="flex-1 min-h-[300px] flex flex-col gap-4">
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Nome do workspace</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Família Torso"
                    className="h-12 rounded-full border border-border bg-white px-4 text-body text-text-primary outline-none focus:ring-2 focus:ring-primary/40"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Imagem do workspace</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="image" className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-12 px-4 rounded-full border border-border bg-white text-text-primary hover:bg-gray-100 text-sm font-semibold"
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
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Descrição ou tag</label>
                  <textarea
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Ex: Família Torso, Trabalho, Projetos pessoais..."
                    className="w-full rounded-full border border-border bg-white px-4 py-3 text-body text-text-primary outline-none focus:ring-2 focus:ring-primary/40 min-h-[100px] resize-none"
                    autoFocus
                  />
                  <p className="text-xs text-text-secondary">Adicione uma descrição ou tag para identificar este workspace</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'family' | 'company' | 'other')}
                    className="h-12 rounded-full border border-border bg-white px-4 text-body text-text-primary outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="family">Família</option>
                    <option value="company">Empresa</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
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
                      <span className="text-xs text-text-secondary mt-1">
                        Tipo: {type === 'family' ? 'Família' : type === 'company' ? 'Empresa' : 'Outro'}
                      </span>
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
              className="h-11 px-6 rounded-full border border-border text-text-primary hover:bg-gray-100"
            >
              {step === 1 ? 'Cancelar' : 'Voltar'}
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 1 && !name.trim()}
                className="h-12 rounded-full bg-black text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed px-6"
              >
                Próximo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="h-12 rounded-full bg-black text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed px-6"
              >
                {isSaving ? 'Criando...' : 'Criar workspace'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
