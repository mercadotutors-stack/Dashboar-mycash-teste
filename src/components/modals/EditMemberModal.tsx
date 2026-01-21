import { useEffect, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { useAuth } from '../../context/AuthContext'
import { FamilyMember } from '../../types'
import { Icon } from '../ui/Icon'
import { CurrencyInput } from '../ui/CurrencyInput'
import { Tooltip } from '../ui/Tooltip'
import { uploadImage } from '../../lib/uploadImage'
import { ModalWrapper } from '../ui/ModalWrapper'
import { Toast } from '../ui/Toast'

type Props = {
  open: boolean
  member: FamilyMember | null
  onClose: () => void
}

const roleSuggestions = ['Pai', 'Mãe', 'Filho', 'Filha', 'Avô', 'Avó', 'Tio', 'Tia']

export function EditMemberModal({ open, member, onClose }: Props) {
  const { updateFamilyMember } = useFinance()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [income, setIncome] = useState<number>(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  useEffect(() => {
    if (open && member) {
      setName(member.name)
      setRole(member.role)
      setEmail(member.email || '')
      setAvatarUrl(member.avatarUrl || '')
      setIncome(member.monthlyIncome || 0)
      setErrors({})
    }
  }, [open, member])

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 3) next.name = 'Por favor, insira um nome válido'
    if (!role.trim()) next.role = 'Por favor, informe a função na família'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleFileUpload = async (file: File) => {
    if (!user?.id) {
      setToast('Erro: Usuário não autenticado')
      setTimeout(() => setToast(null), 3000)
      return
    }

    setIsUploading(true)
    setUploadProgress('Fazendo upload da imagem...')

    try {
      const uploadedUrl = await uploadImage(file, user.id, member?.id)
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl)
        setUploadProgress('Upload concluído!')
        setTimeout(() => setUploadProgress(null), 2000)
      } else {
        setToast('Erro ao fazer upload da imagem')
        setTimeout(() => setToast(null), 3000)
      }
    } catch (err) {
      console.error('Erro no upload:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer upload'
      setToast(`Erro: ${errorMessage}`)
      setTimeout(() => setToast(null), 4000)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!member || !validate()) return
    try {
      await updateFamilyMember(member.id, {
        name: name.trim(),
        role: role.trim(),
        email: email.trim() || undefined,
        monthlyIncome: income,
        avatarUrl: avatarUrl || undefined,
      })
      setToast('Perfil atualizado com sucesso!')
      setTimeout(() => setToast(null), 2000)
      onClose()
    } catch (err) {
      console.error('Erro ao atualizar membro:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar alterações. Verifique o console.'
      setToast(`Erro: ${errorMessage}`)
      setTimeout(() => setToast(null), 4000)
    }
  }

  return (
    <ModalWrapper
      open={open && !!member}
      onClose={onClose}
      className="w-full h-full sm:max-h-[90vh] bg-white flex flex-col"
    >
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#C4E703] flex items-center justify-center">
              <Icon name="edit" className="w-7 h-7 text-black" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-heading-xl font-bold text-text-primary">Editar Perfil</h2>
              <p className="text-text-secondary text-sm">
                Atualize as informações do membro da família.
              </p>
            </div>
          </div>
          <Tooltip content="Fechar modal" position="bottom">
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-gray-100"
              aria-label="Fechar modal"
            >
              <Icon name="close" className="w-6 h-6 text-text-primary" />
            </button>
          </Tooltip>
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
                  list="role-suggestions-edit"
                  className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                    errors.role ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Ex: Pai, Mãe, Filho..."
                />
                <datalist id="role-suggestions-edit">
                  {roleSuggestions.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
                {errors.role ? <p className="text-sm text-red-600">{errors.role}</p> : null}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-full border border-border bg-white px-4 text-body text-text-primary outline-none"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="flex flex-col gap-4">
                {avatarUrl && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-text-primary">Preview do Avatar</label>
                    <div className="w-24 h-24 rounded-full border border-border overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img
                        src={avatarUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
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
                    accept="image/png,image/jpeg,image/jpg"
                    className="text-sm text-text-secondary"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      handleFileUpload(file)
                    }}
                  />
                  {uploadProgress && (
                    <span className="text-xs text-text-primary font-medium">{uploadProgress}</span>
                  )}
                  {!uploadProgress && (
                    <span className="text-xs text-text-secondary">
                      {isUploading ? 'Fazendo upload...' : 'Selecione uma imagem para fazer upload'}
                    </span>
                  )}
                </div>
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
          <Tooltip content="Cancelar edição" position="top">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-6 rounded-full border border-border text-text-primary hover:bg-gray-100"
            >
              Cancelar
            </button>
          </Tooltip>
          <Tooltip content="Salvar alterações do perfil" position="top">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading}
              className="h-11 px-6 rounded-full bg-black text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </Tooltip>
        </footer>
      </div>

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </ModalWrapper>
  )
}
